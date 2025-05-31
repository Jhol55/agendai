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
import { Typography } from "../ui/typography";


export const Timeline: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
}) => {
  const { timeLabels, dateRange, viewMode } = useCalendar();
  const [trigger, setTrigger] = useState(false);

  const handleUpdate = useCallback(() => setTrigger(() => !trigger), [trigger]);

  const getTimeUntilNextHour = useCallback(() => {
    const now = new Date();
    const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
    return nextHour.getTime() - now.getTime();
  }, [])

  const shouldDisplayIcon = useCallback(({ viewMode, index }: { viewMode: "day" | "week" | "month" | "year", index: number }) => {
    const today = new Date();
    return index === (viewMode === "day" ? today.getHours() : today.getDay()) + 1
      && (dateRange?.from && today >= dateRange?.from)
      && (dateRange?.to && today <= dateRange?.to)
  }, [dateRange?.from, dateRange?.to])

  useEffect(() => {
    const timeUntilNextHour = getTimeUntilNextHour();
    if (timeUntilNextHour >= 0) {
      const timeoutId = setTimeout(() => {
        handleUpdate();
        setInterval(handleUpdate, 60 * 60 * 1000);
      }, timeUntilNextHour);

      return () => clearTimeout(timeoutId);
    }
  }, [getTimeUntilNextHour, handleUpdate]);

  return (
    <TableHeader>
      <TableRow className="dark:bg-neutral-800 bg-neutral-300 sticky top-0 z-50">
        {["", ...timeLabels].map((label, index) => (
          <TableHead
            key={index}
            className={cn(
              "relative bg-background text-center max-w-full whitespace-nowrap bg-neutral-700 dark:bg-neutral-800 dark:border-neutral-800 hover:dark:border-neutral-800",
              // shouldDisplayIcon({ index, viewMode })
              //   ? "z-30" : "z-20"
            )}
          >
            {/* bug fix - th sticky border */}
            {index === 1 && <div className="absolute top-0 left-0 w-full h-full dark:bg-neutral-800 bg-neutral-700"></div>}
            <Typography variant="span" className="relative flex items-center justify-center dark:!text-neutral-200 !text-neutral-200">
              {String(label).charAt(0).toUpperCase() + String(label).slice(1)}
              {/* {shouldDisplayIcon({ index, viewMode }) &&
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {
                        viewMode === "day"
                          ? <div className="flex items-center min-w-10">
                            <IconClock className="absolute right-0 w-4 h-4 rounded-md text-green-500" />
                          </div>
                          : viewMode === "week"
                            ?
                            <IconCalendarPin className="absolute right-0 w-4 h-4 rounded-md text-green-500" />
                            : null
                      }
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="opacity-100">
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
              } */}
            </Typography>
            {shouldDisplayIcon({ index, viewMode }) && <div className="absolute left-0 bottom-0 bg-skyblue h-[2px] w-full rounded-full"></div>}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};
