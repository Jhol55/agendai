import { OperatingHoursDialog } from "./OperatingHoursDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdditionalSettingsDialog } from "./AdditionalSettingsDialog";
import { Button } from "../ui/button";
import { IconSettings, IconChevronUp, IconChevronDown } from "@tabler/icons-react";
import { Typography } from "../ui/typography";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";


export const ConfigDialog = () => {
  const [isOpened, setIsOpened] = useState(false);
  const [canHide, setCanHide] = useState(false);
  const { zoom } = useSettings();

  return (
    <DropdownMenu open={isOpened} onOpenChange={setIsOpened}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          onClick={() => setIsOpened(true)}
          className="flex gap-[4px] rounded-full dark:!text-neutral-200 !text-neutral-700"
        >
          <IconSettings className="!h-4 !w-4" />
          {/* <Typography variant="span" className="md:block hidden">
                        Configurações
                    </Typography> */}
          {isOpened && !canHide
            ? <IconChevronUp className="translate-y-[1px] xs:block hidden" />
            : <IconChevronDown className="translate-y-[1px] xs:block hidden" />
          }
        </Button>
      </DropdownMenuTrigger>
        <DropdownMenuContent side="top"
          style={{ zoom }}
          className={cn("w-56 bg-background mr-7", canHide && "hidden")}   
        >
          <DropdownMenuLabel>
            <Typography variant="span">
              Configurações
            </Typography>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className="flex flex-col justify-center p-2 gap-2">
            <DropdownMenuItem className="!p-0 m-2" asChild>
              <OperatingHoursDialog
                onClick={() => setCanHide(true)}
                onClose={() => {
                  setCanHide(true);
                  setTimeout(() => {
                    setIsOpened(false);
                  }, 500);
                  setTimeout(() => {
                    setCanHide(false);
                  }, 600);
                }}
              />
            </DropdownMenuItem>
            <DropdownMenuItem className="!p-0 m-2" asChild>
              <AdditionalSettingsDialog
                onClick={() => setCanHide(true)}
                onClose={() => {
                  setCanHide(true);
                  setTimeout(() => {
                    setIsOpened(false);
                  }, 500);
                  setTimeout(() => {
                    setCanHide(false);
                  }, 600);
                }}
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
    </DropdownMenu>
  )
}