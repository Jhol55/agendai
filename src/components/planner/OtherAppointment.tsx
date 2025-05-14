"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Appointment as AppointmentType,
  updateAppointmentSchema,
} from "@/models/Appointment";
import { usePlannerData } from "@/contexts/planner/PlannerDataContext";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TimePicker } from "@/components/ui/time-picker";
import { getClients } from "@/services/clients";
import { getServices } from "@/services/services";
import { IconBriefcase, IconUser, IconCalendarDollar, IconCurrencyDollar, IconCircleCheck, IconVideo, IconVideoOff, IconMapPin, IconMapPinOff, IconBan } from "@tabler/icons-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Loading } from "../ui/loading/loading";
import { Typography } from "../ui/typography";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { blockedTimesSchema, BlockTimeSlotsProps, UpdatedBlockTimeSlotsProps } from "@/models/BlockTimeSlots";
import { AddBlockedTimeSlot } from "@/services/block-time-slots";

type ServiceType = {
  id: string,
  name: string,
  price: number,
  duration_minutes: number,
  allow_online: boolean,
  allow_in_person: boolean
}

interface AppointmentProps {
  appointment: AppointmentType & UpdatedBlockTimeSlotsProps;
  resourceId: string;
  columnIndex: number;
  className?: string;
}

const OtherAppointment: React.FC<AppointmentProps> = ({
  appointment,
  resourceId,
  columnIndex,
  className
}) => {
  const { updateAppointment, removeAppointment, handleUpdate, isDragging, isResizing } = usePlannerData();
  const [isPending, startOnSubmitTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const [isOpened, setIsOpened] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [autoEndDate, setAutoEndDate] = React.useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [type, setType] = useState("period");
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isDayOfWeekOpen, setIsDayOfWeekOpen] = useState(false);

  const form = useForm<BlockTimeSlotsProps>({
    resolver: zodResolver(blockedTimesSchema),
    defaultValues: {
      type: "period",
      start: undefined,
      end: undefined,
      is_recurring: false,
      day_of_week: undefined,
      description: "",
    },
  });

  const watch = form.watch();

  useEffect(() => {
    if (!isDragging && !isResizing) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const element = ref.current!;
      return draggable({
        element,
        getInitialData: () => ({
          appointment: appointment,
          columnIndex: columnIndex,
          resourceId: resourceId,
        }),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment]);

  useEffect(() => {
    if (!isOpened) {
      setTimeout(() => {
        form.reset();
        setType("period");
      }, 200)
    }
  }, [form, isOpened])


  const onSubmit = useCallback((values: z.infer<typeof blockedTimesSchema>) => {
    startOnSubmitTransition(() => {
      toast.promise(
        () =>
          new Promise((resolve) => {
            resolve(AddBlockedTimeSlot({ data: values }));
          }),
        {
          loading: "Adicionando exceção...",
          success: "Exceção adicionada com sucesso.",
          error: "Falha ao adicionar exceção!"
        },
      );

    });
  }, [])

  const onRemove = useCallback((id: string) => {
    setTimeout(() => {
      setIsOpened(false);
      removeAppointment(id);
    }, 500);
  }, [removeAppointment])


  useEffect(() => {
    if (!isOpened) {
      setTimeout(() => {
        form.reset();
        setIsLoading(true);
      }, 500)
    } else {
      handleUpdate();
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, isOpened])

  const units = useMemo(() => [
    { label: "Período", value: "period" },
    { label: "Dia da semana", value: "dayOfWeek" }
  ], []);

  const daysOfWeek = useMemo(() => [
    { label: "Domingo", value: 0 },
    { label: "Segunda-feira", value: 1 },
    { label: "Terça-feira", value: 2 },
    { label: "Quarta-feira", value: 3 },
    { label: "Quinta-feira", value: 4 },
    { label: "Sexta-feira", value: 5 },
    { label: "Sábado", value: 6 }
  ], []);

  return (
    <Card ref={ref} className={cn(
      "relative w-full max-w-full rounded-sm !p-0 !m-0 h-full z-40 !items-start, dark:border-neutral-700/60",
      "group transition-colors duration-150 handle-ghosting",
      appointment?.details?.service ? "bg-purple-700 dark:bg-purple-700" : "bg-red-500 dark:bg-red-500",
      className,
    )}
      onDoubleClick={(e) => { setIsOpened(true); e.stopPropagation() }}>
      <CardHeader className="absolute w-full flex flex-row items-center justify-between p-1">
        <Dialog open={isOpened} onOpenChange={setIsOpened}>
          <DialogContent
            aria-describedby={undefined}
            className="max-w-[90vw] md:max-w-[36rem] max-h-[90vh] rounded-md overflow-hidden !p-0 bg-neutral-50 dark:bg-neutral-900"
            onInteractOutside={(e) => {
              e.preventDefault();
              if (!isTypeOpen && !isDayOfWeekOpen && !isCalendarOpen) {
                setIsOpened(false);
              }
            }}
          >
            <DialogHeader className="mb-2 px-[1.5rem] pt-[1.5rem]">
              <DialogTitle>Editar Agendamento</DialogTitle>
            </DialogHeader>
            {!isLoading ? (
              <Form {...form}>
                <form id="update-appointment" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-h-[70vh] overflow-auto px-[1.5rem] pb-[1.5rem]">
                  <FormField
                    control={form.control}
                    name={`type`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full">
                        <FormLabel>Unidade</FormLabel>
                        <FormControl>
                          <Popover open={isTypeOpen} onOpenChange={setIsTypeOpen} modal>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={false}
                                className={cn(!field.value && "text-muted-foreground", "w-full justify-between dark:bg-neutral-900")}
                              >
                                <div className="flex gap-4">
                                  {units?.find(unit => unit?.value === field?.value)?.label}
                                </div>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 popover-content-width-fix">
                              <Command className="pl-1">
                                <CommandList>
                                  <CommandGroup>
                                    {units.map((unit, index) => (
                                      <CommandItem
                                        key={index}
                                        value={unit.value}
                                        onSelect={(currentValue) => {
                                          field.onChange(currentValue);
                                          form.setValue("start", undefined);
                                          form.setValue("end", undefined);
                                          form.setValue("is_recurring", currentValue === "dayOfWeek");
                                          form.setValue("day_of_week", undefined)
                                          form.clearErrors();
                                          setTimeout(() => {
                                            setIsTypeOpen(false);
                                            setType(currentValue);
                                          }, 100)
                                        }}
                                        className="cursor-pointer"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value === unit.value ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {unit.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {type === "dayOfWeek" &&
                    <FormField
                      control={form.control}
                      name={`day_of_week`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                          <FormLabel>Dia</FormLabel>
                          <FormControl>
                            <Popover open={isDayOfWeekOpen} onOpenChange={setIsDayOfWeekOpen} modal>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={false}
                                  className={cn(!field.value && "text-muted-foreground", "w-full justify-between dark:bg-neutral-900")}
                                >
                                  <div className="flex gap-4">
                                    {daysOfWeek?.find(dayOfWeek => dayOfWeek.value === field.value)?.label}
                                  </div>
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="p-0 popover-content-width-fix">
                                <Command className="pl-1">
                                  <CommandList>
                                    <CommandGroup>
                                      {daysOfWeek.map((dayOfWeek, index) => (
                                        <CommandItem
                                          key={index}
                                          value={dayOfWeek.label}
                                          onSelect={(currentValue) => {
                                            field.onChange(dayOfWeek.value);
                                            setTimeout(() => {
                                              setIsDayOfWeekOpen(false);
                                            }, 100)
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === dayOfWeek.value ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {dayOfWeek.label}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  }
                  <FormField
                    control={form.control}
                    name="start"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-left">Início</FormLabel>
                        <FormControl>
                          <TimePicker
                            className="dark:hover:bg-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:!text-neutral-200"
                            onChange={(date) => {
                              field.onChange(date);
                              if (date) {
                                const newDate = new Date(date);
                                newDate.setMinutes(newDate.getMinutes() + (appointment.details?.durationMinutes ?? 0));
                                setAutoEndDate(newDate);
                                setIsCalendarOpen(false);
                              }
                            }}
                            onClick={() => setIsCalendarOpen(true)}
                            onInteractOutside={(e) => {
                              if (isCalendarOpen) {
                                setIsCalendarOpen(false);
                              }
                            }}
                            value={appointment.start}
                            disabled={!appointment.start}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="end"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-left">Fim</FormLabel>
                        <FormControl>
                          <TimePicker
                            className="dark:hover:bg-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:!text-neutral-200"
                            onChange={(date) => {
                              field.onChange(date);
                              setIsCalendarOpen(false);
                            }}
                            onClick={() => setIsCalendarOpen(true)}
                            onInteractOutside={(e) => {
                              if (isCalendarOpen) {
                                setIsCalendarOpen(false);
                              }
                            }}
                            value={autoEndDate ?? appointment.end}
                            disabled={!appointment.end}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
                <DialogFooter className="flex items-center">
                  <Button
                    form="blocked-time-slots"
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Salvar
                  </Button>
                </DialogFooter>
              </Form>
            ) : (
              <div className="flex justify-center items-center w-full h-[70vh]">
                <Loading display={isLoading} className="!scale-[0.5]" />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent
        className={cn("pb-1.5 !px-0 hidden")}
      >

      </CardContent>
    </Card>
  );
};
export default OtherAppointment;
