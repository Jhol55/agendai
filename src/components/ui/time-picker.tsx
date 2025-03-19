"use client";

import * as React from "react";
import { IconCalendar } from "@tabler/icons-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useOutsideClick } from "@/hooks/use-outside-click";

type PointerDownOutsideEvent = CustomEvent<{
  originalEvent: PointerEvent;
}>;
type FocusOutsideEvent = CustomEvent<{
  originalEvent: FocusEvent;
}>;


export function TimePicker({
  open,
  onOpenChange,
  value,
  disabled,
  onChange,
  onClick,
  onInteractOutside,
  placeholder,
  mode = "datetime",
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: Date | undefined | null;
  disabled?: boolean;
  onChange?: (date: Date | undefined) => void;
  onClick?: () => void;
  onInteractOutside?: (event: MouseEvent | TouchEvent) => void;
  placeholder?: string;
  mode?: "datetime" | "date" | "time";
}) {
  const [date, setDate] = React.useState<Date | undefined>(value ?? undefined);
  const isFirstRender = React.useRef(true);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const ref = React.useRef<HTMLDivElement>(null);
  useOutsideClick(ref, (e) => {
    onInteractOutside?.(e);
  });

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange?.(new Date(selectedDate))
      setDate(new Date(selectedDate));
    }
  };

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    const newDate = date ? new Date(date) : new Date();
    if (!date) {
      newDate.setHours(0);
      newDate.setMinutes(0);
    }
    if (type === "hour") {
      newDate.setHours(parseInt(value));
    } else {
      newDate.setMinutes(parseInt(value));
    }
    onChange?.(newDate)
    setDate(newDate);
  };

  React.useEffect(() => {
    if (isFirstRender.current) {
      if (value && !date) {
        isFirstRender.current = false;
        onChange?.(new Date(value))
        setDate(new Date(value));
        return;
      }
    }

    if (value) {
      setDate(new Date(value));

      if (date && new Date(date).getTime() !== new Date(value).getTime()) {
        onChange?.(new Date(value))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div ref={ref}>
      <Popover open={open} onOpenChange={onOpenChange} modal>
        <PopoverTrigger
          asChild
          disabled={disabled}
          className="disabled:!cursor-not-allowed disabled:hover:bg-neutral-50 disabled:text-neutral-700 disabled:hover:text-neutral-700 disabled:!pointer-events-auto"
        >
          <Button
            variant="outline"
            onClick={(e) => {
              onClick?.();
            }}
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal dark:bg-neutral-900 z-50",
              (!date && !value) && "text-gray-500"
            )}
          >
            <IconCalendar className="mr-2 h-4 w-4" />
            <div className="translate-y-[1px]">
              {date ? (
                format(
                  date,
                  mode === "datetime"
                    ? "dd/MM/yyyy HH:mm"
                    : mode === "date"
                      ? "dd/MM/yyyy"
                      : "HH:mm",
                  { locale: ptBR }
                )
              ) : (
                <span>{placeholder || "Selecione"}</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <div className="sm:flex">
            {mode !== "time" && (
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                locale={ptBR}
                initialFocus
              />
            )}
            {mode !== "date" && (
              <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                <ScrollArea className="w-64 sm:w-auto">
                  <div className="flex sm:flex-col p-2">
                    {hours.map((hour) => (
                      <Button
                        key={hour}
                        size="icon"
                        variant={date && date.getHours() === hour ? "default" : "ghost"}
                        className="sm:w-full shrink-0 aspect-square"
                        onClick={() => handleTimeChange("hour", hour.toString())}
                      >
                        {hour}
                      </Button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="sm:hidden" />
                </ScrollArea>
                <ScrollArea className="w-64 sm:w-auto">
                  <div className="flex sm:flex-col p-2">
                    {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                      <Button
                        key={minute}
                        size="icon"
                        variant={
                          date && date.getMinutes() === minute ? "default" : "ghost"
                        }
                        className="sm:w-full shrink-0 aspect-square"
                        onClick={() => handleTimeChange("minute", minute.toString())}
                      >
                        {minute.toString().padStart(2, "0")}
                      </Button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="sm:hidden" />
                </ScrollArea>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
