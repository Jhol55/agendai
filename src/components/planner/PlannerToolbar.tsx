import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { ConfigDialog } from "./ConfigDialog";
import { usePlannerData } from "@/contexts/planner/PlannerDataContext";
import { Select } from "../ui/select/select";
import { useSearchParams } from "next/navigation";


type CalendarToolbarProps = React.HTMLAttributes<HTMLDivElement>

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  className,
  ...props
}) => {
  const searchParams = useSearchParams();
  const accountId = searchParams.get("accountId") ?? undefined;

  const { setDateRange, viewMode } = useCalendar();
  const { setCurrentCalendarId, currentCalendarId, setAccountId, calendars } = usePlannerData();

  useEffect(() => {
    setAccountId(accountId);
  }, [accountId, setAccountId])

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

  const calendarsSelectList = useMemo(() => {
    return calendars.map((calendar) => ({
      label: calendar.name,
      value: String(calendar.id),
    }));
  }, [calendars]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentCalendarId(localStorage.getItem("current_calendar_id") ?? undefined)
    }
  })


  return (
    <div
      className={cn("flex flex-col", className)}
      {...props}
    >
      <div className="flex gap-2 justify-between items-center w-full p-4">
        <div className="flex gap-4 items-center">
          <div>
            <Select
              src={calendarsSelectList ?? []}
              value={currentCalendarId}
              placeholder="Selecione um calendário"
              className="w-72"
              onSelect={(value) => {
                setCurrentCalendarId(value);
                localStorage.setItem("current_calendar_id", value);
              }}
            />
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex gap-2">
            <Button
              variant={viewMode === "day" ? "default" : "ghost"}
              disabled
              className={cn(viewMode === "day" && "bg-skyblue/10 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white text-black hover:bg-neutral-700")}
              onClick={() => handleDateRangeUpdate({
                from: startOfDay(new Date()),
                to: endOfDay(new Date()),
              })}
            >
              <Typography variant="span" className={cn(viewMode === "day" && "!text-skyblue dark:!text-woot-500/80", "md:block hidden")}>Dia</Typography>
              <Typography variant="span" className={cn(viewMode === "day" && "!text-skyblue dark:!text-woot-500/80", "md:hidden block")}>D</Typography>
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              className={cn(viewMode === "week" && "bg-skyblue/10 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white !text-skyblue hover:bg-neutral-700")}
              onClick={() => handleDateRangeUpdate({
                from: startOfWeek(new Date(), {
                  locale: { options: { weekStartsOn: 0 } },
                }),
                to: endOfWeek(new Date()),
              })}
            >
              <Typography variant="span" className={cn(viewMode === "week" && "!text-skyblue dark:!text-woot-500/80", "md:block hidden")}>Semana</Typography>
              <Typography variant="span" className={cn(viewMode === "week" && "!text-skyblue dark:!text-woot-500/80", "md:hidden block")}>S</Typography>
            </Button>
            <Button
              variant={viewMode === "month" ? "default" : "ghost"}
              disabled
              className={cn(viewMode === "month" && "bg-skyblue/10 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white text-black hover:bg-neutral-700")}
              onClick={() => handleDateRangeUpdate({
                from: startOfMonth(new Date()),
                to: endOfMonth(new Date()),
              })}
            >
              <Typography variant="span" className={cn(viewMode === "month" && "!text-skyblue dark:!text-woot-500/80", "md:block hidden")}>Mês</Typography>
              <Typography variant="span" className={cn(viewMode === "month" && "!text-skyblue dark:!text-woot-500/80", "md:hidden block")}>M</Typography>
            </Button>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex gap-2 items-center">
            <Button
              variant="ghost"
              onClick={() => handleDateRangeUpdate(moveToToday())}
            >
              <Typography variant="span">Hoje</Typography>
            </Button>
            <Button
              variant="ghost"
              className="xs:!px-3 !px-2"
              onClick={() => handleDateRangeUpdate(moveBack())}
            >
              <IconChevronLeft className="!w-5 !h-5 !text-neutral-700 dark:!text-neutral-200" />
            </Button>
            <Button
              variant="ghost"
              className="xs:!px-3 !px-2"
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
        <AddAppointmentDialog />
        {/* <Separator orientation="vertical" className="h-4" />
        <ConfigDialog /> */}
      </div>
    </div>
  );
};

export default React.memo(CalendarToolbar);
