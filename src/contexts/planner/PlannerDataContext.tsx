import React, { createContext, useContext, useState, ReactNode, FC, useEffect, useMemo, useRef, useCallback, Dispatch, SetStateAction } from "react";
import { AppointmentService, getSettings, ResourceService } from "@/services/planner/";
import { Appointment, NewAppointment, Resource } from "@/models";
import { useCalendar } from "./PlannerContext";
import { subscribe } from "@/database/realtime";
import { getOperatingHours } from "@/services/operatingHours";
import { addDays, addMonths, addWeeks, eachMinuteOfInterval, format, formatISO, isAfter, isBefore, isSameDay, setDay, setHours, setMinutes, startOfDay } from "date-fns";
import { getDateInRange, getMinMaxCalendarRange, parseSafeDate } from "@/utils/utils";
import { OperatingHoursProps } from "@/models/OperatingHours";
import { getBlockedTimeSlots } from "@/services/block-time-slots";
import { BlockTimeSlotsProps, UpdatedBlockTimeSlotsProps } from "@/models/BlockTimeSlots";
import { CalendarType } from "@/components/calendars/CalendarList";
import { getCalendars } from "@/services/calendars";
import { SettingsState } from "../settings/SettingsContext.type";


interface DataContextType {
  appointments: Appointment[];
  setAppointments: Dispatch<SetStateAction<Appointment[]>>;
  operatingHours: OperatingHoursProps[];
  blockedTimeSlots: UpdatedBlockTimeSlotsProps[];
  setBlockedTimeSlots: Dispatch<SetStateAction<UpdatedBlockTimeSlotsProps[]>>;
  currentCalendarId: string | undefined;
  setCurrentCalendarId: Dispatch<SetStateAction<string | undefined>>;
  accountId: string | undefined;
  setAccountId: Dispatch<SetStateAction<string | undefined>>;
  calendars: CalendarType[];
  setCalendars: Dispatch<SetStateAction<CalendarType[]>>;
  settings: SettingsState;
  setSettings: Dispatch<SetStateAction<SettingsState>>;
  isDragging: boolean;
  isResizing: boolean;
  setIsDragging: Dispatch<SetStateAction<boolean>>;
  setIsResizing: Dispatch<SetStateAction<boolean>>;
  resources: Resource[];
  handleUpdate: () => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (appointment: Appointment) => void;
  removeAppointment: (id: string) => void;
  getAppointmentById: (id: number) => Promise<unknown>;
  addResource: (resource: Resource) => void;
  updateResource: (resource: Resource) => void;
  removeResource: (id: string) => void;
  hourLabels: Date[]
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const PlannerDataContextProvider: FC<{
  children: ReactNode;
  initialResources: Resource[];
}> = ({ children, initialResources }) => {

  const resourceService = useMemo(() => new ResourceService(initialResources), [initialResources]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [operatingHours, setOperatingHours] = useState<OperatingHoursProps[]>([]);
  const [blockedTimeSlots, setBlockedTimeSlots] = useState<UpdatedBlockTimeSlotsProps[]>([])
  const [currentCalendarId, setCurrentCalendarId] = useState<string | undefined>(undefined);
  const [settings, setSettings] = useState<SettingsState | undefined>(undefined);
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [accountId, setAccountId] = useState<string | undefined>(undefined);
  const [hourLabels, setHourLabels] = useState<Date[]>([]);
  const { dateRange } = useCalendar();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const handleUpdate = useCallback(() => setTrigger(() => !trigger), [trigger]);

  const appointmentServiceRef = useRef(new AppointmentService([]));

  const splitMultiTimeSlots = useCallback(<T extends BlockTimeSlotsProps & Appointment>({
    slots,
    minTime,
    maxTime,
  }: { slots: T[]; minTime?: string; maxTime?: string }) => {
    const MS_IN_DAY = 24 * 60 * 60 * 1000;
    const result: T[] = [];

    if (slots?.[0] && Object.keys(slots[0]).length === 0) return []

    for (const slot of slots) {
      const startDate = new Date(slot.start);
      const endDate = new Date(slot.end);

      if (isSameDay(startDate, endDate)) {
        result.push({ ...slot });
        continue;
      }

      const currentStart = startDate;
      let currentEnd = new Date(Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate() + 1,
        new Date(0, 0, 0, 0).getUTCHours(), 0, 0
      ));

      const [minHours, minMinutes] = minTime?.split(":").map(Number) ?? [];
      const [maxHours, maxMinutes] = maxTime?.split(":").map(Number) ?? [];
      let minDateTime = new Date(new Date(currentStart).setHours(minHours, minMinutes));
      let maxDateTime = new Date(new Date(currentStart).setHours(maxHours, maxMinutes + 30));
      let start = currentStart.getTime() < maxDateTime.getTime() ? maxDateTime : currentStart
      let end = currentEnd.getTime() > maxDateTime.getTime() ? maxDateTime : currentEnd

      result.push({
        ...slot,
        id: slot.id,
        start: currentStart.toISOString(),
        end: end.toISOString(),
        original_start: slot.start,
        original_end: slot.end
      });

      while (currentEnd.getTime() + MS_IN_DAY <= endDate.getTime()) {
        const nextStart = new Date(currentEnd.getTime());
        const nextEnd = new Date(currentEnd.getTime() + MS_IN_DAY);

        minDateTime = new Date(new Date(nextStart).setHours(minHours, minMinutes));
        maxDateTime = new Date(new Date(nextStart).setHours(maxHours, maxMinutes + 30));
        start = nextStart.getTime() < minDateTime.getTime() ? minDateTime : nextStart
        end = nextEnd.getTime() > maxDateTime.getTime() ? maxDateTime : nextEnd

        result.push({
          ...slot,
          id: slot.id,
          start: start.toISOString(),
          end: end.toISOString(),
          original_start: slot.start,
          original_end: slot.end
        });

        currentEnd = nextEnd;
      }

      if (currentEnd.getTime() < endDate.getTime()) {
        minDateTime = new Date(new Date(currentEnd).setHours(minHours, minMinutes));
        maxDateTime = new Date(new Date(endDate).setHours(maxHours, maxMinutes + 30));
        start = currentEnd.getTime() < minDateTime.getTime() ? minDateTime : currentEnd
        end = endDate.getTime() > maxDateTime.getTime() ? maxDateTime : endDate

        result.push({
          ...slot,
          id: slot.id,
          start: start.toISOString(),
          end: end.toISOString(),
          original_start: slot.start,
          original_end: slot.end
        });
      }
    }

    return result;
  }, [])

  

  useEffect(() => {
    if (currentCalendarId !== undefined) {
      getSettings({ id: currentCalendarId }).then(setSettings)
    }
  }, [currentCalendarId, trigger])


  useEffect(() => {
    if (!dateRange || accountId === undefined) return;

    getCalendars({ id: accountId }).then(setCalendars);

    if (currentCalendarId === undefined) return;

    appointmentServiceRef.current //PASSAR O CALENDARINDEX AQUI PARA SELECIONAR OS APPOINTMENTS
      .getInitialAppointments({
        from: dateRange?.from?.toISOString(),
        to: dateRange?.to?.toISOString(),
        id: currentCalendarId
      })
      .then((data) => {
        const expandedAppointments = splitMultiTimeSlots({ slots: data })
          .filter(appointment => {
            if (!dateRange?.from || !dateRange?.to) return false;
            const start = new Date(appointment.start).getTime();
            return start >= dateRange.from.getTime() && start <= dateRange.to.getTime();
          });

        const updatedAppointments = expandedAppointments?.map((appointment: Appointment) => ({
          ...appointment,
          start: new Date(appointment.start),
          end: new Date(appointment.end),
          type: "appointment",
          original_start: parseSafeDate(appointment.original_start),
          original_end: parseSafeDate(appointment.original_end),
        }))

        setAppointments(updatedAppointments);
        appointmentServiceRef.current = new AppointmentService(updatedAppointments);

        getOperatingHours({}).then((data) => {
          const operatingHoursRange = getMinMaxCalendarRange(data);
          const appointmentsRange = getMinMaxCalendarRange(updatedAppointments);

          if (!operatingHoursRange.min || !operatingHoursRange.max) return;

          const min = operatingHoursRange?.min.getTime() < (appointmentsRange.min?.getTime() ?? Infinity)
            ? operatingHoursRange.min : appointmentsRange.min;
          const max = operatingHoursRange?.max.getTime() > (appointmentsRange.max?.getTime() ?? -Infinity)
            ? operatingHoursRange.max : appointmentsRange.max;

          if (!min || !max) return;

          const interval = eachMinuteOfInterval(
            {
              start: new Date(min),
              end: new Date(max),
            },
            { step: 30 }
          ).slice(0, -1);

          setOperatingHours(data);
          setHourLabels(interval);

          getBlockedTimeSlots({ id: currentCalendarId }).then((data) => {
            const expandedBlockedTimeSlots = splitMultiTimeSlots({
              slots: data,
              minTime: interval?.length // Visual only
                ? format(interval[0], "HH:mm")
                : undefined,
              maxTime: interval?.length // Visual only
                ? format(interval[interval.length - 1], "HH:mm")
                : undefined
            });

            if (!dateRange) return;

            setBlockedTimeSlots(
              expandedBlockedTimeSlots.flatMap((slot) => {
                const startDates = getDateInRange({
                  rangeStart: dateRange?.from,
                  rangeEnd: dateRange?.to,
                  dateTime: new Date(slot.start),
                  options: {
                    frequency: slot.freq,
                    interval: slot.interval,
                  },
                });

                const endDates = getDateInRange({
                  rangeStart: dateRange?.from,
                  rangeEnd: dateRange?.to,
                  dateTime: new Date(slot.end),
                  options: {
                    frequency: slot.freq,
                    interval: slot.interval,
                  },
                });

                console.log(expandedBlockedTimeSlots)

                return startDates?.map((startDate, index) => ({
                  ...slot,
                  type: "other",
                  start: startDate,
                  end: endDates?.[index] ?? startDate,
                  original_start: parseSafeDate(slot.start),
                  original_end: parseSafeDate(slot.end),
                })) ?? [];
              })
            );

          });
        });
      })

  }, [accountId, currentCalendarId, dateRange, splitMultiTimeSlots, trigger]);

  useEffect(() => {
    const AppointmentSubscription = subscribe({
      channel: "appointments",
      table: "appointments",
      onChange: (payload) => {
        const newAppointment = payload.new as { created_by: string };
        if (newAppointment.created_by !== "user") {
          setTimeout(() => handleUpdate(), 1000)
        }
      }
    })
    const PaymentsSubscription = subscribe({
      channel: "payments",
      table: "payments",
      onChange: (payload) => setTimeout(() => handleUpdate(), 1000)
    })

    return () => {
      AppointmentSubscription.unsubscribe()
      PaymentsSubscription.unsubscribe()
    }
  }, [handleUpdate])

  const contextValue: DataContextType = {
    appointments,
    setAppointments,
    operatingHours,
    blockedTimeSlots,
    setBlockedTimeSlots,
    currentCalendarId,
    setCurrentCalendarId,
    accountId,
    setAccountId,
    calendars,
    setCalendars,
    settings,
    setSettings,
    hourLabels,
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing,
    resources: resourceService.getResources(),
    handleUpdate: handleUpdate,
    addAppointment: async (appointment) => {
      await appointmentServiceRef.current.createAppointment({ appointment });
      handleUpdate();
    },
    updateAppointment: async (appointment) => {
      await appointmentServiceRef.current.updateAppointment({ updatedAppointment: appointment });
      handleUpdate();
    },
    removeAppointment: async (id) => {
      await appointmentServiceRef.current.deleteAppointment({ id });
      handleUpdate();
    },
    getAppointmentById: async (id) => {
      return appointmentServiceRef.current.getAppointmentById({ id });
    },
    addResource: (resource) => {
      resourceService.addResource(resource);
      handleUpdate();
    },
    updateResource: (resource) => {
      resourceService.updateResource(resource);
      handleUpdate();
    },
    removeResource: (id) => {
      resourceService.removeResource(id);
      handleUpdate();
    },
  };

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

export const usePlannerData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("usePlannerData must be used within a PlannerDataContextProvider");
  }
  return context;
};
