"use client";

import React, { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { format } from "date-fns";
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
  Appointment as AppointmentType,
  createAppointmentSchema,
} from "@/models/Appointment";
import { usePlannerData } from "@/contexts/planner/PlannerDataContext";
import { Button } from "../ui/button";
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
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { getClients } from "@/services/clients";
import { Loading } from "../ui/loading/loading";
import { getServices } from "@/services/services";
import { IconBriefcase, IconUser, IconVideo, IconVideoOff, IconMapPin, IconMapPinOff, IconCalendarPlus } from "@tabler/icons-react";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { useSettings } from "@/hooks/use-settings";
import { Typography } from "../ui/typography";


type ServiceType = {
  id: string,
  name: string,
  price: number,
  duration_minutes: number,
  allow_online: boolean,
  allow_in_person: boolean
}

const AddAppointmentDialog: React.FC = () => {
  const { addAppointment } = usePlannerData();
  const [isOpened, setIsOpened] = useState(false);
  const [isPending, startAddAppointmentTransition] = useTransition();
  const { settings } = useSettings();
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
  const [durationMinutes, setDurationMinutes] = React.useState<number | undefined>(undefined);

  const form = useForm<AppointmentType>({
    resolver: zodResolver(createAppointmentSchema),
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      start: undefined,
      end: undefined,
      resourceId: "a47aaada-005d-4db0-8779-7fddb32d291e",
      status: "pending",
      details: {
        service: "",
        durationMinutes: undefined,
        online: false,
        payments: [
          {
            type: "fee",
            value: undefined,
            status: "pending",
            sendPaymentLink: false,
            dueDate: undefined
          },
          {
            type: "service",
            value: undefined,
            status: "pending",
            sendPaymentLink: false,
            dueDate: undefined
          },
        ],
      }
    },
  });
  function onSubmit(values: z.infer<typeof createAppointmentSchema>) {
    const newAppointment: AppointmentType = {
      details: {
        service: values.details.service,
        serviceId: values.details.serviceId,
        durationMinutes: values.details.durationMinutes,
        online: values.details.online,
        payments: values?.details?.payments,
      },
      order: 0,
      id: "",
      title: values.title,
      clientId: values.clientId,
      start: values.start,
      end: values.end,
      resourceId: values.resourceId,
      status: values.status
    };

    startAddAppointmentTransition(() => {
      toast.promise(
        () =>
          new Promise((resolve) => {
            resolve(addAppointment(newAppointment));
          }).then(() => {
            setTimeout(() => {
              form.reset();
              setIsOpened(false);
            }, 500);
          }),
        {
          loading: "Adicionando novo compromisso...",
          success: "Compromisso adicionado com sucesso!",
          error: "Ocorreu um erro ao adicionar o compromisso. Tente novamente!",
        },
      );   
    });
  }

  const watch = form.watch();

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
          setServices(data.services);
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
      setDurationMinutes(undefined);
      setCurrentService(undefined);
      form.reset()
    }
  }, [form, isOpened])

  useEffect(() => {
    if (currentService) {
      form.setValue("details.online", !currentService?.allow_in_person ? true : false)
    }
  }, [form, currentService])

  const findPaymentIndex = (type: string) => {
    return form.getValues('details.payments').findIndex(payment => payment.type === type);
  }

  const feeIndex = findPaymentIndex("fee");
  const serviceIndex = findPaymentIndex("service");

  return (
    <Dialog open={isOpened} onOpenChange={setIsOpened}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-[#2B2D42] hover:bg-[#2B2D42]">
          <IconCalendarPlus className="h-4 w-4 text-white" />
          <Typography variant="span" className="md:block hidden !text-white">Novo compromisso</Typography>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[90vw] md:max-w-[36rem] max-h-[90vh] rounded-md overflow-hidden !p-0"
        aria-describedby={undefined}
        onInteractOutside={(e) => {
          e.preventDefault();
          if (!openClient && !openService && !isCalendarOpen) {
            setIsOpened(false);
          }
        }}
      >
        <DialogHeader className="mb-2 px-[1.5rem] pt-[1.5rem]">
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form id="add-appointment" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-h-[70vh] overflow-auto px-[1.5rem] pb-[1.5rem]">
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
                          "flex-1 hover:bg-neutral-500 dark:hover:bg-neutral-500 hover:text-white",
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
                          "flex-1 hover:bg-green-500 dark:hover:bg-green-500 hover:text-white",
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
                          "flex-1 hover:bg-red-500 dark:hover:bg-red-500 hover:text-white",
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
                          <div className="flex items-center gap-4">
                            <IconUser />
                            {field.value
                              ? clients.find((client) => client.name === field.value)?.name
                              : "Procurar um cliente..."}
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
                                  onSelect={(currentValue) => {
                                    field.onChange(currentValue);
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
                            className={cn(!field.value && "text-muted-foreground", "w-full justify-between dark:bg-neutral-900")}
                          >
                            <div className="flex items-center gap-4">
                              <IconBriefcase />
                              {currentService
                                ? currentService.name
                                : "Procurar um serviço..."}
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
                                    onSelect={(currentValue) => {
                                      field.onChange(currentValue.replace(service.id, ""));
                                      setDurationMinutes(service?.duration_minutes);
                                      setCurrentService(service);
                                      setOpenService(false);
                                      setServiceSearchValue("");
                                      form.setValue("details.durationMinutes", service.duration_minutes);
                                      form.setValue("details.serviceId", Number(service.id));
                                      form.setValue(`details.payments.${feeIndex}.value`,
                                        settings
                                          ? Number(settings.scheduling[settings.scheduling.findIndex(item => item.type === "tax")].value)
                                          : 0);
                                      form.setValue(`details.payments.${serviceIndex}.value`, service.price - (watch.details.payments[feeIndex].value || 0));
                                    }}
                                    className="cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        currentService?.id === service.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    <div className="w-full whitespace-nowrap">
                                      {service?.name}
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
                                        {service?.duration_minutes} min
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
                            field.onChange(currentService && currentService?.allow_online && !currentService.allow_in_person ? true : checked);
                          }}
                          disabled={!currentService?.allow_online}
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
                      placeholder="Selecione uma data e um horário"
                      onChange={(date) => {
                        field.onChange(date);
                        setIsCalendarOpen(false);
                        if (date) {
                          const newDate = new Date(date);
                          newDate.setMinutes(newDate.getMinutes() + (durationMinutes || 0));
                          setAutoEndDate(newDate);

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
                      disabled={!durationMinutes}
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
                      placeholder="Selecione uma data e um horário"
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
                      value={autoEndDate}
                      disabled={!durationMinutes}
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
                          disabled={!currentService}
                        />
                      </FormControl>
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
                          placeholder="Selecione uma data"
                          value={field.value}
                          mode="date"
                          onChange={(date) => {
                            field.onChange(date);
                            setIsCalendarOpen(false);
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
                          disabled={!watch.start}
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
                            }}
                            disabled={watch.details.payments[feeIndex].status === "received" || !currentService}
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
                            <Checkbox
                              checked={field.value === "received"}
                              onCheckedChange={(checked: boolean) => {
                                field.onChange(checked ? "received" : "pending");
                              }}
                              disabled={watch.details.payments[feeIndex].sendPaymentLink || !currentService}
                            />
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
                          disabled={!currentService}
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
                          disabled={!watch.start}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex w-full items-center">
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
                              if (checked) {
                                form.clearErrors([`details.payments.${serviceIndex}.status`, `details.payments.${serviceIndex}.sendPaymentLink`])
                              }
                            }}
                            disabled={watch.details.payments[serviceIndex].status === "received" || !currentService}
                          />
                        </FormControl>
                        <FormLabel className="text-left !mt-[1px] w-full">Enviar link de pagamento</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`details.payments.${serviceIndex}.status`}
                  render={({ field }) => (
                    <FormItem className="flex gap-2 items-center ml-auto mt-2.5">
                      <div className="flex gap-2 items-center !mr-auto">
                        <FormControl>
                          <Checkbox
                            checked={field.value === "received"}
                            onCheckedChange={(checked: boolean) => {
                              field.onChange(checked ? "received" : "pending");
                              if (checked) {
                                form.clearErrors([`details.payments.${serviceIndex}.status`, `details.payments.${serviceIndex}.sendPaymentLink`])
                              }
                            }}
                            disabled={watch.details.payments[serviceIndex].sendPaymentLink || !currentService}
                          />
                        </FormControl>
                        <FormLabel className="text-left !mt-[1px]">Recebido</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormMessage className="!mt-2 w-full">
              {form?.formState?.errors?.details?.payments?.[serviceIndex]?.dueDate?.message || ""}
            </FormMessage>
          </form>
          <DialogFooter className="px-[2.3rem] mb-6">
            <Button
              form="add-appointment"
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Salvar
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAppointmentDialog;
