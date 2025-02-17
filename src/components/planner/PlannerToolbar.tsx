import React, { useEffect, useMemo, useState } from "react";
import { useCalendar } from "@/contexts/planner/PlannerContext";
import { cn } from "@/lib/utils";
import { endOfMonth, format, getDaysInMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { addDays, subDays, startOfDay, endOfDay, endOfWeek, startOfWeek } from "date-fns";
import { usePlannerData } from "@/contexts/planner/PlannerDataContext";
import AddAppointmentDialog from "./AddAppointmentDialog";
import { Button } from "../ui/button";
import { IconChevronRight, IconChevronLeft, IconSettings, IconUser, IconUserPlus, IconClipboardPlus } from "@tabler/icons-react";
import { Typography } from "../ui/typography";
import { capitalizeFirstLetter } from "@/utils/capitalize-first-letter";
import { OperatingHoursDialog } from "./OperatingHoursDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdditionalSettingsDialog } from "./AdditionalSettingsDialog";
import { Separator } from "../ui/separator";
import { Notifications } from "../ui/notifications/notifications";

type CalendarToolbarProps = React.HTMLAttributes<HTMLDivElement>

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  className,
  ...props
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const { setDateRange, viewMode } = useCalendar();

  const [range, setRange] = useState<DateRange>({
    from: startOfWeek(new Date(), {
      locale: { options: { weekStartsOn: 0 } },
    }),
    to: endOfWeek(new Date()),
  });
  const handleDateRangeUpdate = (range: DateRange) => {
    const from = range.from;
    const to = range.to ?? endOfDay(range.from as Date);
    setRange({
      from: from,
      to: to
    });
  };

  function getDays(viewMode: "day" | "week" | "month" | "year") {
    if (!range?.from) return 0
    return viewMode === "day" ? 1 : viewMode === "week" ? 7 : viewMode === "month" ? getDaysInMonth(range?.from) : 365
  }

  const moveForward = () => {
    return {
      from: addDays(range.from as Date, getDays(viewMode)),
      to: addDays(range.to as Date, getDays(viewMode)),
    };
  };
  const moveBack = () => {
    return {
      from: subDays(range.from as Date, getDays(viewMode)),
      to: subDays(range.to as Date, getDays(viewMode)),
    };
  };
  const moveToToday = () => {
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
  }

  useEffect(() => {
    setDateRange(range);
  }, [range, setDateRange]);


  return (
    <div
      className={cn("flex flex-col", className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div>
        </div>
        <div className="flex items-center gap-2 justify-between w-full p-2 pt-4 bg-white dark:bg-neutral-800/40 border-b absolute left-0 top-0">
          <div></div>
          <div className="flex gap-2">
            <Notifications />
            <Separator orientation="vertical" className="mx-2 h-10" />
            <Button
              variant="outline"
            >
              <IconUserPlus className="w-4 h-4" />
              <Typography variant="span" className="md:block hidden">Novo cliente</Typography>         
            </Button>
            <Button
              variant="outline"
            >
              <IconClipboardPlus className="h-4 w-4" />
              <Typography variant="span" className="md:block hidden">Novo serviço</Typography>
            </Button>
            <AddAppointmentDialog />
          </div>
        </div>
      </div>
      {/* <Separator orientation="horizontal" className="my-2" /> */}
      <div className="flex gap-2 justify-between w-full py-2 mt-14">
        <div className="flex gap-2 items-end">
          <div className="flex gap-2">
            <Button
              variant={viewMode === "day" ? "default" : "outline"}
              className={cn(viewMode === "day" && "border bg-neutral-200 dark:bg-neutral-800 dark:text-white text-black hover:bg-neutral-300 dark:hover:bg-neutral-700")}
              onClick={() => handleDateRangeUpdate({
                from: startOfDay(new Date()),
                to: endOfDay(new Date()),
              })}
            >
              <Typography variant="span" className="md:block hidden">Dia</Typography>
              <Typography variant="span" className="md:hidden block">D</Typography>
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              className={cn(viewMode === "week" && "border bg-neutral-200 dark:bg-neutral-800 dark:text-white text-black hover:bg-neutral-300 dark:hover:bg-neutral-700")}
              onClick={() => handleDateRangeUpdate({
                from: startOfWeek(new Date(), {
                  locale: { options: { weekStartsOn: 0 } },
                }),
                to: endOfWeek(new Date()),
              })}
            >
              <Typography variant="span" className="md:block hidden">Semana</Typography>
              <Typography variant="span" className="md:hidden block">S</Typography>
            </Button>
            <Button
              variant={viewMode === "month" ? "default" : "outline"}
              className={cn(viewMode === "month" && "border bg-neutral-200 dark:bg-neutral-800 dark:text-white text-black hover:bg-neutral-300 dark:hover:bg-neutral-700")}
              onClick={() => handleDateRangeUpdate({
                from: startOfMonth(new Date()),
                to: endOfMonth(new Date()),
              })}
            >
              <Typography variant="span" className="md:block hidden">Mês</Typography>
              <Typography variant="span" className="md:hidden block">M</Typography>
            </Button>
          </div>
          <Separator orientation="vertical" className="mx-2" />
          <div className="flex gap-2 items-center">
            <Button
              variant="outline"
              onClick={() => handleDateRangeUpdate(moveToToday())}
            >            
              <Typography variant="span">Hoje</Typography>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDateRangeUpdate(moveBack())}
            >
              <IconChevronLeft className="!w-5 !h-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDateRangeUpdate(moveForward())}
            >
              <IconChevronRight className="!w-5 !h-5" />
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
        <div className="flex gap-2">
          <DropdownMenu open={isOpened} onOpenChange={setIsOpened} >
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setIsOpened(true)}
              >
                <IconSettings className="!h-4 !w-4" />
                <Typography variant="span" className="md:block hidden">Configurações</Typography>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-7 bg-background">
              <DropdownMenuLabel>
                <Typography variant="span">
                  Configurações
                </Typography>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="flex flex-col justify-center p-2 gap-2">
                <DropdownMenuItem className="!p-0 m-2" asChild>
                  <OperatingHoursDialog />
                </DropdownMenuItem>
                <DropdownMenuItem className="!p-0 m-2" asChild>
                  <AdditionalSettingsDialog />
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CalendarToolbar);
