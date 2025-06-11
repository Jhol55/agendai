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
import { IconBriefcase, IconUser, IconCalendarDollar, IconCurrencyDollar, IconCircleCheck, IconVideo, IconVideoOff, IconMapPin, IconMapPinOff, IconBan, IconCalendar } from "@tabler/icons-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Loading } from "../ui/loading/loading";
import { Typography } from "../ui/typography";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { blockedTimesSchema, UpdatedBlockTimeSlotsProps } from "@/models/BlockTimeSlots";
import { AddBlockedTimeSlot, deleteBlockedTimeSlot, updateBlockedTimeSlot } from "@/services/block-time-slots";
import { TextArea } from "../ui/text-area";
import { useSettings } from "@/hooks/use-settings";
import { HorizontalSeparator } from "../ui/separator/separator";

type ServiceType = {
  id: string,
  name: string,
  price: number,
  duration_minutes: number,
  allow_online: boolean,
  allow_in_person: boolean
}

interface AppointmentProps {
  appointment: AppointmentType & UpdatedBlockTimeSlotsProps & { type: "appointment" | "other" };
  resourceId: string;
  columnIndex: number;
  className?: string;
}

const Appointment: React.FC<AppointmentProps> = ({
  appointment,
  resourceId,
  columnIndex,
  className
}) => {
  const { updateAppointment, removeAppointment, addAppointment, handleUpdate, currentCalendarId, settings } = usePlannerData();
  const [isPending, startOnSubmitTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const [isOpened, setIsOpened] = useState(false);
  const [isRemoveAppointmentOpen, setIsRemoveAppointmentOpen] = useState(false);
  const [isRemoveOtherOpen, setIsRemoveOtherOpen] = useState(false);
  const [openClient, setOpenClient] = React.useState(false);
  const [openService, setOpenService] = React.useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [clients, setClients] = React.useState<{ id: string, name: string }[]>([]);
  const [services, setServices] = React.useState<ServiceType[]>([]);
  const [currentService, setCurrentService] = React.useState<ServiceType | undefined>(undefined);
  const [clientSearchValue, setClientSearchValue] = React.useState("");
  const [serviceSearchValue, setServiceSearchValue] = React.useState("");
  const [isClientSearching, setIsClientSearching] = React.useState(false);
  const [isServiceSearching, setIsServiceSearching] = React.useState(false);
  const [autoEndDate, setAutoEndDate] = React.useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeeRefundOpen, setIsFeeRefundOpen] = useState(false);
  const [isServiceRefundOpen, setIsServiceRefundOpen] = useState(false);
  const [type, setType] = useState<"appointment" | "other" | undefined>(undefined);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isDayOfWeekOpen, setIsDayOfWeekOpen] = useState(false);

  useEffect(() => {
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
  }, [appointment, columnIndex, resourceId]);

  const defaultPayments = useMemo(() => [
    {
      type: "fee",
      value: undefined,
      status: "pending",
      sendPaymentLink: false,
      dueDate: undefined,
    },
    {
      type: "service",
      value: undefined,
      status: "pending",
      sendPaymentLink: false,
      dueDate: undefined,
    },
  ], []);

  const defaultValues = useMemo(() => ({
    title: appointment.title,
    calendarId: appointment.calendarId,
    clientId: appointment.clientId,
    start: appointment?.original_start ?? appointment.start,
    end: appointment?.original_end ?? appointment.end,
    status: appointment?.status || "pending",
    details: {
      service: appointment.details?.service,
      serviceId: appointment.details?.serviceId,
      durationMinutes: appointment.details?.durationMinutes,
      online: appointment.details?.online || false,
      payments: (appointment?.details?.payments || defaultPayments)
        .sort((a, b) => a.type.localeCompare(b.type))
        .filter(payment => payment.status !== "refunded")
        .map(payment => ({
          ...payment,
          sendPaymentLink: false,
          dueDate: (() => {
            const [year, month, day] = String(payment.dueDate).split("-").map(Number);
            let date = new Date(year, month - 1, day);
            if (isNaN(date.getTime())) {
              date = payment.dueDate;
            }
            return date;
          })()
        }))
    }
  }), [appointment, defaultPayments]);

  const otherDefaultValues = useMemo(() => ({
    id: appointment.id,
    freq: appointment?.freq ?? "period",
    start: appointment?.original_start ?? appointment.start,
    end: appointment?.original_end ?? appointment.end,
    blocked: appointment.blocked ?? false,
    interval: appointment?.interval ?? 1,
    is_recurring: appointment?.is_recurring || false,
    day_of_week: appointment.start.getDay(),
    description: appointment?.description ?? "",
  }), [appointment]);

  const form = useForm<z.infer<typeof updateAppointmentSchema>>({
    resolver: zodResolver(updateAppointmentSchema),
    defaultValues: defaultValues,
  });

  const otherForm = useForm<z.infer<typeof blockedTimesSchema>>({
    resolver: zodResolver(blockedTimesSchema),
    defaultValues: otherDefaultValues,
  });

  const watch = form.watch();
  const otherWatch = otherForm.watch();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      form.reset({
        ...defaultValues
      });
      otherForm.reset({
        ...otherDefaultValues
      });
      setIsLoading(!isOpened);
    }, 500)
    return () => clearTimeout(timeoutId);

  }, [defaultValues, form, isOpened, otherDefaultValues, otherForm]);

  const onSubmit = useCallback((values: z.infer<typeof updateAppointmentSchema>) => {
    let canSubmit = true;

    if (appointment?.details?.payments) {
      const originalPayments = appointment.details.payments
        .sort((a, b) => a.type.localeCompare(b.type))
        .filter(payment => payment.status !== "refunded")
        .map(payment => ({
          ...payment,
          sendPaymentLink: false,
          dueDate: (() => {
            const [year, month, day] = String(payment.dueDate).split("-").map(Number);
            let date = new Date(year, month - 1, day);
            if (isNaN(date.getTime())) {
              date = payment.dueDate
            }
            return date
          })()
        }))

      const payments = values.details.payments
        .sort((a, b) => a.type.localeCompare(b.type))

      originalPayments.map((payment, index) => {
        if (payment.dueDate.toISOString() !== payments[index].dueDate.toISOString()) {

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const dueDate = payments[index].dueDate;
          dueDate.setHours(0, 0, 0, 0);

          if (dueDate.getTime() < today.getTime()) {
            form.setError(`details.payments.${index}.dueDate`, {
              message: "A data de vencimento deve ser igual ou posterior à data de hoje."
            })
            canSubmit = false;
          }
        }
      })
    }

    if (canSubmit) {
      startOnSubmitTransition(() => {
        toast.promise(
          async () => {
            if (appointment.type === "appointment" && type === "appointment") {
              await updateAppointment({
                ...appointment,
                ...values,
              });
            } else {
              await deleteBlockedTimeSlot({ id: appointment.id })
              await addAppointment({
                ...appointment,
                ...values,
              })
            }
            setTimeout(() => {
              handleUpdate();
              setIsOpened(false);
              setAutoEndDate(undefined);
            }, 500);
          },
          {
            loading: "Atualizando compromisso...",
            success: "Compromisso atualizado com sucesso!",
            error: "Ocorreu um erro ao atualizar o compromisso. Tente novamente!",
          }
        );
      });
    }
  }, [addAppointment, appointment, form, handleUpdate, type, updateAppointment])

  const onSubmitOther = useCallback((values: z.infer<typeof blockedTimesSchema>) => {
    startOnSubmitTransition(() => {
      toast.promise(
        async () => {
          if (appointment.type === "other" && type === "other") {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await updateBlockedTimeSlot({
              data: values
            });
          } else {
            await new Promise((resolve) => setTimeout(resolve, 500));
            await removeAppointment(appointment.id);
            await AddBlockedTimeSlot({
              data: values,
            });
          }
          setTimeout(() => {
            handleUpdate();
            setIsOpened(false);
            setAutoEndDate(undefined);
          }, 500);
        },
        {
          loading: "Atualizando compromisso...",
          success: "Compromisso atualizado com sucesso!",
          error: "Ocorreu um erro ao atualizar o compromisso. Tente novamente!",
        }
      );
    });
  }, [appointment, handleUpdate, removeAppointment, type])

  const onRemove = useCallback((id: string) => {
    startOnSubmitTransition(() => {
      toast.promise(
        (async () => {
          setIsOpened(false);
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (appointment.type === "other" && type === "other") {
            await deleteBlockedTimeSlot({ id })
          } else {
            await removeAppointment(id);
          }
          handleUpdate();
          setIsOpened(false);
          setAutoEndDate(undefined);
        })(),
        {
          loading: "Removendo compromisso...",
          success: "Compromisso removido com sucesso!",
          error: "Ocorreu um erro ao remover o compromisso. Tente novamente!",
        }
      );
    });
  }, [appointment.type, handleUpdate, removeAppointment, type]);

  useEffect(() => {
    if (clientSearchValue) {
      setIsClientSearching(true);
      const timeoutId = setTimeout(() => {
        return getClients({ name: clientSearchValue }).then(data => {
          setClients(data);
          setIsClientSearching(false);
        })
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [clientSearchValue]);

  useEffect(() => {
    if (serviceSearchValue) {
      setIsServiceSearching(true);
      const timeoutId = setTimeout(() => {
        return getServices({ name: serviceSearchValue }).then(data => {
          setServices(data?.services);
          setIsServiceSearching(false);
        })
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [serviceSearchValue]);

  useEffect(() => {
    if (!isOpened) {
      setClientSearchValue("");
      setServiceSearchValue("");
      setAutoEndDate(undefined);
      setTimeout(() => {
        form.reset();
        otherForm.reset();
        setIsLoading(true);
      }, 500)
    }
    setType(appointment.type)
  }, [appointment.type, form, isOpened, otherForm])


  const findPaymentIndex = useCallback((type: string) => {
    return form.getValues('details.payments')
      .findIndex(payment => payment.type === type && payment.status !== "refunded");
  }, [form])

  const feeIndex = useMemo(() => findPaymentIndex("fee"), [findPaymentIndex]);
  const serviceIndex = useMemo(() => findPaymentIndex("service"), [findPaymentIndex]);

  const units = useMemo(() => [
    { label: "Período", value: "period" },
    { label: "Diário", value: "daily" },
    { label: "Semanal", value: "weekly" }
  ], []);

  useEffect(() => {
    setType(appointment.type);
  }, [appointment.type])

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
      appointment?.type === "appointment"
        ? "bg-skyblue dark:bg-skyblue"
        : appointment?.type === "other"
          ? appointment.blocked
            ? "bg-red-500 dark:bg-red-500"
            : "bg-neutral-500 dark:bg-neutral-500"
          : "!hidden",
      className,
    )}
      onDoubleClick={(e) => {
        setIsOpened(true);
        e.stopPropagation();
        handleUpdate();
      }}>
      <CardHeader className="absolute w-full flex flex-row items-center justify-between p-1">
        <Badge variant={"outline"} className="pointer-events-none border-none rounded-sm dark:border-neutral-700 transition-colors duration-150 truncate px-1 text-xs w-full whitespace-nowrap inline-block">
          <div className="flex justify-start w-full">
            {appointment?.type === "appointment"
              ? appointment.details?.online
                ? <IconVideo className={cn(
                  "w-4 h-4 min-w-4 min-h-4 text-white/90",
                  appointment.status === "confirmed" && "text-green-600",
                  appointment.status === "canceled" && "text-red-600"
                )} />
                : <IconMapPin className={cn(
                  "w-4 h-4 min-w-4 min-h-4 text-white/90",
                  appointment.status === "confirmed" && "text-green-600",
                  appointment.status === "canceled" && "text-red-600"
                )} />
              : appointment.blocked
                ? <IconBan className="w-4 h-4 min-w-4 min-h-4 text-white/90" />
                : <IconCalendar className="w-4 h-4 min-w-4 min-h-4 text-white/90" />
            }
            <Typography variant="p" className="!text-white truncate pl-1">
              {appointment?.title ?? appointment?.description}
            </Typography>
          </div>
        </Badge>
        <Dialog open={isOpened} onOpenChange={setIsOpened}>
          <DialogContent
            aria-describedby={undefined}
            className="max-w-[98vw] md:max-w-[36rem] max-h-[95vh] h-screen rounded-md overflow-hidden !p-0 bg-neutral-50 dark:bg-neutral-900"
            onInteractOutside={(e) => {
              e.preventDefault();
              if (!openClient && !openService && !isCalendarOpen) {
                setIsOpened(false);
              }
            }}
          >
            <DialogHeader className="flex flex-col items-start gap-2 mb-2 px-[1.5rem] pt-[1.5rem]">
              <DialogTitle>Editar Agendamento</DialogTitle>
            </DialogHeader>
            {!isLoading ? (
              <>
                <Form {...form}>
                  <form id="update-appointment" onSubmit={form.handleSubmit(onSubmit)} className={cn(type !== "appointment" && "hidden", "space-y-8 md:max-h-[75vh] max-h-[65vh] h-screen overflow-auto px-[1.5rem] pb-[1.5rem]")}>
                    <div className="flex gap-2 w-full">
                      <Button
                        variant={type === "appointment" ? "default" : "outline"}
                        className={cn(
                          "flex-1 sm:w-full hover:bg-green-500 dark:hover:bg-green-500 hover:!text-white dark:!text-white !text-neutral-700",
                          type === "appointment" && "bg-green-500 dark:bg-green-500 !text-white hover:bg-green-500 dark:hover:bg-green-500"
                        )}
                        type="button"
                        onClick={() => {
                          setType("appointment");
                          form.reset(defaultValues);
                          otherForm.reset(otherDefaultValues);
                          setAutoEndDate(undefined);
                          setCurrentService(undefined);
                        }}
                      >
                        Serviço
                      </Button>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "flex-1 hover:bg-neutral-500 dark:hover:bg-neutral-500 hover:!text-white dark:!text-white !text-neutral-700"
                        )}
                        type="button"
                        onClick={() => {
                          setType("other");
                          form.reset(defaultValues);
                          otherForm.reset(otherDefaultValues);
                          setAutoEndDate(undefined);
                          setCurrentService(undefined);
                        }}
                      >
                        Outros
                      </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="flex flex-col mt-2.5">
                          <FormLabel className="text-left">Status</FormLabel>
                          <FormControl>
                            <div className="flex gap-2 w-full">
                              <Button
                                onClick={() => {
                                  field.onChange("pending")
                                }}
                                variant={field.value === "pending" ? "default" : "outline"}
                                className={cn(
                                  "flex-1 hover:bg-neutral-500 dark:hover:bg-neutral-500 hover:!text-white dark:!text-white !text-neutral-700",
                                  field.value === "pending" && "bg-neutral-500 dark:bg-neutral-500 !text-white hover:bg-neutral-500 dark:hover:bg-neutral-500"
                                )}
                                type="button"
                              >
                                Pendente
                              </Button>
                              <Button
                                onClick={() => {
                                  field.onChange("confirmed")
                                }}
                                variant={field.value === "confirmed" ? "default" : "outline"}
                                className={cn(
                                  "flex-1 sm:w-full hover:bg-green-500 dark:hover:bg-green-500 hover:!text-white dark:!text-white !text-neutral-700",
                                  field.value === "confirmed" && "bg-green-500 dark:bg-green-500 !text-white hover:bg-green-500 dark:hover:bg-green-500"
                                )}
                                type="button"
                              >
                                Confirmado
                              </Button>
                              <Button
                                onClick={() => {
                                  field.onChange("canceled")
                                }}
                                variant={field.value === "canceled" ? "default" : "outline"}
                                className={cn(
                                  "flex-1 sm:w-full hover:bg-red-500 dark:hover:bg-red-500 hover:!text-white dark:!text-white !text-neutral-700",
                                  field.value === "canceled" && "bg-red-500 dark:bg-red-500 !text-white hover:bg-red-500 dark:hover:bg-red-500"
                                )}
                                type="button"
                              >
                                Cancelado
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Cliente</FormLabel>
                          <FormControl>
                            <Popover open={openClient} onOpenChange={setOpenClient} modal>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(!field.value && "text-muted-foreground", "w-full justify-between dark:bg-neutral-900 dark:hover:bg-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:!text-neutral-200")}
                                >
                                  <div className="flex gap-4 items-center">
                                    <IconUser />
                                    {watch.title ?? appointment.title}
                                  </div>
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="p-0 popover-content-width-fix">
                                <Command className="pl-1">
                                  <CommandInput
                                    placeholder="Nome..."
                                    className="ml-2"
                                    onInput={(e) => setClientSearchValue((e.target as HTMLInputElement).value)}
                                  />
                                  <CommandList className={cn(!clientSearchValue && "hidden")}>
                                    <div className="flex justify-center">
                                      <Loading display={isClientSearching} className="!scale-[0.3]" />
                                      {!isClientSearching && <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>}
                                    </div>
                                    <CommandGroup>
                                      {!isClientSearching && clients?.map((client) => (
                                        <CommandItem
                                          key={client.id}
                                          value={client.name}
                                          onSelect={(value) => {
                                            field.onChange(value);
                                            setOpenClient(false);
                                            setClientSearchValue("");
                                            form.setValue("clientId", Number(client.id))
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              field.value === client.name ? "opacity-100" : "opacity-0"
                                            )}
                                          />
                                          {client.name}
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
                    <div>
                      <FormField
                        control={form.control}
                        name="details.service"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Serviço</FormLabel>
                            <FormControl>
                              <Popover open={openService} onOpenChange={setOpenService} modal>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openService}
                                    className={cn(!field.value && "text-muted-foreground", "w-full justify-between dark:bg-neutral-900 dark:hover:bg-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:!text-neutral-200")}
                                  >
                                    <div className="flex gap-4 items-center">
                                      <IconBriefcase />
                                      {field.value ?? watch?.details?.service}
                                    </div>
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 popover-content-width-fix">
                                  <Command className="pl-1">
                                    <CommandInput
                                      placeholder="Nome..."
                                      className="ml-2"
                                      onInput={(e) => setServiceSearchValue((e.target as HTMLInputElement).value)}
                                    />
                                    <CommandList className={cn(!serviceSearchValue && "hidden")}>
                                      <div className="flex justify-center">
                                        <Loading display={isServiceSearching} className="!scale-[0.3]" />
                                        {!isServiceSearching && <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>}
                                      </div>
                                      <CommandGroup>
                                        {!isServiceSearching && services?.map((service) => (
                                          <CommandItem
                                            key={service.id}
                                            value={service.name + service.id}
                                            onSelect={(value) => {
                                              field.onChange(value.replace(service.id, ""));
                                              setOpenService(false);
                                              setServiceSearchValue("");
                                              setCurrentService(service);
                                              form.setValue("details.serviceId", Number(service.id));
                                              form.setValue("details.durationMinutes", service.duration_minutes);
                                              if (watch.start) {
                                                const newDate = new Date(watch.start);
                                                newDate.setMinutes(newDate.getMinutes() + (service.duration_minutes ?? 0));
                                                setAutoEndDate(newDate);
                                                setIsCalendarOpen(false);
                                              }
                                              form.setValue(`details.payments.${feeIndex}.value`,
                                                settings
                                                  ? Number(settings.scheduling[settings.scheduling.findIndex(item => item.type === "tax")].value)
                                                  : 0);
                                              form.setValue(`details.payments.${serviceIndex}.value`, service.price - (watch.details.payments[feeIndex].value || 0));

                                              if (watch.start) {
                                                const newDate = new Date(watch.start);
                                                newDate.setMinutes(newDate.getMinutes() + (service.duration_minutes || 0));
                                                setAutoEndDate(newDate);

                                                form.setValue(`details.payments.${feeIndex}.dueDate`, (() => {
                                                  let dueDate = new Date(
                                                    watch.start.getTime() - Number(settings?.scheduling[settings.scheduling.findIndex(item => item.type === "tax_deadline_value")].value) * 86400000
                                                  )
                                                  if (dueDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
                                                    dueDate = new Date()
                                                  }
                                                  return dueDate
                                                })())
                                                form.setValue(`details.payments.${serviceIndex}.dueDate`, (() => {
                                                  let dueDate = new Date(
                                                    watch.start.getTime() + Number(settings?.scheduling[settings.scheduling.findIndex(item => item.type === "payment_deadline_value")].value) * 86400000
                                                  )
                                                  if (dueDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
                                                    dueDate = new Date()
                                                  }
                                                  return dueDate
                                                })())
                                              }
                                            }}
                                            className="cursor-pointer"
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                (currentService?.id ? currentService.id === service.id : String(appointment.details?.serviceId) == service.id) ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            <div className="w-full whitespace-nowrap">
                                              {service.name}
                                            </div>
                                            <div className="flex w-full justify-between">
                                              <div className="flex gap-1 items-center">
                                                {service.allow_online
                                                  ? <IconVideo className="w-4 h-4" />
                                                  : <IconVideoOff className="w-4 h-4 text-red-600" />
                                                }
                                                {service.allow_in_person
                                                  ? <IconMapPin className="w-4 h-4" />
                                                  : <IconMapPinOff className="w-4 h-4 text-red-600" />
                                                }
                                              </div>
                                              <div>
                                                {service?.price?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                              </div>
                                              <div>
                                                {service.duration_minutes} min
                                              </div>
                                            </div>
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
                      <FormField
                        control={form.control}
                        name="details.online"
                        render={({ field }) => (
                          <FormItem className="flex flex-col mt-2.5">
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked: boolean) => {
                                    field.onChange(checked);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-left">Videoconferência</FormLabel>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex sm:flex-row flex-col sm:gap-2 gap-0">
                      <FormField
                        control={form.control}
                        name="start"
                        render={({ field }) => (
                          <FormItem className="flex flex-col w-full">
                            <FormLabel className="text-left">Início</FormLabel>
                            <FormControl>
                              <TimePicker
                                className="dark:hover:bg-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:!text-neutral-200"
                                onChange={(date) => {
                                  field.onChange(date);
                                  if (date && watch.details.service) {
                                    const newDate = new Date(date);
                                    newDate.setMinutes(newDate.getMinutes() + (watch.details?.durationMinutes ?? 0));
                                    setAutoEndDate(newDate);
                                    setIsCalendarOpen(false);
                                    form.setValue(`details.payments.${feeIndex}.dueDate`, (() => {
                                      let dueDate = new Date(
                                        date.getTime() - Number(settings?.scheduling[settings.scheduling.findIndex(item => item.type === "tax_deadline_value")].value) * 86400000
                                      )
                                      if (dueDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
                                        dueDate = new Date()
                                      }
                                      return dueDate
                                    })())
                                    form.setValue(`details.payments.${serviceIndex}.dueDate`, (() => {
                                      let dueDate = new Date(
                                        date.getTime() + Number(settings?.scheduling[settings.scheduling.findIndex(item => item.type === "payment_deadline_value")].value) * 86400000
                                      )
                                      if (dueDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
                                        dueDate = new Date()
                                      }
                                      return dueDate
                                    })())
                                  }
                                }}
                                onClick={() => setIsCalendarOpen(true)}
                                onInteractOutside={(e) => {
                                  if (isCalendarOpen) {
                                    setIsCalendarOpen(false);
                                  }
                                }}
                                value={watch.start}
                                disabled={!watch.start}
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
                          <FormItem className="flex flex-col w-full">
                            <FormLabel className="text-left">Fim</FormLabel>
                            <FormControl>
                              <TimePicker
                                className="dark:hover:bg-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:!text-neutral-200"
                                placeholder="Selecione uma data"
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
                                value={autoEndDate ?? watch.end}
                                disabled={!watch.end}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <HorizontalSeparator label="Financeiro" variant="span" />
                    <div className="flex flex-col items-center w-full">
                      <div className="flex items-center gap-2 w-full">
                        <FormField
                          control={form.control}
                          name={`details.payments.${feeIndex}.value`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col w-full">
                              <FormLabel className="text-left">Taxa de reserva</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Valor"
                                  spellCheck={false}
                                  value={Number(field.value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                  onChange={(e) => {
                                    const numericValue = e.target.value.replace(/\D/g, "");
                                    field.onChange(numericValue ? Number(numericValue) / 100 : "");
                                  }}
                                  className={cn(
                                    "bg-neutral-100 dark:!text-neutral-200",
                                    watch.details.payments[feeIndex].status !== "pending" && watch.details.payments[feeIndex].status !== undefined && "pointer-events-none"
                                  )}
                                  // disabled={!watch.start || !watch.details.service}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`details.payments.${feeIndex}.dueDate`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col w-full">
                              <FormLabel className="text-left">Data de vencimento</FormLabel>
                              <FormControl>
                                <TimePicker
                                  className={cn(watch.details.payments[feeIndex].status !== "pending" && watch.details.payments[feeIndex].status !== undefined && "pointer-events-none", "dark:hover:bg-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:!text-neutral-200")}
                                  placeholder="Selecione uma data"
                                  value={field.value}
                                  mode="date"
                                  onChange={(date) => {
                                    field.onChange(date);
                                    setIsCalendarOpen(false)
                                    if (date) {
                                      form.clearErrors([`details.payments.${feeIndex}.dueDate`])
                                    }
                                  }}
                                  onClick={() => setIsCalendarOpen(true)}
                                  onInteractOutside={(e) => {
                                    if (isCalendarOpen) {
                                      setIsCalendarOpen(false);
                                    }
                                  }}
                                  disabled={!watch.start || !watch.details.service}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center w-full">
                        <FormField
                          control={form.control}
                          name={`details.payments.${feeIndex}.sendPaymentLink`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col gap-2 mt-2.5 w-full">
                              <div className="flex gap-2 items-center !mr-auto">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked: boolean) => {
                                      field.onChange(checked);
                                      if (checked) {
                                        form.clearErrors([`details.payments.${feeIndex}.status`, `details.payments.${feeIndex}.sendPaymentLink`])
                                      }
                                    }}
                                    disabled={["received", "confirmed"].includes(watch.details.payments[feeIndex].status) || !watch.start || !watch.details.service}
                                  />
                                </FormControl>
                                <FormLabel className="text-left !mt-[1px] w-full">Enviar link de pagamento</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <div className="flex w-full justify-between">
                          <FormField
                            control={form.control}
                            name={`details.payments.${feeIndex}.status`}
                            render={({ field }) => (
                              <FormItem className="flex gap-2 items-center ml-auto mt-2.5">
                                <div className="flex gap-2 items-center !mr-auto">
                                  <FormControl>
                                    {watch.details.payments[feeIndex]?.billingType !== "cash" &&
                                      watch.details.payments[feeIndex]?.billingType !== null &&
                                      watch.details.payments[feeIndex]?.status !== "pending" &&
                                      field.value !== "pending" &&
                                      appointment.type === "appointment"
                                      ? (
                                        <AlertDialog open={isFeeRefundOpen} onOpenChange={setIsFeeRefundOpen}>
                                          <AlertDialogTrigger className="flex items-center">
                                            <Checkbox
                                              checked={["received", "confirmed"].includes(field.value)}
                                              onClick={() => setIsFeeRefundOpen(true)}
                                              disabled={watch.details.payments[feeIndex].sendPaymentLink}
                                            />
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle asChild>
                                                <Typography
                                                  variant="h2"
                                                >
                                                  Tem certeza que deseja continuar?
                                                </Typography>
                                              </AlertDialogTitle>
                                              <AlertDialogDescription>
                                                <Typography
                                                  variant="span"
                                                  secondary
                                                >
                                                  Esta ação estornará o pagamento selecionado e não poderá ser desfeita após salvar o formulário.
                                                </Typography>
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel
                                                onClick={(e) => {
                                                  className = "!text-white dark!:text-white"
                                                  e.preventDefault();
                                                  field.onChange(field.value);
                                                  setIsFeeRefundOpen(false);
                                                }}
                                              >
                                                Voltar
                                              </AlertDialogCancel>
                                              <AlertDialogAction
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  setIsFeeRefundOpen(false);
                                                  field.onChange("pending");
                                                }}
                                              >
                                                Continuar
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>

                                      ) : (
                                        <Checkbox
                                          checked={["received", "confirmed"].includes(field.value)}
                                          onCheckedChange={(checked: boolean) => {
                                            field.onChange(checked ? "received" : "pending");
                                            if (checked) {
                                              form.clearErrors([`details.payments.${feeIndex}.status`, `details.payments.${feeIndex}.sendPaymentLink`])
                                            }
                                          }}
                                          disabled={watch.details.payments[feeIndex].sendPaymentLink || !watch.start || !watch.details.service}
                                        />
                                      )}
                                  </FormControl>
                                  <FormLabel className="text-left !mt-[1px]">Recebido</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <FormMessage className="mt-2.5 w-full">
                        {form?.formState?.errors?.details?.payments?.[feeIndex]?.dueDate?.message || ""}
                      </FormMessage>
                    </div>
                    <div className="flex flex-col items-center w-full">
                      <div className="flex items-center gap-2 w-full">
                        <FormField
                          control={form.control}
                          name={`details.payments.${serviceIndex}.value`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col w-full">
                              <FormLabel className="text-left">Valor restante</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Valor"
                                  spellCheck={false}
                                  value={Number(field.value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                  onChange={(e) => {
                                    const numericValue = e.target.value.replace(/\D/g, "");
                                    field.onChange(numericValue ? Number(numericValue) / 100 : "");
                                  }}
                                  className={cn(
                                    "bg-neutral-100 dark:!text-neutral-200",
                                    watch.details.payments[serviceIndex].status !== "pending" && "pointer-events-none"
                                  )}
                                  disabled={!watch.start || !watch.details.service}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`details.payments.${serviceIndex}.dueDate`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col w-full">
                              <FormLabel className="text-left">Data de vencimento</FormLabel>
                              <FormControl>
                                <TimePicker
                                  className={cn(watch.details.payments[serviceIndex].status !== "pending" && "pointer-events-none", "dark:hover:bg-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:!text-neutral-200")}
                                  placeholder="Selecione uma data"
                                  value={field.value}
                                  mode="date"
                                  onChange={(date) => {
                                    field.onChange(date);
                                    setIsCalendarOpen(false);
                                    if (date) {
                                      form.clearErrors([`details.payments.${serviceIndex}.dueDate`])
                                    }
                                  }}
                                  onClick={() => setIsCalendarOpen(true)}
                                  onInteractOutside={(e) => {
                                    if (isCalendarOpen) {
                                      setIsCalendarOpen(false);
                                    }
                                  }}
                                  disabled={!watch.start || !watch.details.service}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center w-full">
                        <FormField
                          control={form.control}
                          name={`details.payments.${serviceIndex}.sendPaymentLink`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col gap-2 mt-2.5 w-full">
                              <div className="flex gap-2 items-center !mr-auto">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked: boolean) => {
                                      field.onChange(checked);
                                    }}
                                    disabled={["received", "confirmed"].includes(watch.details.payments[serviceIndex].status) || !watch.start || !watch.details.service}
                                  />
                                </FormControl>
                                <FormLabel className="text-left !mt-[1px] w-full">Enviar link de pagamento</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                        <div className="flex w-full justify-between">
                          <FormField
                            control={form.control}
                            name={`details.payments.${serviceIndex}.status`}
                            render={({ field }) => (
                              <FormItem className="flex gap-2 items-center ml-auto mt-2.5">
                                <div className="flex gap-2 items-center !mr-auto">
                                  <FormControl>
                                    {watch.details.payments[serviceIndex]?.billingType !== "cash" &&
                                      watch.details.payments[serviceIndex]?.billingType != null &&
                                      watch.details.payments[serviceIndex]?.status !== "pending" &&
                                      field.value !== "pending" &&
                                      appointment.type === "appointment"
                                      ? (
                                        <AlertDialog open={isServiceRefundOpen} onOpenChange={setIsServiceRefundOpen}>
                                          <AlertDialogTrigger className="flex items-center">
                                            <Checkbox
                                              checked={["received", "confirmed"].includes(field.value)}
                                              onClick={() => setIsServiceRefundOpen(true)}
                                              disabled={watch.details.payments[serviceIndex].sendPaymentLink}
                                            />
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle asChild>
                                                <Typography
                                                  variant="h2"
                                                >
                                                  Tem certeza que deseja continuar?
                                                </Typography>
                                              </AlertDialogTitle>
                                              <AlertDialogDescription>
                                                <Typography
                                                  variant="span"
                                                  secondary
                                                >
                                                  Esta ação estornará o pagamento selecionado e não poderá ser desfeita após salvar o formulário.
                                                </Typography>
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel
                                                className="!text-white dark!:text-white"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  field.onChange(field.value);
                                                  setIsServiceRefundOpen(false);
                                                }}
                                              >
                                                Voltar
                                              </AlertDialogCancel>
                                              <AlertDialogAction
                                                className="bg-red-500 hover:bg-red-600 text-white"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  setIsServiceRefundOpen(false);
                                                  field.onChange("pending");
                                                }}
                                              >
                                                Continuar
                                              </AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                      ) : (
                                        <Checkbox
                                          checked={["received", "confirmed"].includes(field.value)}
                                          onCheckedChange={(checked: boolean) => {
                                            field.onChange(checked ? "received" : "pending");
                                            if (checked) {
                                              form.clearErrors([`details.payments.${serviceIndex}.status`, `details.payments.${serviceIndex}.sendPaymentLink`])
                                            }
                                          }}
                                          disabled={watch.details.payments[serviceIndex].sendPaymentLink || !watch.start || !watch.details.service}
                                        />
                                      )}
                                  </FormControl>
                                  <FormLabel className="text-left !mt-[1px]">Recebido</FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <FormMessage className="mt-2.5 w-full">
                        {form?.formState?.errors?.details?.payments?.[serviceIndex]?.dueDate?.message || ""}
                      </FormMessage>
                    </div>
                  </form>
                  <DialogFooter className={cn(type !== "appointment" && "!hidden", "flex flex-row w-full justify-end gap-2 px-[2.3rem] mb-6")}>
                    <AlertDialog open={isRemoveAppointmentOpen} onOpenChange={setIsRemoveAppointmentOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          type="button"
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsRemoveAppointmentOpen(true);
                          }}
                        >
                          Remover
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[98vw] md:w-full rounded-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle asChild>
                            <Typography
                              variant="h2"
                            >
                              Tem certeza que deseja continuar?
                            </Typography>
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            <Typography
                              variant="span"
                              secondary
                            >
                              Esta ação não pode ser desfeita. Isso removerá permanentemente o agendamento selecionado.
                            </Typography>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            className="!text-white dark!:text-white"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsRemoveAppointmentOpen(false);
                            }}
                          >
                            Voltar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsRemoveAppointmentOpen(false);
                              onRemove(appointment.id);
                            }}
                          >
                            Continuar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      form="update-appointment"
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Salvar
                    </Button>
                  </DialogFooter>
                </Form>

                <Form {...otherForm}>
                  <form id="update-other" onSubmit={otherForm.handleSubmit(onSubmitOther)} className={cn(type !== "other" && "hidden", "space-y-8 md:max-h-[75vh] max-h-[65vh] h-screen overflow-auto px-[1.5rem] pb-[1.5rem]")}>
                    <div className="flex gap-2 w-full">
                      <Button
                        variant={"outline"}
                        className={cn(
                          "flex-1 sm:w-full hover:bg-green-500 dark:hover:bg-green-500 hover:!text-white dark:!text-white !text-neutral-700",
                        )}
                        type="button"
                        onClick={() => {
                          setType("appointment");
                          form.reset(defaultValues);
                          otherForm.reset(otherDefaultValues);
                          setAutoEndDate(undefined);
                          setCurrentService(undefined);
                        }}
                      >
                        Serviço
                      </Button>
                      <Button
                        variant={type === "other" ? "default" : "outline"}
                        className={cn(
                          "flex-1 hover:bg-neutral-500 dark:hover:bg-neutral-500 hover:!text-white dark:!text-white !text-neutral-700",
                          type === "other" && "bg-neutral-500 dark:bg-neutral-500 !text-white hover:bg-neutral-500 dark:hover:bg-neutral-500"
                        )}
                        type="button"
                        onClick={() => {
                          setType("other");
                          form.reset(defaultValues);
                          otherForm.reset(otherDefaultValues);
                          setAutoEndDate(undefined);
                          setCurrentService(undefined);
                        }}
                      >
                        Outros
                      </Button>
                    </div>
                    <div className="flex flex-col">
                      <FormField
                        control={otherForm.control}
                        name="freq"
                        render={({ field }) => (
                          <FormItem className="flex flex-col w-full">
                            <FormLabel>Tipo</FormLabel>
                            <FormControl>
                              <Popover open={isTypeOpen} onOpenChange={setIsTypeOpen} modal>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={false}
                                    className={cn(!field.value && "text-muted-foreground", "w-full justify-between dark:bg-neutral-900 dark:hover:bg-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:!text-neutral-200")}
                                  >
                                    <div className="flex gap-4">
                                      {units?.find(unit => unit?.value === field.value)?.label}
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
                                              otherForm.setValue("is_recurring", currentValue !== "period");
                                              otherForm.setValue("day_of_week", undefined);
                                              otherForm.setValue("freq", currentValue);
                                              otherForm.clearErrors();
                                              setTimeout(() => {
                                                setIsTypeOpen(false);
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
                      <FormField
                        control={otherForm.control}
                        name="blocked"
                        render={({ field }) => (
                          <FormItem className="flex flex-col mt-2.5">
                            <div className="flex items-center gap-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked: boolean) => {
                                    field.onChange(checked);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-left">Bloquear horário</FormLabel>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {otherWatch?.freq === "weekly" ?
                      <div className="flex sm:flex-row flex-col sm:gap-2 gap-8">
                        <FormField
                          control={otherForm.control}
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
                                      className={cn(!field.value && "text-muted-foreground", "w-full justify-between dark:bg-neutral-900 bg-neutral-100")}
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
                        <FormField
                          control={otherForm.control}
                          name="interval"
                          render={({ field }) => (
                            <FormItem className="flex flex-col w-full">
                              <FormLabel className="text-left">
                                Intervalo ({
                                  otherWatch.freq === "daily"
                                    ? "Dias"
                                    : otherWatch.freq === "weekly"
                                      ? "Semanas"
                                      : otherWatch.freq === "monthly"
                                        ? "Meses"
                                        : ""
                                })
                              </FormLabel>
                              <FormControl>
                                <Input
                                  value={otherWatch.interval}
                                  onChange={(e) => {
                                    const numericValue = e.target.value.replace(/\D/g, "");
                                    field.onChange(numericValue ? Number(numericValue) : "");
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      : otherWatch.freq === "daily" ?
                        <div className="flex sm:flex-row flex-col sm:gap-2 gap-8">
                          <FormField
                            control={otherForm.control}
                            name="interval"
                            render={({ field }) => (
                              <FormItem className="flex flex-col w-full">
                                <FormLabel className="text-left">
                                  Intervalo ({
                                    otherWatch.freq === "daily"
                                      ? "Dias"
                                      : otherWatch.freq === "weekly"
                                        ? "Semanas"
                                        : otherWatch.freq === "monthly"
                                          ? "Meses"
                                          : ""
                                  })
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    value={otherWatch.interval}
                                    onChange={(e) => {
                                      const numericValue = e.target.value.replace(/\D/g, "");
                                      field.onChange(numericValue ? Number(numericValue) : "");
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        : null

                    }
                    <div className="flex sm:flex-row flex-col sm:gap-2 gap-8">
                      <FormField
                        control={otherForm.control}
                        name="start"
                        render={({ field }) => (
                          <FormItem className="flex flex-col w-full">
                            <FormLabel className="text-left">Início</FormLabel>
                            <FormControl>
                              <TimePicker
                                className="dark:hover:bg-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:!text-neutral-200"
                                placeholder={otherWatch.freq === "period" || otherWatch.freq === "daily" ? "Selecione uma data" : "Selecione um horário"}
                                mode={otherWatch.freq === "period" || otherWatch.freq === "daily" ? "datetime" : "time"}
                                value={otherWatch.start}
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
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={otherForm.control}
                        name="end"
                        render={({ field }) => (
                          <FormItem className="flex flex-col w-full">
                            <FormLabel className="text-left">Fim</FormLabel>
                            <FormControl>
                              <TimePicker
                                className="dark:hover:bg-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:!text-neutral-200"
                                placeholder={otherWatch.freq === "period" || otherWatch.freq === "daily" ? "Selecione uma data" : "Selecione um horário"}
                                mode={otherWatch.freq === "period" || otherWatch.freq === "daily" ? "datetime" : "time"}
                                value={otherWatch.end}
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
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={otherForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-left">Descrição</FormLabel>
                          <FormControl>
                            <TextArea
                              className="!min-h-14 bg-neutral-100"
                              value={otherWatch.description}
                              placeholder=""
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                  <DialogFooter className={cn(type !== "other" && "!hidden", "flex flex-row w-full justify-end gap-2 px-[2.3rem] mb-6")}>
                    <AlertDialog open={isRemoveOtherOpen} onOpenChange={setIsRemoveOtherOpen}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          type="button"
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsRemoveOtherOpen(true);
                          }}
                        >
                          Remover
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[98vw] md:w-full rounded-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle asChild>
                            <Typography
                              variant="h2"
                            >
                              Tem certeza que deseja continuar?
                            </Typography>
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            <Typography
                              variant="span"
                              secondary
                            >
                              Esta ação não pode ser desfeita. Isso removerá permanentemente o agendamento selecionado.
                            </Typography>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            className="!text-white dark!:text-white"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsRemoveOtherOpen(false);
                            }}
                          >
                            Voltar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsRemoveOtherOpen(false);
                              onRemove(appointment.id);
                            }}
                          >
                            Continuar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      form="update-other"
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Salvar
                    </Button>
                  </DialogFooter>
                </Form>
              </>
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
export default Appointment;
