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

export function TimePicker({
  open,
  onOpenChange,
  value,
  disabled,
  onChange,
  placeholder,
  mode = "datetime", // "datetime" | "date" | "time"
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: Date | undefined;
  disabled?: boolean;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  mode?: "datetime" | "date" | "time";
}) {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [externalDate, setExternalDate] = React.useState<Date | undefined>(value)

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
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
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value));
    }

    setDate(newDate);
  };

  React.useEffect(() => {
    onChange?.(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  React.useEffect(() => {
    if (value && !date) {
      setExternalDate(value);
      onChange?.(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-background",
            (!date && !externalDate) && "text-muted-foreground"
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
            ) : externalDate ? (
              format(
                externalDate,
                mode === "datetime"
                  ? "dd/MM/yyyy HH:mm"
                  : mode === "date"
                    ? "dd/MM/yyyy"
                    : "HH:mm",
                { locale: ptBR }
              )
            ) : (
              <span>{placeholder ? placeholder : "Selecione"}</span>
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
  );
}
