import { Notifications } from "../ui/notifications/notifications";
import { Button } from "../ui/button";
import { IconUserPlus } from "@tabler/icons-react";
import { Typography } from "../ui/typography";
import { SearchClientInput } from "./SearchClientInput";
import { ConfigDialog } from "./ConfigDialog";
import { ModeToggle } from "../ui/ModeToggle";
import { ThemeSwitcherToggle } from "../ui/theme-switch-toggle";

export const PlannerTopBar = () => {
  return (
    <div className="flex items-center justify-between z-50 w-full">
      <div className="hidden sm:flex items-center md:gap-6 gap-2 w-full">
        <Typography variant="h1">
            Agenda
        </Typography>
      </div>
      <div className="flex items-center md:gap-6 gap-2 w-full">
        <SearchClientInput />
        <Button
          variant="outline"
        >
          <IconUserPlus className="w-4 h-4 dark:text-white text-neutral-900" />
          <Typography variant="span" className="md:block hidden">Novo cliente</Typography>
        </Button>
      </div>
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