import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "../button";

export interface SelectProps {
  src?: { label: React.ReactNode; value: string }[];
  onSelect?: (value: string) => void;
  value?: string | ((string | number | readonly string[]) & (Date | null)) | undefined;
  className?: string;
  placeholder?: string;
}

export const Select = ({
  src,
  onSelect,
  value,
  className,
  placeholder
}: SelectProps) => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <Popover open={isOpened} onOpenChange={setIsOpened} modal>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpened}
          className={cn(
            !value && "text-muted-foreground",
            "h-10 w-full justify-between bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-900",
            "dark:focus:ring-skyblue dark:focus:ring-1 h-10 data-[state=closed]:!ring-0 data-[state=open]:ring-1 data-[state=open]:ring-skyblue transition-all duration-75",
            className
          )}
        >
          <div className={cn("flex gap-4", !(src?.length && Object.keys(src[0]).length > 0 && src?.find((item) => item?.value == value)?.label) ? "dark:text-neutral-400 text-neutral-500": "dark:text-neutral-200 text-neutral-700")}>
            {(src?.length && Object.keys(src[0]).length > 0 && src?.find((item) => item?.value == value)?.label) || placeholder}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 popover-content-width-fix">
        <Command className="pl-1 bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-900">
          <CommandList>
            <CommandGroup>
              {src?.length && src?.map((item, index) => (
                <CommandItem
                  key={index}
                  value={String(item.value)}
                  onSelect={(currentValue) => {
                    onSelect?.(String(currentValue));
                    setIsOpened(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
