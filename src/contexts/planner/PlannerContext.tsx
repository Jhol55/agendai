import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from "react";
import { startOfDay, endOfDay, startOfWeek, eachHourOfInterval, eachMinuteOfInterval } from "date-fns";
import { DateRange } from "react-day-picker";
import { getLabelsForView, getMinMaxCalendarRange } from "@/utils/utils";
import { getOperatingHours } from "@/services/operatingHours";


interface PlannerContextType {
  viewMode: "day" | "week" | "month" | "year";
  timeLabels: string[];
  hourLabels: Date[];
  dateRange: DateRange | undefined;
  currentDateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange) => void;
  handlePlannerUpdate: () => void;
}

const defaultContextValue: PlannerContextType = {
  viewMode: "week", // default starting view
  timeLabels: [],
  hourLabels: [],
  dateRange: { from: startOfWeek(new Date()), to: endOfDay(new Date()) },
  currentDateRange: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
  setDateRange: (dateRange: DateRange) => {
    console.log(dateRange);
  },
  handlePlannerUpdate: () => null
};

const PlannerContext = createContext<PlannerContextType>(defaultContextValue);

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [hourLabels, setHourLabels] = useState<Date[]>([]);
  const [trigger, setTrigger] = useState(false);
  const handlePlannerUpdate = useCallback(() => setTrigger(() => !trigger), [trigger]);

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

  useEffect(() => {
    getOperatingHours({}).then((data) => {
      const { min, max } = getMinMaxCalendarRange(data);

      if (!min || !max) return;

      const interval = eachMinuteOfInterval(
        {
          start: new Date(min),
          end: endOfDay(new Date(max)),
        },
        { step: 30 }
      );

      setHourLabels(interval);
    });
  }, [trigger]);

  const value = {
    timeLabels,
    hourLabels,
    dateRange,
    setDateRange,
    viewMode: viewMode as "day" | "week" | "month" | "year",
    currentDateRange: dateRange,
    handlePlannerUpdate
  };

  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
};

export const useCalendar = () => {
  return useContext(PlannerContext);
};
