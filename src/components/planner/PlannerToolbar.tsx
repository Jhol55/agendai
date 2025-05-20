import React, { useCallback, useEffect, useState } from "react";
import { useCalendar } from "@/contexts/planner/PlannerContext";
import { cn } from "@/lib/utils";
import { addMonths, endOfMonth, format, getDaysInMonth, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { addDays, subDays, startOfDay, endOfDay, endOfWeek, startOfWeek } from "date-fns";
import { Button } from "../ui/button";
import { IconChevronRight, IconChevronLeft, IconSettings, IconUser, IconUserPlus, IconClipboardPlus } from "@tabler/icons-react";
import { Typography } from "../ui/typography";
import { capitalizeFirstLetter } from "@/utils/capitalize-first-letter";
import { Separator } from "../ui/separator";
import AddAppointmentDialog from "./AddAppointmentDialog";


type CalendarToolbarProps = React.HTMLAttributes<HTMLDivElement>

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  className,
  ...props
}) => {
  const { setDateRange, viewMode } = useCalendar();

  const [range, setRange] = useState<DateRange>({
    from: startOfWeek(new Date(), {
      locale: { options: { weekStartsOn: 0 } },
    }),
    to: endOfWeek(new Date()),
  });
  const handleDateRangeUpdate = useCallback((range: DateRange) => {
    const from = range.from;
    const to = range.to ?? endOfDay(range.from as Date);
    setRange({
      from: from,
      to: to
    });
  }, []);

  const getDays = useCallback((viewMode: "day" | "week" | "month" | "year") => {
    if (!range?.from) return 0
    return viewMode === "day" ? 1 : viewMode === "week" ? 7 : viewMode === "month" ? getDaysInMonth(range?.from) : 365
  }, [range?.from]);

  const moveForward = useCallback(() => {
    if (viewMode === "month") {
      const newMonth = addMonths(range.from as Date, 1);
      return {
        from: startOfMonth(newMonth),
        to: endOfMonth(newMonth),
      };
    }
    return {
      from: addDays(range.from as Date, getDays(viewMode)),
      to: addDays(range.to as Date, getDays(viewMode)),
    };
  }, [getDays, range.from, range.to, viewMode]);

  const moveBack = useCallback(() => {
    if (viewMode === "month") {
      const newMonth = subMonths(range.from as Date, 1);
      return {
        from: startOfMonth(newMonth),
        to: endOfMonth(newMonth),
      };
    }
    return {
      from: subDays(range.from as Date, getDays(viewMode)),
      to: subDays(range.to as Date, getDays(viewMode)),
    };
  }, [getDays, range.from, range.to, viewMode]);

  const moveToToday = useCallback(() => {
    return {
      from: viewMode === "day"
        ? startOfDay(new Date())
        : viewMode === "week"
          ? startOfWeek(new Date(), { locale: { options: { weekStartsOn: 0 } } })
          : startOfMonth(new Date()),
      to: viewMode === "day"
        ? endOfDay(new Date())
        : viewMode === "week"
          ? endOfWeek(new Date())
          : endOfMonth(new Date()),
    }
  }, [viewMode])

  useEffect(() => {
    setDateRange(range);
  }, [range, setDateRange]);


  return (
    <div
      className={cn("flex flex-col", className)}
      {...props}
    >
      <div className="flex gap-2 justify-between w-full pb-2">
        <div className="flex gap-4 items-end">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "day" ? "default" : "outline"}
              disabled
              className={cn(viewMode === "day" && "border bg-neutral-700 dark:bg-neutral-800 dark:border-neutral-700/60 dark:hover:bg-neutral-700 dark:text-white text-black hover:bg-neutral-700")}
              onClick={() => handleDateRangeUpdate({
                from: startOfDay(new Date()),
                to: endOfDay(new Date()),
              })}
            >
              <Typography variant="span" className={cn(viewMode === "day" && "!text-neutral-200 dark:!text-green-400", "md:block hidden")}>Dia</Typography>
              <Typography variant="span" className={cn(viewMode === "day" && "!text-neutral-200 dark:!text-green-400", "md:hidden block")}>D</Typography>
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              className={cn(viewMode === "week" && "border bg-neutral-700 dark:bg-neutral-800 dark:border-neutral-700/60 dark:hover:bg-neutral-700 dark:text-white text-black hover:bg-neutral-700")}
              onClick={() => handleDateRangeUpdate({
                from: startOfWeek(new Date(), {
                  locale: { options: { weekStartsOn: 0 } },
                }),
                to: endOfWeek(new Date()),
              })}
            >
              <Typography variant="span" className={cn(viewMode === "week" && "!text-neutral-200 dark:!text-green-400", "md:block hidden")}>Semana</Typography>
              <Typography variant="span" className={cn(viewMode === "week" && "!text-neutral-200 dark:!text-green-400", "md:hidden block")}>S</Typography>
            </Button>
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              disabled
              className={cn(viewMode === "month" && "border bg-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:border-neutral-700/60 dark:text-white text-black hover:bg-neutral-700")}
              onClick={() => handleDateRangeUpdate({
                from: startOfMonth(new Date()),
                to: endOfMonth(new Date()),
              })}
            >
              <Typography variant="span" className={cn(viewMode === "month" && "!text-neutral-200 dark:!text-green-400", "md:block hidden")}>Mês</Typography>
              <Typography variant="span" className={cn(viewMode === "month" && "!text-neutral-200 dark:!text-green-400", "md:hidden block")}>M</Typography>
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              onClick={() => handleDateRangeUpdate(moveToToday())}
            >
              <Typography variant="span">Hoje</Typography>
            </Button>
            <Button
              variant="outline"
              className="xs:!px-4 !px-3"
              onClick={() => handleDateRangeUpdate(moveBack())}
            >
              <IconChevronLeft className="!w-5 !h-5 !text-neutral-700 dark:!text-neutral-200" />
            </Button>
            <Button
              variant="outline"
              className="xs:!px-4 !px-3"
              onClick={() => handleDateRangeUpdate(moveForward())}
            >
              <IconChevronRight className="!w-5 !h-5 !text-neutral-700 dark:!text-neutral-200" />
            </Button>
          </div>
        </div>
        <Typography variant="span" className="w-full mx-2 lg:block hidden">
          {viewMode === "week" || viewMode === "day"
            ? range.from && capitalizeFirstLetter(format(range.from, "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR }))
            : range.from && "Mês de " + format(range.from, "MMMM", { locale: ptBR })}
          {viewMode === "week" && " - "}
          {viewMode === "week" && range.to && capitalizeFirstLetter(format(range.to, "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR }))}
        </Typography>
        <Separator orientation="vertical" className="md:hidden block" />
        <AddAppointmentDialog />
      </div>
    </div>
  );
};

export default React.memo(CalendarToolbar);
