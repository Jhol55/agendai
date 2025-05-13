import { Notifications } from "../ui/notifications/notifications";
import { Button } from "../ui/button";
import { IconUserPlus } from "@tabler/icons-react";
import { Typography } from "../ui/typography";
import { SearchClientInput } from "./SearchClientInput";
import { ConfigDialog } from "./ConfigDialog";

export const PlannerTopBar = () => {
  return (
    <div className="flex items-center justify-between absolute left-0 top-0 z-50 w-full bg-neutral-50 dark:bg-background">
      <div className="flex items-center md:gap-6 gap-2 w-full pb-2 pl-4 pt-4">
        <SearchClientInput />
        <Button
          variant="outline"
        >
          <IconUserPlus className="w-4 h-4" />
          <Typography variant="span" className="md:block hidden">Novo cliente</Typography>
        </Button>
      </div>
      <div className="flex items-center gap-2 justify-between w-full pb-2 pl-2 pr-4 pt-4 bg-neutral-50 dark:bg-background">
        <div></div>
        <div className="flex items-center md:gap-6 gap-4">
          <Notifications />
          <ConfigDialog />
        </div>
      </div>
    </div>
  )
}