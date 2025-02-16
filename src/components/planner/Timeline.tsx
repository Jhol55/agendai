import React, { useCallback, useEffect, useState } from "react";
import { useCalendar } from "@/contexts/planner/PlannerContext";
import { cn } from "@/lib/utils";
import { TableHead, TableHeader, TableRow } from "../ui/table";
import { IconCalendarPin, IconClock } from "@tabler/icons-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePlannerData } from "@/contexts/planner/PlannerDataContext";

export const Timeline: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  const { timeLabels, dateRange, viewMode } = useCalendar();
  const [trigger, setTrigger] = useState(false);

  const handleUpdate = useCallback(() => setTrigger(() => !trigger), [trigger]);

  function getTimeUntilNextHour() {
    const now = new Date();
    const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
    return nextHour.getTime() - now.getTime();
  }

  function shouldDisplayIcon({ viewMode, index }: { viewMode: "day" | "week" | "month" | "year", index: number }) {
    const today = new Date();
    return index === (viewMode === "day" ? today.getHours() : today.getDay())
      && (dateRange?.from && today >= dateRange?.from)
      && (dateRange?.to && today <= dateRange?.to)
  }

  useEffect(() => {
    const timeUntilNextHour = getTimeUntilNextHour();
    if (timeUntilNextHour >= 0) {
      const timeoutId = setTimeout(() => {
        handleUpdate();
        setInterval(handleUpdate, 60 * 60 * 1000);
      }, timeUntilNextHour);

      return () => clearTimeout(timeoutId);
    }
  }, [handleUpdate]);

  return (
    <TableHeader>
      <TableRow className="bg-background">
        {/* <TableHead></TableHead> */}
        {timeLabels.map((label, index) => (
          <TableHead
            key={index}
            className={cn(
              "sticky bg-background border-r last:border-r-0 text-center max-w-full whitespace-nowrap bg-neutral-50 dark:bg-neutral-800 dark:border-r-neutral-700",
              viewMode !== "day" && "top-0",
              shouldDisplayIcon({ index, viewMode })
                ? "z-30" : "z-20"
            )}
          >
            <span className="relative flex items-center justify-center">
              {String(label).charAt(0).toUpperCase() + String(label).slice(1)}
              {shouldDisplayIcon({ index, viewMode }) &&
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {
                        viewMode === "day"
                          ? <div className="flex items-center min-w-10">
                            <IconClock className="absolute right-0 w-4 h-4 rounded-md text-green-500" />
                          </div>
                          : viewMode === "week"
                            ? <IconCalendarPin className="absolute right-0 w-4 h-4 rounded-md text-green-500" />
                            : null
                      }
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {
                          viewMode === "day"
                            ? "Hora Atual"
                            : viewMode === "week"
                              ? "Dia atual"
                              : null
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              }
            </span>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};
