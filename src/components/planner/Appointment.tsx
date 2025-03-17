"use client";

import React, { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Check, ChevronsUpDown, EllipsisVertical, Bot } from "lucide-react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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
import { IconBriefcase, IconUser, IconCalendarDollar, IconCurrencyDollar, IconCircleCheck, IconVideo, IconVideoOff, IconMapPin, IconMapPinOff } from "@tabler/icons-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Loading } from "../ui/loading/loading";
import { Typography } from "../ui/typography";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useCalendar } from "@/contexts/planner/PlannerContext";

type ServiceType = {
  id: string,
  name: string,
  price: number,
  duration_minutes: number,
  allow_online: boolean,
  allow_in_person: boolean
}

interface AppointmentProps {
  appointment: AppointmentType;
  resourceId: string;
  columnIndex: number;
}

const Appointment: React.FC<AppointmentProps> = ({
  appointment,
  resourceId,
  columnIndex,
}) => {
  const { updateAppointment, removeAppointment, handleUpdate } = usePlannerData();
  const { viewMode } = useCalendar();
  const [isPending, startOnSubmitTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [isRemoveAppointmentOpen, setIsRemoveAppointmentOpen] = useState(false);
  const [openClient, setOpenClient] = React.useState(false);
  const [openService, setOpenService] = React.useState(false);
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
      onDragStart: () => setIsDragging(true),
      onDrop: () => {
        setIsDragging(false)
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment]);

  const form = useForm<z.infer<typeof updateAppointmentSchema>>({
    resolver: zodResolver(updateAppointmentSchema),
    defaultValues: {
      title: appointment.title,
      clientId: appointment.clientId,
      start: new Date(appointment.start) ?? new Date(),
      end: new Date(appointment.end) ?? new Date(),
      status: appointment.status,
      details: {
        service: appointment.details.service,
        serviceId: appointment.details.serviceId,
        durationMinutes: appointment.details.durationMinutes,
        online: appointment.details.online,
        payments: appointment.details.payments.map(payment => ({
          ...payment, sendPaymentLink: false, dueDate: new Date(payment.dueDate)
        }))
      }
    },
  });

  useEffect(() => {
    form.reset({
      title: appointment.title,
      clientId: appointment.clientId,
      start: new Date(appointment.start) ?? new Date(),
      end: new Date(appointment.end) ?? new Date(),
      status: appointment.status,
      details: {
        service: appointment.details.service,
        serviceId: appointment.details.serviceId,
        durationMinutes: appointment.details.durationMinutes,
        online: appointment.details.online,
        payments: appointment.details.payments.map(payment => ({
          ...payment, sendPaymentLink: false, dueDate: new Date(payment.dueDate)
        }))
      }
    });
    if (isOpened) {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000)
    }
  }, [appointment, form, isOpened]);

  function onSubmit(values: z.infer<typeof updateAppointmentSchema>) {
    startOnSubmitTransition(() => {
      toast.promise(
        () =>
          new Promise((resolve) => {
            resolve(
              updateAppointment({
                ...appointment,
                ...values,
              }));
          }),
        {
          loading: "Atualizando compromisso...",
          success: "Compromisso atualizado com sucesso!",
          error: "Ocorreu um erro ao atualizar o compromisso. Tente novamente!",
        },
      );
    });
    setTimeout(() => {
      setIsOpened(false);
      setAutoEndDate(undefined);
    }, 500);
    setTimeout(() => {
      handleUpdate();
    }, 1000)
  }

  function onRemove(id: string) {
    setTimeout(() => {
      setIsOpened(false);
      removeAppointment(id);
    }, 500);
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSearchValue]);

  useEffect(() => {
    if (serviceSearchValue) {
      setIsServiceSearching(true);
      const timeoutId = setTimeout(() => {
        return getServices({ name: serviceSearchValue }).then(data => {
          setServices(data);
          setIsServiceSearching(false);
        })
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceSearchValue]);

  useEffect(() => {
    if (!isOpened) {
      setClientSearchValue("");
      setServiceSearchValue("");
      setAutoEndDate(undefined);
      handleUpdate();
      form.reset();
      setTimeout(() => {
        setIsLoading(true);
      }, 500)
    } else {
      handleUpdate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, isOpened])

  const watch = form.watch();

  const findPaymentIndex = (type: string) => {
    return form.getValues('details.payments')
      .findIndex(payment => payment.type === type && payment.status !== "refunded");
  }

  const feeIndex = findPaymentIndex("fee");
  const serviceIndex = findPaymentIndex("service");

  return (
    <Card ref={ref} className={cn(
      viewMode === "month" ? "w-full" : "w-[10rem]",
      "!items-start dark:hover:bg-neutral-700 hover:bg-[#F8F9FA] bg-white dark:bg-neutral-800 group transition-colors duration-150")} onDoubleClick={() => setIsOpened(true)}>
      <CardHeader className="flex flex-row items-center justify-between p-1">
        <Badge variant={"outline"} className="border-none ml-1 hover:cursor-grab group-hover:dark:bg-neutral-900 group-hover:bg-neutral-200 group-hover:border-neutral-300 dark:border-neutral-700 group-hover:dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 transition-colors duration-150 truncate px-2 text-xs w-full whitespace-nowrap inline-block">
          {appointment.details.service}
        </Badge>
        <Dialog open={isOpened} onOpenChange={setIsOpened}>
          <DialogTrigger className="cursor-pointer !m-0 min-w-4" asChild>
            <div className="text-xs">
              <EllipsisVertical className="h-4 w-4" />
            </div>
          </DialogTrigger>
          <DialogContent
            aria-describedby={undefined}
            className="max-w-[90vw] md:max-w-[36rem] max-h-[90vh] rounded-md overflow-hidden !p-0"
            onInteractOutside={(e) => {
              e.preventDefault();
              if (!openClient && !openService) {
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
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-col mt-2.5">
                        <FormLabel className="text-left">Status</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                field.onChange("pending")
                              }}
                              variant={field.value === "pending" ? "default" : "outline"}
                              className={cn(
                                "w-32 hover:bg-neutral-500 dark:hover:bg-neutral-500 hover:text-white",
                                field.value === "pending" && "bg-neutral-500 dark:bg-neutral-500 text-white hover:bg-neutral-500 dark:hover:bg-neutral-500"
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
                                "w-32 hover:bg-green-500 dark:hover:bg-green-500 hover:text-white",
                                field.value === "confirmed" && "bg-green-500 dark:bg-green-500 text-white hover:bg-green-500 dark:hover:bg-green-500"
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
                                "w-32 hover:bg-red-500 dark:hover:bg-red-500 hover:text-white",
                                field.value === "canceled" && "bg-red-500 dark:bg-red-500 text-white hover:bg-red-500 dark:hover:bg-red-500"
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
                                aria-expanded={openClient}
                                className={cn(!field.value && "text-muted-foreground", "w-full justify-between dark:bg-neutral-900")}
                              >
                                <div className="flex gap-4 items-center">
                                  <IconUser />
                                  {field.value ?? appointment.title}
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
                                  className={cn(!field.value && "text-muted-foreground", "w-full justify-between dark:bg-neutral-900")}
                                >
                                  <div className="flex gap-4 items-center">
                                    <IconBriefcase />
                                    {field.value ?? appointment.details.service}
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
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-4 w-4",
                                              (currentService?.id ? currentService.id === service.id : String(appointment.details.serviceId) == service.id) ? "opacity-100" : "opacity-0"
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
                  <FormField
                    control={form.control}
                    name="start"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-left">Início</FormLabel>
                        <FormControl>
                          <TimePicker
                            onChange={(date) => {
                              field.onChange(date);
                              if (date) {
                                const newDate = new Date(date);
                                newDate.setMinutes(newDate.getMinutes() + (appointment.details.durationMinutes ?? 0));
                                setAutoEndDate(newDate);
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
                            onChange={(date) => {
                              field.onChange(date);
                            }}
                            value={autoEndDate ?? appointment.end}
                            disabled={!appointment.end}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                              />
                            </FormControl>
                            <FormMessage />
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
                                  disabled={["received", "confirmed"].includes(watch.details.payments[feeIndex].status)}
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
                                  {appointment.details.payments[feeIndex]?.billingType !== "cash" && appointment.details.payments[feeIndex]?.status !== "pending" && field.value !== "pending"
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
                                                Esta ação estornará o pagamento selecionado e não poderá ser desfeita.
                                              </Typography>
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel
                                              onClick={(e) => {
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
                                        disabled={watch.details.payments[feeIndex].sendPaymentLink}
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
                    <FormMessage className="mt-2.5">
                      {form?.formState?.errors?.details?.payments?.[feeIndex]?.sendPaymentLink?.message || ""}
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
                              />
                            </FormControl>
                            <FormMessage />
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
                                  disabled={["received", "confirmed"].includes(watch.details.payments[serviceIndex].status)}
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
                                  {appointment.details.payments[serviceIndex]?.billingType !== "cash" && appointment.details.payments[serviceIndex]?.status !== "pending" && field.value !== "pending"
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
                                                Esta ação estornará o pagamento selecionado e não poderá ser desfeita.
                                              </Typography>
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel
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
                                            form.clearErrors([`details.payments.${feeIndex}.status`, `details.payments.${feeIndex}.sendPaymentLink`])
                                          }
                                        }}
                                        disabled={watch.details.payments[feeIndex].sendPaymentLink}
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
                    <FormMessage className="mt-2.5">
                      {form?.formState?.errors?.details?.payments?.[feeIndex]?.sendPaymentLink?.message || ""}
                    </FormMessage>
                  </div>

                </form>
                <DialogFooter className="flex !flex-row w-full justify-end gap-2 px-[1.5rem] mb-6">
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
                    <AlertDialogContent className="w-[90vw] md:w-full rounded-md">
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
                    onClick={() => console.log(form.formState.errors)}
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
        className={cn("pb-1.5 !px-0", {
          "cursor-grabbing bg-muted opacity-50": isDragging,
        })}
      >
        <div className="flex flex-col justify-center items-center w-full pl-1.5">
          <div className="flex gap-1.5 truncate text-xs mr-2 mt-1.5 mb-1.5">
            <div className="flex gap-2">
              <div className="flex justify-center items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-default">
                      {appointment.details.online
                        ? <IconVideo className={cn(
                          "w-4 h-4",
                          appointment.status === "confirmed" && "text-green-600",
                          appointment.status === "canceled" && "text-red-600"
                        )} />
                        : <IconMapPin className={cn(
                          "w-4 h-4",
                          appointment.status === "confirmed" && "text-green-600",
                          appointment.status === "canceled" && "text-red-600"
                        )} />
                      }
                    </TooltipTrigger>
                    <TooltipContent>

                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">{
                          <>
                            <Typography variant="b" className="text-xs">Modalidade:</Typography>
                            <Typography variant="p" className="text-xs">
                              {
                                appointment.details.online
                                  ? "Online"
                                  : "Presencial"
                              }
                            </Typography>
                          </>
                        }
                        </div>
                        <div className="flex gap-1">{
                          <>
                            <Typography variant="b" className="text-xs">Status:</Typography>
                            <Typography variant="p" className="text-xs">
                              {
                                appointment.status === "confirmed"
                                  ? "Confirmado"
                                  : appointment.status === "canceled"
                                    ? "Cancelado"
                                    : "Pendente"
                              }
                            </Typography>
                          </>
                        }
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex justify-center items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-default">
                      <IconCalendarDollar
                        className={cn(
                          "w-4 h-4",
                          ["received", "confirmed"].includes(appointment.details.payments[feeIndex]?.status)
                            ? "text-green-600"
                            : new Date(appointment.details.payments[feeIndex]?.dueDate).getTime() + 24 * 60 * 60 * 1000 >= new Date().getTime()
                              ? ""
                              : "text-red-600"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">{
                          <>
                            <Typography variant="b" className="text-xs">Descrição:</Typography>
                            <Typography variant="p" className="text-xs">Taxa de reserva</Typography>
                          </>
                        }
                        </div>
                        <div className="flex gap-1">{
                          <>
                            <Typography variant="b" className="text-xs">Status:</Typography>
                            <Typography variant="p" className="text-xs">
                              {
                                ["received", "confirmed"].includes(appointment.details.payments[feeIndex]?.status)
                                  ? "Pago"
                                  : new Date(appointment.details.payments[feeIndex]?.dueDate).getTime() + 24 * 60 * 60 * 1000 >= new Date().getTime()
                                    ? "Pendente"
                                    : "Vencido"
                              }
                            </Typography>
                          </>
                        }
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

              </div>
              <div className="flex justify-center items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="cursor-default">
                      <IconCurrencyDollar
                        className={cn(
                          "w-4 h-4",
                          ["received", "confirmed"].includes(appointment.details.payments[serviceIndex]?.status)
                            ? "text-green-600"
                            : new Date(appointment.details.payments[serviceIndex]?.dueDate).getTime() + 24 * 60 * 60 * 1000 >= new Date().getTime()
                              ? ""
                              : "text-red-600"
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col gap-1">
                        <div className="flex gap-1">{
                          <>
                            <Typography variant="b" className="text-xs">Descrição:</Typography>
                            <Typography variant="p" className="text-xs">Valor restante</Typography>
                          </>
                        }
                        </div>
                        <div className="flex gap-1">{
                          <>
                            <Typography variant="b" className="text-xs">Status:</Typography>
                            <Typography variant="p" className="text-xs">
                              {
                                ["received", "confirmed"].includes(appointment.details.payments[serviceIndex]?.status)
                                ? "Pago"
                                : new Date(appointment.details.payments[serviceIndex]?.dueDate).getTime() + 24 * 60 * 60 * 1000 >= new Date().getTime()
                                  ? "Pendente"
                                  : "Vencido"
                              }
                            </Typography>
                          </>
                        }
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 text-xs mr-2">
            <span className="whitespace-nowrap max-w-28 overflow-hidden truncate font-medium">{appointment.title}</span>
            <div className="flex gap-2">
              {viewMode === "month" && <span>{appointment.start.toLocaleDateString("pt-BR")}</span>}
              <span className="whitespace-nowrap font-medium">
                {format(new Date(appointment.start), "kk:mm")} -{" "}
                {format(new Date(appointment.end), "kk:mm")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default Appointment;
