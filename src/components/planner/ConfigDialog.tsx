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
import { Button } from "../ui/button";
import { IconSettings } from "@tabler/icons-react";
import { Typography } from "../ui/typography";
import { useState } from "react";


export const ConfigDialog = () => {
    const [isOpened, setIsOpened] = useState(false);
    
    return (
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
    )
}