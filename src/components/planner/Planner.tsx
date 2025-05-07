import React, { FC, useEffect, useRef, useState, useTransition } from "react";
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
import { DateRange } from "react-day-picker";
import { Loading } from "../ui/loading/loading";
import { toast } from "sonner";
import { PlannerTopBar } from "./PlannerTopbar";
import { Separator } from "../ui/separator";
import { format } from "date-fns";


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

export type PlannerMainComponentProps = React.HTMLAttributes<HTMLDivElement>;

const PlannerMainComponent: FC<PlannerMainComponentProps> = ({ ...props }) => {
  return (
    <div className="flex flex-col relative">
      <PlannerTopBar />
      <div className="mt-14 p-4 bg-white dark:bg-background md:h-[92vh] rounded-md">
        <Separator orientation="horizontal" className="!mb-4" />
        <CalendarToolbar />
        <CalendarContent {...props} />
      </div>
    </div>
  );
};

type CalendarContentProps = React.HTMLAttributes<HTMLDivElement>
const CalendarContent: React.FC<CalendarContentProps> = ({ ...props }) => {
  const { viewMode, dateRange, timeLabels, hourLabels } = useCalendar();
  const { resources, appointments, updateAppointment } = usePlannerData();
  const [isPending, startOnDropTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [tableBodyHeight, setTableBodyHeight] = useState<number | null>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    if (tableBodyRef.current) {
      setTableBodyHeight(tableBodyRef.current.offsetHeight);
    }
  }, [appointments, isLoading])

  useEffect(() => {
    setIsLoading(true);
  }, [dateRange])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 700);
    return () => clearTimeout(timeout);
  }, [appointments])

  useEffect(() => {
    return monitorForElements({
      async onDrop({ source, location }) {
        const destination = location.current.dropTargets[0]?.data;
        const sourceData = source.data;
        const appointment = sourceData.appointment as AppointmentType

        if (!destination || !sourceData || !appointment) return;

        const newResource = resources.find(
          (res) => res.id === destination.resourceId,
        );
        if (!newResource) return;

        const newDates = calculateNewDates(
          viewMode,
          destination.columnIndex as unknown as number,
          sourceData.columnIndex as unknown as number,
          {
            from: appointment.start,
            to: appointment.end,
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
                    resourceId: newResource.id,
                  }));
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
  }, [appointments, resources, updateAppointment, viewMode]);

  function getTopPositionFromTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return (hours * (34 * 2)) + (minutes * 1.12);
  }

  return (appointments &&
    <div className="flex md:max-h-[calc(88vh_-_theme(spacing.16))] max-h-[calc(81vh_-_theme(spacing.16))] flex-col border rounded-md border-neutral-200 dark:border-neutral-700">
      <div className="light-scrollbar dark:dark-scrollbar flex-grow overflow-auto rounded-md bg-transparent">
        <Table>
          <Timeline />
          <TableBody ref={tableBodyRef}>
            {resources.map((resource) => (
              hourLabels.map((hour, rowIndex) => (
                <TableRow key={resource.id} className={cn("max-h-[34px] min-h-[34px] h-[34px]" ,isLoading && "hidden")}>
                  <td className="text-center dark:text-neutral-200/80">{format(hour, 'HH:mm')}</td>
                  {/* <ResourceTableCell resourceItem={resource} /> */}
                  {["", ...timeLabels]?.map((label, index) => (
                    timeLabels.length !== index &&
                    <DropTableCell
                      resourceId={resource.id}
                      columnIndex={index}
                      key={index}
                      className="relative hover:bg-muted/50"
                    >
                      {rowIndex === 0 &&
                        <td className="absolute w-full border md:border-b-0 border-t-0" style={{ height: `${tableBodyHeight}px` }}>
                          <div className="relative h-full w-full">
                            {appointments
                              .filter(
                                (appt) =>
                                  filterAppointments(
                                    appt,
                                    index,
                                    dateRange,
                                    viewMode,
                                  ) && appt.resourceId === resource.id,
                              )
                              .sort((a, b) => a.start.getTime() - b.start.getTime())
                              .map((appt) => (
                                <div
                                  className="absolute z-10 left-[1px] w-[99%] max-w-[99%]"
                                  style={{ top: getTopPositionFromTime(format(appt.start, 'HH:mm')) + 2 }}
                                  key={appt.id}
                                >
                                  <Appointment
                                    appointment={appt}
                                    columnIndex={index}
                                    resourceId={resource.id}
                                  />
                                </div>
                              ))}
                          </div>
                        </td>}
                    </DropTableCell>
                  ))}
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
        <div className={cn(isLoading && "!flex bg-background", "w-full !justify-center hidden")}>
          <Loading display={isLoading} className="!scale-[0.5]" />
        </div>
      </div>
    </div>
  );
};

export default Planner;
