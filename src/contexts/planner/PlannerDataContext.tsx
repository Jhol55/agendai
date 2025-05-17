import React, { createContext, useContext, useState, ReactNode, FC, useEffect, useMemo, useRef, useCallback, Dispatch, SetStateAction } from "react";
import { AppointmentService, ResourceService } from "@/services/planner/";
import { Appointment, Resource } from "@/models";
import { useCalendar } from "./PlannerContext";
import { subscribe } from "@/database/realtime";
import { getOperatingHours } from "@/services/operatingHours";
import { eachMinuteOfInterval, format, formatISO, isBefore, startOfDay } from "date-fns";
import { getMinMaxCalendarRange, parseSafeDate } from "@/utils/utils";
import { OperatingHoursProps } from "@/models/OperatingHours";
import { getBlockedTimeSlots } from "@/services/block-time-slots";
import { BlockTimeSlotsProps, UpdatedBlockTimeSlotsProps } from "@/models/BlockTimeSlots";
import { parseISO, isSameDay, addDays, differenceInCalendarDays } from 'date-fns';

interface DataContextType {
  appointments: Appointment[];
  setAppointments: Dispatch<SetStateAction<Appointment[]>>;
  operatingHours: OperatingHoursProps[];
  blockedTimeSlots: UpdatedBlockTimeSlotsProps[];
  setBlockedTimeSlots: Dispatch<SetStateAction<UpdatedBlockTimeSlotsProps[]>>;
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
  const [hourLabels, setHourLabels] = useState<Date[]>([]);
  const { dateRange } = useCalendar();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const handleUpdate = useCallback(() => setTrigger(() => !trigger), [trigger]);

  const appointmentServiceRef = useRef(new AppointmentService([]));

  useMemo(() => {
    if (!isDragging && !isResizing) {
      appointmentServiceRef.current = new AppointmentService(appointments);
    }
  }, [appointments, isDragging, isResizing]);

  useEffect(() => {
    if (dateRange && !isResizing && !isDragging) {
      appointmentServiceRef.current
        .getInitialAppointments({
          from: dateRange.from?.toISOString(),
          to: dateRange.to?.toISOString(),
        })
        .then((data) => {
          const updatedAppointments = data?.map((appointment: Appointment) => ({
            ...appointment,
            start: new Date(appointment.start),
            end: new Date(appointment.end),
            type: "appointment"
          }));
          setAppointments(updatedAppointments);
        });
    }
  }, [dateRange, isDragging, isResizing, trigger]);

  const getDateForWeekdayInRange = useCallback((
    dayOfWeek?: number, // 0 (Sunday) to 6 (Saturday)
    rangeStart?: Date,
    rangeEnd?: Date,
    dateTime?: Date
  ): Date | null => {
    if (!rangeStart || !rangeEnd || !dateTime) return null;
    const current = new Date(rangeStart);

    while (current <= rangeEnd) {
      if (current.getDay() === dayOfWeek) {
        return new Date(new Date(current).setHours(dateTime.getHours(), dateTime.getMinutes(), 0, 0));
      }
      current.setDate(current.getDate() + 1);
    }
    return null;
  }, []);

  function splitMultiTimeSlots({ slots, minTime, maxTime }: { slots: BlockTimeSlotsProps[], minTime?: string, maxTime?: string }) {
    const MS_IN_DAY = 24 * 60 * 60 * 1000;
    const result: BlockTimeSlotsProps[] = [];


    for (const slot of slots) {
      const startDate = new Date(slot.start);
      const endDate = new Date(slot.end);

      if (
        startDate.getUTCFullYear() === endDate.getUTCFullYear() &&
        startDate.getUTCMonth() === endDate.getUTCMonth() &&
        startDate.getUTCDate() === endDate.getUTCDate()
      ) {
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
  }

  //CORRIGIR QUANDO COLOCA HORA DE FUNCIONAMENTO 00:00 E ADICIONAR MUDANÇA DE COLUNA QUANDO É DE UM DIA PARA OUTRO IGUAL DO OTHER
  useEffect(() => {
    if (!isDragging && !isResizing) {
      getOperatingHours({}).then((data) => {
        const operatingHoursRange = getMinMaxCalendarRange(data);
        const appointmentsRange = getMinMaxCalendarRange(appointments);

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
      });

      getBlockedTimeSlots({}).then((data) => {
        const formattedTimeSlots = splitMultiTimeSlots({
          slots: data,
          minTime: hourLabels.length // Visual only
            ? format(hourLabels[0], "HH:mm")
            : undefined,
          maxTime: hourLabels.length // Visual only
            ? format(hourLabels[hourLabels.length - 1], "HH:mm")
            : undefined
        });

        setBlockedTimeSlots(
          formattedTimeSlots.map((slot) => ({
            ...slot,
            type: "other",
            start: slot.freq === "weekly"
              ? getDateForWeekdayInRange(slot.day_of_week, dateRange?.from, dateRange?.to, new Date(slot.start)) ?? new Date(slot.start)
              : new Date(slot.start),
            end: slot.freq === "weekly"
              ? getDateForWeekdayInRange(slot.day_of_week, dateRange?.from, dateRange?.to, new Date(slot.end)) ?? new Date(slot.end)
              : new Date(slot.end),
            original_start: parseSafeDate(slot.original_start),
            original_end: parseSafeDate(slot.original_end),
          })));
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, getDateForWeekdayInRange, isDragging, isResizing, trigger]);

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
