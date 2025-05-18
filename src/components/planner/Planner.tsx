import React, { FC, useCallback, useEffect, useRef, useState, useTransition, memo, useId } from "react";
import CalendarToolbar from "./PlannerToolbar";
import Appointment from "./Appointment";
import { Appointment as AppointmentType, Resource } from "@/models";
import {
  PlannerDataContextProvider,
  usePlannerData,
} from "@/contexts/planner/PlannerDataContext";
import { PlannerProvider, useCalendar } from "@/contexts/planner/PlannerContext";
import { Timeline } from "./Timeline";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import { calculateNewDates, cn, filterAppointments } from "@/utils/utils";
import DropTableCell from "./DropTableCell";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Loading } from "../ui/loading/loading";
import { toast } from "sonner";
import { PlannerTopBar } from "./PlannerTopbar";
import { differenceInMinutes, format, parse } from "date-fns";
import AddAppointmentDialog from "./AddAppointmentDialog";
import { BlockTimeSlotsProps, UpdatedBlockTimeSlotsProps } from "@/models/BlockTimeSlots";
import { useSettings } from "@/hooks/use-settings";
import useWindowSize from "@/hooks/use-window-size";
import { updateBlockedTimeSlot } from "@/services/block-time-slots";


export interface PlannerProps extends React.HTMLAttributes<HTMLDivElement> {
  initialResources: Resource[];
}

const Planner: React.FC<PlannerProps> = ({
  initialResources,
  ...props
}) => {
  return (
    <PlannerProvider>
      <PlannerDataContextProvider
        initialResources={initialResources}
      >
        <PlannerMainComponent
          {...props}
        />

      </PlannerDataContextProvider>
    </PlannerProvider>
  );
};

Planner.displayName = "Planner";

export type PlannerMainComponentProps = React.HTMLAttributes<HTMLDivElement>;


const PlannerMainComponent: FC<PlannerMainComponentProps> = ({ ...props }) => {

  return (
    <div className="flex flex-col relative">
      <PlannerTopBar />
      <div className="mt-14 p-4 bg-neutral-50 dark:bg-background rounded-md"
      // style={{ height: `calc(${(100).toFixed(3)}vh${isMobile ? ' - 30rem' : ' - 3.5rem'})` }}
      >
        {/* <Separator orientation="horizontal" className="!mb-4" /> */}
        <CalendarToolbar />
        <CalendarContent {...props} />
      </div>
    </div>
  );
};

PlannerMainComponent.displayName = "PlannerMainComponent";

type CalendarContentProps = React.HTMLAttributes<HTMLDivElement>
const CalendarContent: React.FC<CalendarContentProps> = ({ ...props }) => {
  const { viewMode, dateRange, timeLabels } = useCalendar();
  const { isMobile } = useWindowSize();
  const {
    resources, appointments, updateAppointment, hourLabels, setBlockedTimeSlots, handleUpdate,
    blockedTimeSlots, setAppointments, isDragging, setIsDragging, isResizing, setIsResizing
  } = usePlannerData();
  const [isOnDropTransitionPending, startOnDropTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnSubmitTransitionPending, startOnSubmitTransition] = useTransition();
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false);
  const [addAppointmentStartDate, setAddAppointmentStartDate] = useState<Date | undefined>(undefined);
  const [tableBodyDimensions, setTableBodyDimensions] = useState<{ width?: number; height?: number } | null>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);


  useEffect(() => {
    if (!tableBodyRef.current) return;
  
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        setTableBodyDimensions({ width, height });
      }
    });
  
    observer.observe(tableBodyRef.current);
  
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll(".handle-ghosting");
 
    const handleDragStart = (event: Event) => {
      const dragEvent = event as DragEvent;
      if (dragEvent.dataTransfer) {
        dragEvent.dataTransfer.setDragImage(document.createElement('div'), 0, 0);
      }
    };
  
    cards.forEach(card => {
      card.addEventListener("dragstart", handleDragStart);
    });
  
    // Cleanup
    return () => {
      cards.forEach(card => {
        card.removeEventListener("dragstart", handleDragStart);
      });
    };
  }, [isLoading, handleUpdate]);

  useEffect(() => {
    setIsLoading(true);
  }, [dateRange])

  useEffect(() => {   
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timeout);  
  }, [isLoading])

  const getTopPositionFromTime = useCallback((timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const [initialHours, initialMinutes] = [(hourLabels[0]?.getHours() || 0), (hourLabels[0]?.getMinutes() || 0)];
    return ((hours * (34 * 2)) + (minutes * 1.12)) - ((initialHours * (34 * 2)) + (initialMinutes * 1.12));
  }, [hourLabels]);

  const updateAppointmentTimes = useCallback(<T extends { id: string; start?: Date; end?: Date }>(
    appointments: T[],
    appointmentId: string,
    newDates: { start: Date; end: Date }
  ): T[] => {
    for (let i = 0; i < appointments.length; i++) {
      const a = appointments[i];
  
      if (a.id !== appointmentId) continue;
  
      const startTime = a.start?.getTime?.();
      const endTime = a.end?.getTime?.();
      const newStartTime = newDates.start?.getTime?.();
      const newEndTime = newDates.end?.getTime?.();
  
      if (startTime === newStartTime && endTime === newEndTime) {
        return appointments;
      }
  
      const updated = [...appointments];
      updated[i] = {
        ...a,
        start: newDates.start,
        end: newDates.end,
      };
  
      return updated;
    }
  
    return appointments;
  }, []);

  const [initialScrollOffset, setInitialScrollOffset] = useState(0);
  const [draggingAppointmentId, setDraggingAppointmentId] = useState<string | null>(null);
  useEffect(() => {
    return monitorForElements({
      async onDragStart({ source, location }) {
        setIsDragging(true);
        setInitialScrollOffset(document.getElementById("calendar-overflow-container")?.scrollTop || 0);
        setDraggingAppointmentId((source.data.appointment as AppointmentType).id)
      },
      async onDrag({ source, location }) {
        const destination = location.current.dropTargets[0]?.data;
        const sourceData = source.data;
        const appointment = sourceData.appointment as AppointmentType & { type: string };
        const appointmentDiv = source.element.closest(".handle-resize") as HTMLElement;
        if (!appointmentDiv) return;

        const calendarOverflowContainer = document.getElementById("calendar-overflow-container");
        const currentScrollOffset = calendarOverflowContainer?.scrollTop || 0;
        const startY = location.initial.input.clientY;
        const currentY = location.current.input.clientY + (currentScrollOffset - initialScrollOffset);
        const slotHeight = 1.134 * 30;
        const deltaY = currentY - startY;
        const slotsCrossed = Math.round(deltaY / slotHeight);
        const minutesMoved = slotsCrossed * 30;

        const newStart = new Date(appointment.start.getTime() + minutesMoved * 60_000);
        const newEnd = new Date(appointment.end.getTime() + minutesMoved * 60_000);

        if (!destination ||
          !sourceData ||
          !appointment ||
          differenceInMinutes(newEnd, newStart) < 30 ||
          newStart.getDate() != new Date(newEnd.getTime() - 60_000).getDate() ||
          newStart.getHours() * 60 + newStart.getMinutes() < hourLabels[0].getHours() * 60 + hourLabels[0].getMinutes()
        ) {
          return;
        }

        const top = getTopPositionFromTime(format(newStart, "HH:mm")) + 2;

        const newDates = calculateNewDates(
          viewMode,
          destination.columnIndex as unknown as number,
          sourceData.columnIndex as unknown as number,
          {
            from: newStart,
            to: newEnd,
          },
        );

        // Scroll 
        const rect = calendarOverflowContainer?.getBoundingClientRect();
        if (calendarOverflowContainer) {
          const container = calendarOverflowContainer;
          if (top - currentScrollOffset > (rect?.height || 0) - 112) {
            container.scrollBy({ top: 34, behavior: 'smooth' });
          }
          if (top - currentScrollOffset < 78) {
            container.scrollBy({ top: -34, behavior: 'smooth' });
          }
        }

        setTimeout(() => {
          appointmentDiv.style.top = `${top}px`
        }, 0)
     
        if (appointment.type === "appointment") {
          setAppointments(prev => updateAppointmentTimes(prev, appointment.id, newDates));
          return;
        }
        if (appointment.type === "other") {
          setBlockedTimeSlots(prev => updateAppointmentTimes(prev, appointment.id, newDates));
        }
      },
      async onDrop({ source, location }) {
        const destination = location.current.dropTargets[0]?.data;
        const sourceData = source.data;
        const appointment = sourceData.appointment as AppointmentType & UpdatedBlockTimeSlotsProps & { type: string };

        const currentScrollOffset = document.getElementById("calendar-overflow-container")?.scrollTop || 0;
        const startY = location.initial.input.clientY;
        const currentY = location.current.input.clientY + (currentScrollOffset - initialScrollOffset);
        const slotHeight = 1.134 * 30;
        const deltaY = currentY - startY;
        const slotsCrossed = Math.round(deltaY / slotHeight);
        const minutesMoved = slotsCrossed * 30;

        const newStart = new Date(appointment.start.getTime() + minutesMoved * 60_000);
        const newEnd = new Date(appointment.end.getTime() + minutesMoved * 60_000);

        if (!destination ||
          !sourceData ||
          !appointment ||
          differenceInMinutes(newEnd, newStart) < 30 ||
          newStart.getDate() != new Date(newEnd.getTime() - 60_000).getDate() ||
          newStart.getHours() * 60 + newStart.getMinutes() < hourLabels[0].getHours() * 60 + hourLabels[0].getMinutes()
        ) {
          setTimeout(() => setIsDragging(false), 2);
          return;
        }

        const newDates = calculateNewDates(
          viewMode,
          destination.columnIndex as unknown as number,
          sourceData.columnIndex as unknown as number,
          {
            from: newStart,
            to: newEnd,
          },
        );

        setTimeout(() => setIsDragging(false), 2);
        
        startOnDropTransition(() => {
          toast.promise(
            async () => {
              if (appointment.type === "appointment") {
                await updateAppointment({
                  ...appointment,
                  start: newDates.start,
                  end: newDates.end,
                  details: {
                    ...appointment.details,
                    payments: appointment.details.payments.map(payment => ({
                      ...payment,
                      sendPaymentLink: false,
                    })),
                  },
                });
              } else {
                await updateBlockedTimeSlot({
                  data: {
                    ...appointment,
                    start: newDates.start,
                    end: newDates.end,
                    day_of_week: appointment.freq !== "period" ? newDates.start.getDay() : null,
                  },
                });
              }
            },
            {
              loading: "Atualizando compromisso...",
              success: "Compromisso atualizado com sucesso!",
              error: "Ocorreu um erro ao atualizar o compromisso. Tente novamente!",
            }
          );
        });
      },
    });
  }, [getTopPositionFromTime, hourLabels, initialScrollOffset, setAppointments, setBlockedTimeSlots, setIsDragging, updateAppointment, updateAppointmentTimes, viewMode]);

  const groupOverlappingAppointments = useCallback((appointments: (AppointmentType | UpdatedBlockTimeSlotsProps)[]) => {
    const clusters: AppointmentType[][] = [];

    function isAppointment(appt: AppointmentType | UpdatedBlockTimeSlotsProps): appt is AppointmentType {
      return (
        appt !== null &&
        typeof appt === 'object' &&
        'start' in appt &&
        'end' in appt &&
        appt.start instanceof Date &&
        appt.end instanceof Date
      );
    }

    for (const appt of appointments) {
      if (!isAppointment(appt)) continue;
      let added = false;

      for (const cluster of clusters) {
        if (
          cluster.some(other =>
            appt.start.getTime() < other.end.getTime() &&
            other.start.getTime() < appt.end.getTime()
          )
        ) {
          cluster.push(appt);
          added = true;
          break;
        }
      }

      if (!added) {
        clusters.push([appt]);
      }
    }

    return clusters;
  }, [])

  const startResizing = useCallback((
    e: React.MouseEvent,
    appointment: AppointmentType & UpdatedBlockTimeSlotsProps & { type: string },
    direction: "top" | "bottom"
  ) => {
    e.preventDefault();

    setIsResizing(true);

    const appointmentDiv = (e.target as HTMLElement).closest(".handle-resize") as HTMLElement;
    if (!appointmentDiv) return;

    const startY = e.clientY;
    const originalStart = new Date(appointment.start);
    const originalEnd = new Date(appointment.end);

    const originalTop = appointmentDiv.offsetTop;
    const originalHeight = appointmentDiv.offsetHeight;

    function onMouseMove(moveEvent: MouseEvent) {
      const deltaY = moveEvent.clientY - startY;
      const slotHeight = 1.134 * 30;
      const slotsCrossed = direction === "bottom" ? Math.ceil(deltaY / slotHeight) : Math.round(deltaY / slotHeight);
      const minutesMoved = slotsCrossed * 30;
      const pixelsMoved = minutesMoved * 1.134;

      let newStart = new Date(originalStart);
      let newEnd = new Date(originalEnd);

      if (direction === "bottom") {
        newEnd = new Date(originalEnd.getTime() + minutesMoved * 60_000);
        if (differenceInMinutes(newEnd, newStart) < 30) return;

        const newHeight = originalHeight + pixelsMoved;

        setTimeout(() => {
          appointmentDiv.style.height = `${newHeight}px`;
        }, 0.1)

      } else {
        newStart = new Date(originalStart.getTime() + minutesMoved * 60_000);
        if (differenceInMinutes(newEnd, newStart) < 30) return;

        const newTop = originalTop + pixelsMoved;
        const newHeight = originalHeight - pixelsMoved;

        setTimeout(() => {
          appointmentDiv.style.top = `${newTop}px`;
          appointmentDiv.style.height = `${newHeight}px`;
        }, 0.1)
      }

      // Preview
      if (appointment.type === "appointment") {
        setAppointments(prev => updateAppointmentTimes(prev, appointment.id, { start: newStart, end: newEnd }));
        return;
      }
      if (appointment.type === "other") {
        setBlockedTimeSlots(prev => updateAppointmentTimes(prev, appointment.id, { start: newStart, end: newEnd }));
      }
    }

    function onMouseUp(moveEvent: MouseEvent) {
      const deltaY = moveEvent.clientY - startY;
      const slotHeight = 1.134 * 30;
      const slotsCrossed = direction === "bottom" ? Math.ceil(deltaY / slotHeight) : Math.round(deltaY / slotHeight);
      const minutesMoved = slotsCrossed * 30;

      let newStart = new Date(originalStart);
      let newEnd = new Date(originalEnd);

      setTimeout(() => setIsResizing(false), 50);

      if (direction === "bottom") {
        newEnd = new Date(originalEnd.getTime() + minutesMoved * 60_000);
        if (differenceInMinutes(newEnd, newStart) < 30) return;
      } else {
        newStart = new Date(originalStart.getTime() + minutesMoved * 60_000);
        if (differenceInMinutes(newEnd, newStart) < 30) return;
      }

      startOnDropTransition(() => {
        toast.promise(
          async () => {
            if (appointment.type === "appointment") {
              await updateAppointment({
                ...appointment,
                start: newStart,
                end: newEnd,
                details: {
                  ...appointment.details,
                  payments: appointment.details.payments.map(payment => ({
                    ...payment,
                    sendPaymentLink: false,
                  })),
                },
              });
            } else {
              await updateBlockedTimeSlot({
                data: {
                  ...appointment,
                  start: newStart,
                  end: newEnd,
                  day_of_week: appointment.freq !== "period" ? newStart.getDay() : null,
                },
              });
            }
          },
          {
            loading: "Atualizando compromisso...",
            success: "Compromisso atualizado com sucesso!",
            error: "Ocorreu um erro ao atualizar o compromisso. Tente novamente!",
          }
        );
      });

      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [setAppointments, setBlockedTimeSlots, setIsResizing, updateAppointment, updateAppointmentTimes])


  const assignAppointmentsToColumns = useCallback((appointments: AppointmentType[]) => {
    const columns: AppointmentType[][] = [];

    for (const appt of appointments) {
      let placed = false;

      for (const column of columns) {
        const hasConflict = column.some(other =>
          appt.start < other.end && appt.end > other.start
        );

        if (!hasConflict) {
          column.push(appt);
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([appt]);
      }
    }

    const apptMap = new Map<AppointmentType, number>();

    columns.forEach((column, columnIndex) => {
      for (const appt of column) {
        apptMap.set(appt, columnIndex);
      }
    });

    return {
      columnsCount: columns.length,
      apptMap,
      columns
    };
  }, [])


  return (appointments &&
    <div
      className="flex flex-col border rounded-md overflow-hidden border-neutral-200 dark:border-neutral-700"
      style={{ height: `calc(${(100).toFixed(3)}vh${isMobile ? ' - 6rem' : ' - 3.5rem'})` }}
    >
      <AddAppointmentDialog className="hidden" open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen} startDate={addAppointmentStartDate} />
      <div className="light-scrollbar dark:dark-scrollbar flex-grow overflow-auto rounded-md bg-transparent" id="calendar-overflow-container">
        <Table>
          <Timeline />
          <TableBody ref={tableBodyRef} className="relative">
            {resources.map((resource) => (
              hourLabels.map((dateTime, rowIndex) => (
                <TableRow key={rowIndex} className={cn("max-h-[34px] min-h-[34px] h-[34px]", isLoading && "hidden")}>
                  <td className="text-center dark:text-neutral-100 border-r !min-w-[50px] w-[50px] !max-w-[50px]">
                    {format(dateTime, 'HH:mm')}
                  </td>

                  {["", ...timeLabels]?.map((label, index) => (
                    timeLabels.length !== index &&
                    <DropTableCell
                      resourceId={resource.id}
                      columnIndex={index}
                      key={index}
                      className={cn(
                        "relative border border-b-0",
                        !isResizing && "dark:[&:hover:not(:has(.handle-resize:hover))]:bg-muted/50 [&:hover:not(:has(.handle-resize:hover))]:bg-neutral-100",
                        isResizing && "cursor-n-resize",
                      )}
                      style={{ minWidth: `${(tableBodyDimensions?.width ? (tableBodyDimensions?.width - 70) / 7 : 0)}px` }}
                      onDoubleClick={(e) => {
                        if (viewMode !== "month") {
                          setIsAddAppointmentOpen(true);
                          const cellDateStr = e.currentTarget.dataset.cellDate;
                          if (cellDateStr) {
                            setAddAppointmentStartDate(new Date(cellDateStr));
                          }
                        }
                      }}
                      data-cell-date={
                        dateRange?.from
                          ? new Date(new Date(new Date(dateRange.from.getTime())
                            .setDate(dateRange.from.getDate() + index))
                            .setHours(dateTime.getHours(), dateTime.getMinutes(), 0, 0))
                          : undefined
                      }
                    >
                      {rowIndex === 0 && (
                        <div
                          className="absolute w-full md:border-b-0 border-t-0"
                          style={{ height: `${tableBodyDimensions?.height}px` }}
                        >
                          {(() => {
                            const visibleAppointments = [...appointments, ...blockedTimeSlots]
                              .sort((a, b) => a?.start?.getTime() - b?.start?.getTime())
                              .filter(
                                (appt) =>
                                  filterAppointments(appt, index, dateRange, viewMode)
                              );

                            const clusters = groupOverlappingAppointments(visibleAppointments);

                            return clusters.flatMap((cluster) => {
                              const { columnsCount, apptMap, columns } = assignAppointmentsToColumns(cluster);
                              return cluster
                                .map((appt) => {
                                  const columnIndex = apptMap.get(appt) ?? 0;
                                  let colSpan = 1;

                                  for (let i = columnIndex + 1; i < columnsCount; i++) {
                                    const nextColumn = columns[i];

                                    const hasConflict = nextColumn.some(other =>
                                      appt.start < other.end && appt.end > other.start
                                    );

                                    if (hasConflict) break;

                                    colSpan++;
                                  }

                                  const widthPercent = (100 / columnsCount) * colSpan;
                                  const leftPercent = (100 / columnsCount) * columnIndex;
                             
                                  return (
                                    <div
                                      className={cn(
                                        "absolute z-10 handle-resize cursor-pointer",
                                        isResizing && "cursor-s-resize",
                                        isDragging && "pointer-events-none",
                                      )}
                                      style={{
                                        top: getTopPositionFromTime(format(appt.start, "HH:mm")) + 2,
                                        width: `${widthPercent}%`,
                                        left: `${leftPercent}%`,
                                        maxWidth: `${widthPercent}%`,
                                        height: `${(1.134 * differenceInMinutes(appt.end, appt.start)) - 4}px`
                                      }}
                                      key={`${appt.id}-${appt.start}`}
                                    >
                                      <div className="relative w-full h-full px-[1px]">
                                        <div
                                          className={cn(
                                            "absolute top-0 left-0 right-0 h-1 w-full bg-transparent z-50",
                                            !isResizing && "cursor-n-resize"
                                          )}
                                          onMouseDown={(e) => isResizing 
                                            ? undefined 
                                            : startResizing(e, appt as AppointmentType & UpdatedBlockTimeSlotsProps & { type: "appointment" | "other" }, "top")}
                                        />
                                        <div
                                          className={cn(
                                            "absolute bottom-0 left-0 right-0 h-1 w-full bg-transparent z-50",
                                            !isResizing && "cursor-s-resize"
                                          )}
                                          onMouseDown={(e) => isResizing 
                                            ? undefined 
                                            : startResizing(e, appt as AppointmentType & UpdatedBlockTimeSlotsProps & { type: "appointment" | "other" }, "bottom")}
                                        />
                                        <Appointment
                                          appointment={appt as AppointmentType & UpdatedBlockTimeSlotsProps & { type: "appointment" | "other" }}
                                          columnIndex={index}
                                          resourceId={resource.id}
                                          className={cn(appt.id === draggingAppointmentId && isDragging && "opacity-50 transition-opacity duration-200 ease-in-out")}
                                        />
                                      </div>
                                    </div>
                                  );
                                })
                            });
                          })()}
                        </div>
                      )}
                    </DropTableCell>
                  ))}
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
        <div className={cn(isLoading && "!flex dark:bg-background bg-neutral-50", "w-full justify-center hidden")}>
          <Loading display={isLoading} className="!scale-[0.5] mt-10" />
        </div>
      </div>
    </div>
  );
};

CalendarContent.displayName = "CalendarContent";

export default Planner;
