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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Tabs, TabContainer, TabPanel, Tab } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { forwardRef, useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdditionalSettingsProps, AdditionalSettingsSchema } from "@/models/AdditionalSettings";
import { z } from "zod";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { Input } from "../ui/input";
import { SettingsState } from "@/contexts/settings/SettingsContext.type";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Typography } from "../ui/typography";
import { Separator } from "../ui/separator";

export const AdditionalSettingsDialog = forwardRef<HTMLDivElement, { onClose?: () => void }>(({ onClose, ...props }, ref) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isPending, startOnSubmitTransition] = useTransition();
  const { settings, updateSettings } = useSettings();

  const [isRescheduleDeadlineUnitOpen, setIsRescheduleDeadlineUnitOpen] = useState(false);

  const findIndex = ({ type, array = [] }: { type: string, array: { type: string }[] | undefined }): number => {
    return array.findIndex(item => item.type === type);
  };

  const form = useForm<AdditionalSettingsProps>({
    resolver: zodResolver(AdditionalSettingsSchema),
    defaultValues: {
      scheduling: [
        {
          type: "tax",
          value: settings?.scheduling[findIndex({ type: "tax", array: settings.scheduling })]?.value ?? 0
        },
        {
          type: "reschedule_deadline_value",
          value: settings?.scheduling[findIndex({ type: "reschedule_deadline_value", array: settings.scheduling })]?.value ?? 0
        },
        {
          type: "reschedule_deadline_unit",
          value: settings?.scheduling[findIndex({ type: "reschedule_deadline_unit", array: settings.scheduling })]?.value ?? "hours"
        },
        {
          type: "payment_deadline_value",
          value: settings?.scheduling[findIndex({ type: "payment_deadline_value", array: settings.scheduling })]?.value ?? 0
        },
        {
          type: "tax_deadline_value",
          value: settings?.scheduling[findIndex({ type: "tax_deadline_value", array: settings.scheduling })]?.value ?? 0
        }
      ]
    },
  });

  useEffect(() => {
    setTimeout(() => (
      form.reset({
        scheduling: [
          {
            type: "tax",
            value: settings?.scheduling[findIndex({ type: "tax", array: settings.scheduling })]?.value ?? 0
          },
          {
            type: "reschedule_deadline_value",
            value: settings?.scheduling[findIndex({ type: "reschedule_deadline_value", array: settings.scheduling })]?.value ?? 0
          },
          {
            type: "reschedule_deadline_unit",
            value: settings?.scheduling[findIndex({ type: "reschedule_deadline_unit", array: settings.scheduling })]?.value ?? "hours"
          },
          {
            type: "payment_deadline_value",
            value: settings?.scheduling[findIndex({ type: "payment_deadline_value", array: settings.scheduling })]?.value ?? 0
          },
          {
            type: "tax_deadline_value",
            value: settings?.scheduling[findIndex({ type: "tax_deadline_value", array: settings.scheduling })]?.value ?? 0
          }
        ]
      })
    ), 100)

  }, [form, settings, isOpened])


  function onSubmit(values: z.infer<typeof AdditionalSettingsSchema>) {
    const newSettings: SettingsState = {
      scheduling: [
        {
          type: "tax",
          value: values.scheduling[findIndex({ type: "tax", array: settings?.scheduling })]?.value ?? 0
        },
        {
          type: "reschedule_deadline_value",
          value: values.scheduling[findIndex({ type: "reschedule_deadline_value", array: settings?.scheduling })]?.value ?? 0
        },
        {
          type: "reschedule_deadline_unit",
          value: values.scheduling[findIndex({ type: "reschedule_deadline_unit", array: settings?.scheduling })]?.value ?? "hours"
        },
        {
          type: "payment_deadline_value",
          value: values.scheduling[findIndex({ type: "payment_deadline_value", array: settings?.scheduling })]?.value ?? 0
        },
        {
          type: "tax_deadline_value",
          value: values.scheduling[findIndex({ type: "tax_deadline_value", array: settings?.scheduling })]?.value ?? 0
        }
      ]
    };


    startOnSubmitTransition(() => {
      toast.promise(
        () =>
          new Promise((resolve) => {
            resolve(updateSettings({ data: newSettings }));
          }),
        {
          loading: "Atualizando as configurações...",
          success: "As configurações foram atualizadas com sucesso.",
          error: "Falha ao atualizar as configurações!"
        },
      );

    });
    setTimeout(() => {
      setIsOpened(false);
    }, 1000);
  }

  const units: { label: "Horas" | "Dias"; value: "hours" | "days" }[] = [
    { label: "Horas", value: "hours" },
    { label: "Dias", value: "days" }
  ];

  return (
    <Dialog open={isOpened} onOpenChange={setIsOpened}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">Configurações adicionais</Button>
      </DialogTrigger>
      {settings &&
        <DialogContent
          className="max-w-[90vw] md:max-w-[36rem] max-h-[90vh] rounded-md overflow-hidden !p-0"
          aria-describedby={undefined}
        >
          <DialogHeader className="mb-2 px-[1.5rem] pt-[1.5rem]">
            <DialogTitle>Configurações adicionais</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form id="update-settings" onSubmit={form.handleSubmit(onSubmit)} className="relative space-y-8 max-h-[70vh] h-[70vh] overflow-auto px-[1.5rem] pb-[1.5rem]">
              <TabContainer className="w-full">
                <Tabs className="bg-background rounded-none" activeClassName="bg-neutral-800">
                  <Tab value="scheduling"><Typography variant="span">Agenda</Typography></Tab>
                  <Tab value="financial"><Typography variant="span">Financeiro</Typography></Tab>
                </Tabs>
                <Separator orientation="horizontal" className="my-6" />
                <TabPanel value="scheduling" className="flex flex-col gap-6">
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name={`scheduling.${findIndex({ type: "reschedule_deadline_value", array: settings?.scheduling })}.value`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                          <FormLabel className="text-left">Prazo para reagendamento</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Valor"
                              spellCheck={false}
                              value={Number(field.value ?? 0)}
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
                    <FormField
                      control={form.control}
                      name={`scheduling.${findIndex({ type: "reschedule_deadline_unit", array: settings?.scheduling })}.value`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                          <FormLabel>Unidade</FormLabel>
                          <FormControl>
                            <Popover open={isRescheduleDeadlineUnitOpen} onOpenChange={setIsRescheduleDeadlineUnitOpen} modal>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={isRescheduleDeadlineUnitOpen}
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
                                            setTimeout(() => (
                                              setIsRescheduleDeadlineUnitOpen(false)
                                            ), 100)
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
                  </div>
                </TabPanel>
                <TabPanel value="financial" className="flex flex-col gap-6">
                  <FormField
                    control={form.control}
                    name={`scheduling.${findIndex({ type: "tax", array: settings?.scheduling })}.value`}
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
                  <FormField
                    control={form.control}
                    name={`scheduling.${findIndex({ type: "tax_deadline_value", array: settings?.scheduling })}.value`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full">
                        <FormLabel className="text-left">Prazo para pagamento da taxa de reserva (em dias antes do compromisso)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Valor"
                            spellCheck={false}
                            value={Number(field.value ?? 0)}
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
                  <FormField
                    control={form.control}
                    name={`scheduling.${findIndex({ type: "payment_deadline_value", array: settings?.scheduling })}.value`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full">
                        <FormLabel className="text-left">Prazo para pagamento do serviço (em dias após o compromisso)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Valor"
                            spellCheck={false}
                            value={Number(field.value ?? 0)}
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
                </TabPanel>
              </TabContainer>
            </form>

            <DialogFooter className="px-[1.5rem] mb-6">
              <Button
                form="update-settings"
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => console.log(form.watch())}
              >
                Salvar
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      }
    </Dialog >
  )
})

AdditionalSettingsDialog.displayName = "AdditionalSettingsDialog"