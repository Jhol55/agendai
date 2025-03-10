import React, { FC, useEffect, useState, useTransition } from "react";
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
    <div className="flex flex-col p-4 relative">
      <PlannerTopBar />
      <div className="mt-14 p-2 bg-white md:h-[87vh] rounded-md">
        <CalendarToolbar />
        <CalendarContent {...props} />
      </div>
    </div>
  );
};

type CalendarContentProps = React.HTMLAttributes<HTMLDivElement>
const CalendarContent: React.FC<CalendarContentProps> = ({ ...props }) => {
  const { viewMode, dateRange, timeLabels } = useCalendar();
  const { resources, appointments, updateAppointment } = usePlannerData();
  const [isPending, startOnDropTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

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

  return (appointments &&
    <div className="flex md:max-h-[calc(88vh_-_theme(spacing.16))] max-h-[calc(81vh_-_theme(spacing.16))] flex-col border rounded-md border-neutral-200 dark:border-neutral-700">
      <div className="light-scrollbar dark:dark-scrollbar flex-grow overflow-auto rounded-md bg-transparent">
        <Table>
          <Timeline />
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id} className={cn(isLoading && "hidden")}>
                {/* <ResourceTableCell resourceItem={resource} /> */}
                {timeLabels?.map((label, index) => (
                  <DropTableCell
                    resourceId={resource.id}
                    columnIndex={index}
                    key={index}
                  >
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
                        <Appointment
                          appointment={appt}
                          columnIndex={index}
                          resourceId={resource.id}
                          key={appt.id}
                        />
                      ))}
                  </DropTableCell>
                ))}
              </TableRow>
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
