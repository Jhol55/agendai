import React, { createContext, useContext, useState, ReactNode, FC, useEffect, useMemo, useRef, useCallback } from "react";
import { AppointmentService, ResourceService } from "@/services/planner/";
import { Appointment, Resource } from "@/models";
import { useCalendar } from "./PlannerContext";

interface DataContextType {
  appointments: Appointment[];
  resources: Resource[];
  handleUpdate: () => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (appointment: Appointment) => void;
  removeAppointment: (id: string) => void;
  addResource: (resource: Resource) => void;
  updateResource: (resource: Resource) => void;
  removeResource: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const PlannerDataContextProvider: FC<{
  children: ReactNode;
  initialResources: Resource[];
}> = ({ children, initialResources }) => {

  const resourceService = useMemo(() => new ResourceService(initialResources), [initialResources]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { dateRange } = useCalendar();
  const [trigger, setTrigger] = useState(false);
  const handleUpdate = useCallback(() => setTrigger(() => !trigger), [trigger]);

  const appointmentServiceRef = useRef(new AppointmentService([]));

  useMemo(() => {
    appointmentServiceRef.current = new AppointmentService(appointments);
  }, [appointments]);

  useEffect(() => {
    let eventSource: EventSource;

    const connect = () => {
      eventSource = new EventSource("/api/sse");

      eventSource.onmessage = (event) => {
        console.log("📩 Nova atualização:", event.data);
        const { ping } = JSON.parse(event?.data);
        if (!ping) {
          handleUpdate()
        }
      };

      eventSource.onerror = () => {
        console.warn("❌ Conexão SSE fechada, tentando reconectar...");
        eventSource.close();

        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => eventSource.close();
  }, [handleUpdate]);


  useEffect(() => {
    if (dateRange) {
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
          }));
          setAppointments(updatedAppointments);
        });
    }
  }, [dateRange, trigger]);

  const contextValue: DataContextType = {
    appointments,
    resources: resourceService.getResources(),
    handleUpdate: handleUpdate,
    addAppointment: async (appointment) => {
      await appointmentServiceRef.current.createAppointment({ appointment });
      // handleUpdate();
    },
    updateAppointment: async (appointment) => {
      await appointmentServiceRef.current.updateAppointment({ updatedAppointment: appointment });
      // handleUpdate();
    },
    removeAppointment: async (id) => {
      await appointmentServiceRef.current.deleteAppointment({ id });
      // handleUpdate();
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
