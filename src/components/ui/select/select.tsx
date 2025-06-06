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


export const Select = ({
  list,
  onSelect,
  value,
  className,
  placeholder
}: {
  list?: { label: string; value: string }[];
  onSelect?: (value: string) => void;
  value?: ((string | number | readonly string[]) & (Date | null)) | undefined;
  className?: string;
  placeholder?: string;
}) => {
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
            "h-10 w-full justify-between bg-neutral-50 dark:bg-dark-chatwoot-primary",
            className
          )}
        >
          <div className="flex gap-4">
            {(list?.length && list?.find((item) => item?.value === value)?.label) ?? placeholder}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 popover-content-width-fix">
        <Command className="pl-1">
          <CommandList>
            <CommandGroup>
              {list?.length && list?.map((item, index) => (
                <CommandItem
                  key={index}
                  value={item.value}
                  onSelect={(currentValue) => {
                    onSelect?.(currentValue);
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
