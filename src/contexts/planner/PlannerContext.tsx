import React, { createContext, useContext, useState, useMemo } from "react";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { DateRange } from "react-day-picker";
import { getLabelsForView } from "@/utils/utils";


interface PlannerContextType {
  viewMode: "day" | "week" | "month" | "year";
  timeLabels: string[];
  dateRange: DateRange | undefined;
  currentDateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange) => void;
}

const defaultContextValue: PlannerContextType = {
  viewMode: "week", // default starting view
  timeLabels: [],
  dateRange: { from: startOfWeek(new Date()), to: endOfWeek(new Date()) },
  currentDateRange: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
  setDateRange: (dateRange: DateRange) => {
    console.log(dateRange);
  },
};

const PlannerContext = createContext<PlannerContextType>(defaultContextValue);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const viewMode = useMemo(() => {
    const days =
      (Number(dateRange?.to) - Number(dateRange?.from)) / (1000 * 3600 * 24);
    if (days < 1) return "day";
    if (days < 7) return "week";
    if (days <= 31) return "month";
    return "year";
  }, [dateRange]);

  const timeLabels = useMemo(() => {
    return getLabelsForView(viewMode, {
      start: dateRange?.from ?? startOfDay(new Date()),
      end: dateRange?.to ?? endOfDay(new Date()),
    });
  }, [viewMode, dateRange]);

  const value = useMemo(() => ({
    timeLabels,
    dateRange,
    setDateRange,
    viewMode: viewMode as "day" | "week" | "month" | "year",
    currentDateRange: dateRange,
  }), [dateRange, timeLabels, viewMode]);

  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
};

export const useCalendar = () => {
  return useContext(PlannerContext);
};
