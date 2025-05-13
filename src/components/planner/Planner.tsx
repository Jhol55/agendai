import React, { FC, useCallback, useEffect, useRef, useState, useTransition, memo } from "react";
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
import { Separator } from "../ui/separator";
import { differenceInMinutes, format, parse } from "date-fns";
import AddAppointmentDialog from "./AddAppointmentDialog";
import { BlockTimeSlotsProps, UpdatedBlockTimeSlotsProps } from "@/models/BlockTimeSlots";


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
      <div className="mt-14 p-4 bg-neutral-50 dark:bg-background md:h-[92vh] rounded-md">
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
  const {
    resources, appointments, updateAppointment, hourLabels, handleUpdate,
    blockedTimeSlots, setAppointments, isDragging, setIsDragging, isResizing, setIsResizing
  } = usePlannerData();
  const [isOnDropTransitionPending, startOnDropTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnSubmitTransitionPending, startOnSubmitTransition] = useTransition();
  // const [timeMarkerTopPosition, setTimeMarkerTopPosition] = useState<number>(0);
  const [isAddAppointmentOpen, setIsAddAppointmentOpen] = useState(false);
  const [addAppointmentStartDate, setAddAppointmentStartDate] = useState<Date | undefined>(undefined);
  const [tableBodyDimensions, setTableBodyDimensions] = useState<{ width?: number; height?: number } | null>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    if (!isDragging && !isResizing) {
      if (tableBodyRef.current) {
        setTableBodyDimensions({
          width: tableBodyRef.current.offsetWidth,
          height: tableBodyRef.current.offsetHeight
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, appointments, hourLabels])

  useEffect(() => {
    if (!isDragging && !isResizing) {
    const timeout = setTimeout(() => {
      const cards = document.querySelectorAll(".handle-ghosting");

      function handleDragStart(event: Event) {
        const dragEvent = event as DragEvent;
        if (dragEvent?.dataTransfer) {
          dragEvent.dataTransfer.setDragImage(document.createElement('div'), 0, 0);
        }
      }

      cards.forEach(card => {
        card.addEventListener("dragstart", handleDragStart);
      });

      return () => {
        cards.forEach(card => {
          card.removeEventListener("dragstart", handleDragStart);
        });
      };
    }, 500);

    return () => clearTimeout(timeout);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments]);

  useEffect(() => {
    setIsLoading(true);
  }, [dateRange])

  useEffect(() => {
    if (!isDragging && !isResizing) {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments])

  const getTopPositionFromTime = useCallback((timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const [initialHours, initialMinutes] = [(hourLabels[0]?.getHours() || 0), (hourLabels[0]?.getMinutes() || 0)];
    return ((hours * (34 * 2)) + (minutes * 1.12)) - ((initialHours * (34 * 2)) + (initialMinutes * 1.12));
  }, [hourLabels]);

  useEffect(() => {
    return monitorForElements({
      async onDragStart({ source }) {
        setIsDragging(true);       
      },
      async onDrag({ source, location}) {
        const destination = location.current.dropTargets[0]?.data;
        const sourceData = source.data;
        const appointment = sourceData.appointment as AppointmentType;
        const appointmentDiv = source.element.closest(".handle-resize") as HTMLElement;
        if (!appointmentDiv) return;

        const startY = location.initial.input.clientY;
        const currentY = location.current.input.clientY;
        const slotHeight = 1.134 * 30;
        const deltaY = currentY - startY;
        const slotsCrossed = Math.round(deltaY / slotHeight);
        const minutesMoved = slotsCrossed * 30;

        if (!destination || !sourceData || !appointment) {
          setTimeout(() => setIsDragging(false), 2);
          return;
        }

        const newStart = new Date(appointment.start.getTime() + minutesMoved * 60_000);
        const newEnd = new Date(appointment.end.getTime() + minutesMoved * 60_000);

        const newDates = calculateNewDates(
          viewMode,
          destination.columnIndex as unknown as number,
          sourceData.columnIndex as unknown as number,
          {
            from: newStart,
            to: newEnd,
          },
        );
        
        const top = getTopPositionFromTime(format(newStart, "HH:mm")) + 2;
        appointmentDiv.style.top = `${top}px`

        // Preview
        setAppointments(prev => {
          for (let i = 0; i < prev.length; i++) {
            const a = prev[i];

            if (a.id !== appointment.id) continue;

            const startTime = a.start?.getTime?.();
            const endTime = a.end?.getTime?.();
            const newStartTime = newDates.start?.getTime?.();
            const newEndTime = newDates.end?.getTime?.();

            if (startTime === newStartTime && endTime === newEndTime) {
              return prev;
            }

            const updated = [...prev];
            updated[i] = {
              ...a,
              start: newDates.start,
              end: newDates.end,
            };

            return updated;
          }

          return prev;
        });
      },
      async onDrop({ source, location }) {
        const destination = location.current.dropTargets[0]?.data;
        const sourceData = source.data;
        const appointment = sourceData.appointment as AppointmentType;

        const startY = location.initial.input.clientY;
        const currentY = location.current.input.clientY;
        const slotHeight = 1.134 * 30;
        const deltaY = currentY - startY;
        const slotsCrossed = Math.round(deltaY / slotHeight);
        const minutesMoved = slotsCrossed * 30;

        setTimeout(() => setIsDragging(true), 1);

        if (!destination || !sourceData || !appointment) {
          setTimeout(() => setIsDragging(false), 2);
          return;
        }

        const newDates = calculateNewDates(
          viewMode,
          destination.columnIndex as unknown as number,
          sourceData.columnIndex as unknown as number,
          {
            from: new Date(appointment.start.getTime() + minutesMoved * 60_000),
            to: new Date(appointment.end.getTime() + minutesMoved * 60_000),
          },
        );

        startOnDropTransition(() => {
          toast.promise(
            () =>
              new Promise((resolve) => {
                resolve(
                  updateAppointment({
                    ...appointment,
                    start: newDates.start as Date,
                    end: newDates.end as Date,
                    details: {
                      ...appointment.details,
                      payments: appointment.details.payments.map(payment => ({
                        ...payment, sendPaymentLink: false
                      }))
                    },
                  }))
              }).then(() => {
                setIsDragging(false);
              }),
            {
              loading: "Atualizando compromisso...",
              success: "Compromisso atualizado com sucesso!",
              error: "Ocorreu um erro ao atualizar o compromisso. Tente novamente!",
            },
          );
        });
      },
    });
  }, [getTopPositionFromTime, resources, setAppointments, setIsDragging, updateAppointment, viewMode]);

  const groupOverlappingAppointments = useCallback((appointments: (AppointmentType | BlockTimeSlotsProps)[]) => {
    const clusters: AppointmentType[][] = [];

    function isAppointment(appt: AppointmentType | BlockTimeSlotsProps): appt is AppointmentType {
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
    appointment: AppointmentType,
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
      setAppointments(prev => {
        for (let i = 0; i < prev.length; i++) {
          const a = prev[i];

          if (a.id !== appointment.id) continue;

          const startTime = a.start?.getTime?.();
          const endTime = a.end?.getTime?.();
          const newStartTime = newStart.getTime?.();
          const newEndTime = newEnd.getTime?.();

          if (startTime === newStartTime && endTime === newEndTime) {
            return prev;
          }

          const updated = [...prev];
          updated[i] = {
            ...a,
            start: newStart,
            end: newEnd,
          };

          return updated;
        }

        return prev;
      });
    }

    function onMouseUp(moveEvent: MouseEvent) {
      const deltaY = moveEvent.clientY - startY;
      const slotHeight = 1.134 * 30;
      const slotsCrossed = direction === "bottom" ? Math.ceil(deltaY / slotHeight) : Math.round(deltaY / slotHeight);
      const minutesMoved = slotsCrossed * 30;

      let newStart = new Date(originalStart);
      let newEnd = new Date(originalEnd);

      if (direction === "bottom") {
        newEnd = new Date(originalEnd.getTime() + minutesMoved * 60_000);
        if (differenceInMinutes(newEnd, newStart) < 30) return;
      } else {
        newStart = new Date(originalStart.getTime() + minutesMoved * 60_000);
        if (differenceInMinutes(newEnd, newStart) < 30) return;
      }

      startOnSubmitTransition(() => {
        toast.promise(
          () =>
            new Promise((resolve) => {
              resolve(
                updateAppointment({
                  ...appointment,
                  start: newStart,
                  end: newEnd,
                }));
            }).then(() => {
              setIsResizing(false);
            }),
          {
            loading: "Atualizando compromisso...",
            success: "Compromisso atualizado com sucesso!",
            error: "Ocorreu um erro ao atualizar o compromisso. Tente novamente!",
          },
        );
      })

      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [setAppointments, setIsResizing, updateAppointment])


  // useEffect(() => {
  //   setTimeMarkerTopPosition(
  //     getTopPositionFromTime(new Date().toTimeString().slice(0, 5))
  //   );

  //   const getTimeUntilNextInterval = (intervalMinutes: number) => {
  //     const now = new Date();
  //     const minutes = now.getMinutes();
  //     const seconds = now.getSeconds();
  //     const milliseconds = now.getMilliseconds();
  //     const nextInterval = intervalMinutes - (minutes % intervalMinutes);
  //     return (nextInterval * 60 * 1000) - (seconds * 1000 + milliseconds);
  //   };

  //   const intervalMinutes = 1;
  //   const timeUntilNext = getTimeUntilNextInterval(intervalMinutes);

  //   let intervalId: ReturnType<typeof setInterval>;
  //   const timeoutId = setTimeout(() => {
  //     setTimeMarkerTopPosition(
  //       getTopPositionFromTime(new Date().toTimeString().slice(0, 5))
  //     );

  //     intervalId = setInterval(() => {
  //       setTimeMarkerTopPosition(
  //         getTopPositionFromTime(new Date().toTimeString().slice(0, 5))
  //       );
  //       handleUpdate();
  //     }, intervalMinutes * 60 * 1000);
  //   }, timeUntilNext);

  //   return () => {
  //     clearTimeout(timeoutId);
  //     if (intervalId) clearInterval(intervalId);
  //   };
  // }, [handleUpdate, getTopPositionFromTime]);

  return (appointments &&
    <div className="flex md:max-h-[calc(88vh_-_theme(spacing.16))] max-h-[calc(81vh_-_theme(spacing.16))] flex-col border rounded-md border-neutral-200 dark:border-neutral-700 bg-neutral-00">
      <AddAppointmentDialog className="hidden" open={isAddAppointmentOpen} onOpenChange={setIsAddAppointmentOpen} startDate={addAppointmentStartDate} />
      <div className="light-scrollbar dark:dark-scrollbar flex-grow overflow-auto rounded-md bg-transparent">
        <Table>
          <Timeline />
          <TableBody ref={tableBodyRef} className="relative">
            {resources.map((resource) => (
              hourLabels.map((dateTime, rowIndex) => (
                <TableRow key={rowIndex} className={cn("max-h-[34px] min-h-[34px] h-[34px]", isLoading && "hidden")}>
                  <td className="text-center dark:text-neutral-100 border-r !min-w-[50px] w-[50px] !max-w-[50px]">
                    {format(dateTime, 'HH:mm')}
                    {/* {rowIndex === 0 &&
                      <div
                        className={cn(
                          "absolute w-[calc(100%-50px)] left-[50px] border-t border-red-500",
                          tableBodyDimensions?.height && timeMarkerTopPosition > tableBodyDimensions?.height && "hidden"
                        )}
                        style={{
                          top: timeMarkerTopPosition
                        }}
                      >
                      </div>} */}
                  </td>

                  {["", ...timeLabels]?.map((label, index) => (
                    timeLabels.length !== index &&
                    <DropTableCell
                      resourceId={resource.id}
                      columnIndex={index}
                      key={index}
                      className={cn(
                        "relative",
                        !isResizing && "[&:hover:not(:has(.handle-resize:hover))]:bg-muted/50",
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
                          className="absolute w-full border-r md:border-b-0 border-t-0"
                          style={{ height: `${tableBodyDimensions?.height}px` }}
                        >
                          {(() => {
                            const visibleAppointments = [...appointments, ...blockedTimeSlots]
                              .sort((a, b) => a.start.getTime() - b.start.getTime())
                              .filter(
                                (appt) =>
                                  filterAppointments(appt, index, dateRange, viewMode)
                              );

                            const clusters = groupOverlappingAppointments(visibleAppointments);

                            return clusters.flatMap((cluster) =>
                              cluster
                                .sort((a, b) => a?.title?.localeCompare(b?.title))
                                .map((appt, position) => {
                                  const widthPercent = 100 / cluster.length;
                                  const leftPercent = widthPercent * position;

                                  return (
                                    <div
                                      className={cn(
                                        "absolute z-10 handle-resize cursor-pointer",
                                        isResizing && "cursor-s-resize",
                                        isDragging && "pointer-events-none"
                                      )}
                                      style={{
                                        top: getTopPositionFromTime(format(appt.start, "HH:mm")) + 2,
                                        width: `${widthPercent}%`,
                                        left: `${leftPercent}%`,
                                        maxWidth: `${widthPercent}%`,
                                        height: `${(1.134 * differenceInMinutes(appt.end, appt.start)) - 4}px`
                                      }}
                                      key={appt.id}
                                    >
                                      <div className="relative w-full h-full px-[1px]">
                                        <div
                                          className={cn(
                                            "absolute top-0 left-0 right-0 h-1 w-full bg-transparent z-50",
                                            !isResizing && "cursor-n-resize"
                                          )}
                                          onMouseDown={(e) => isResizing ? undefined : startResizing(e, appt, "top")}
                                        />
                                        <div
                                          className={cn(
                                            "absolute bottom-0 left-0 right-0 h-1 w-full bg-transparent z-50",
                                            !isResizing && "cursor-s-resize"
                                          )}
                                          onMouseDown={(e) => isResizing ? undefined : startResizing(e, appt, "bottom")}
                                        />
                                        <Appointment
                                          appointment={appt as AppointmentType & UpdatedBlockTimeSlotsProps}
                                          columnIndex={index}
                                          resourceId={resource.id}
                                        />
                                      </div>
                                    </div>
                                  );
                                })
                            );
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
        <div className={cn(isLoading && "!flex dark:bg-background bg-neutral-50", "w-full justify-center items-center hidden")}>
          <Loading display={isLoading} className="!scale-[0.5]" />
        </div>
      </div>
    </div>
  );
};

CalendarContent.displayName = "CalendarContent";

export default Planner;
