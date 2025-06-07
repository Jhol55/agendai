import { Notifications } from "../ui/notifications/notifications";
import { Button } from "../ui/button";
import { IconUserPlus } from "@tabler/icons-react";
import { Typography } from "../ui/typography";
import { SearchClientInput } from "./SearchClientInput";
import { ConfigDialog } from "./ConfigDialog";
import { ModeToggle } from "../ui/ModeToggle";
import { ThemeSwitcherToggle } from "../ui/theme-switch-toggle";
import { usePlannerData } from "@/contexts/planner/PlannerDataContext";
import { useCalendar } from "@/contexts/planner/PlannerContext";
import { capitalizeFirstLetter } from "@/utils/capitalize-first-letter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const PlannerTopBar = () => {
  const { viewMode, dateRange } = useCalendar();


  return (
    <div className="flex items-center justify-between z-50 w-full">
      <div className="hidden sm:flex items-center md:gap-6 gap-2 w-full">
        <Typography variant="h1">
          Agenda
        </Typography>
        {/* <Typography variant="span" className="w-full mx-2 lg:block hidden">
          {viewMode === "week" || viewMode === "day"
            ? dateRange?.from && capitalizeFirstLetter(format(dateRange?.from, "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR }))
            : dateRange?.from && "Mês de " + format(dateRange?.from, "MMMM", { locale: ptBR })}
          {viewMode === "week" && " - "}
          {viewMode === "week" && dateRange?.to && capitalizeFirstLetter(format(dateRange?.to, "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR }))}
        </Typography> */}
      </div>
      {/* <div className="flex items-center md:gap-6 gap-2 w-full">
        <SearchClientInput />
        <Button
          variant="outline"
        >
          <IconUserPlus className="w-4 h-4 dark:text-white text-neutral-900" />
          <Typography variant="span" className="md:block hidden">Novo cliente</Typography>
        </Button>
      </div> */}
      <div className="flex items-center gap-2 justify-between w-full pb-2">
        <div></div>
        <div className="flex items-center md:gap-6 gap-4">
          <Notifications />
          <ConfigDialog />
        </div>
      </div>
    </div>
  )
}