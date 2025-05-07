import { useEffect, useMemo, useState, useTransition } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { TextArea } from "@/components/ui/text-area"
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
import { DialogContent } from "../ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { blockedTimesSchema } from "@/models/BlockTimeSlots";
import { cn } from "@/lib/utils";
import { TimePicker } from "../ui/time-picker";
import { AddBlockedTimeSlot, GetBlockedTimeSlots } from "@/services/block-time-slots";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Typography } from "@/components/ui/typography";
import { Checkbox } from "@/components/ui/checkbox";
import { IconChevronLeft, IconPlus, IconTrash } from "@tabler/icons-react";

interface BlockTimeSlotsProps {
  type?: "period" | "dayOfWeek"
  start?: Date
  end?: Date
  is_recurring: boolean
  day_of_week?: number
  description?: string
}




export const BlockTimeSlotsDialog = () => {
  const [isOpened, setIsOpened] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isDayOfWeekOpen, setIsDayOfWeekOpen] = useState(false);
  const [type, setType] = useState("period");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [exceptions, setExceptions] = useState<BlockTimeSlotsProps[]>([])
  const [isPending, startOnSubmitTransition] = useTransition();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Row<BlockTimeSlotsProps>[]>([]);

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

  const units: { label: "Período" | "Dia da semana"; value: "period" | "dayOfWeek" }[] = [
    { label: "Período", value: "period" },
    { label: "Dia da semana", value: "dayOfWeek" }
  ];

  const daysOfWeek: { label: string; value: number }[] = [
    { label: "Domingo", value: 0 },
    { label: "Segunda-feira", value: 1 },
    { label: "Terça-feira", value: 2 },
    { label: "Quarta-feira", value: 3 },
    { label: "Quinta-feira", value: 4 },
    { label: "Sexta-feira", value: 5 },
    { label: "Sábado", value: 6 }
  ];


  const columns = useMemo<ColumnDef<BlockTimeSlotsProps>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    {
      accessorKey: "start",
      header: "Início",
      cell: ({ row }) => {
        const { is_recurring, day_of_week, start } = row.original;
        if (day_of_week === undefined || start === undefined) return;
        return (
          <Typography variant="span" className="min-w-48 whitespace-nowrap">
            {is_recurring
              ? `${daysOfWeek[day_of_week].label} - ${format(new Date(start), "kk:mm")}`
              : new Date(start).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Sao_Paulo"
              }).replace(",", " -")}
          </Typography>
        );
      },
    },
    {
      accessorKey: "end",
      header: "Fim",
      cell: ({ row }) => {
        const { is_recurring, day_of_week, end } = row.original;
        if (day_of_week === undefined || end === undefined) return;
        return (
          <Typography variant="span" className="min-w-48 whitespace-nowrap">
            {is_recurring
              ? `${daysOfWeek[day_of_week].label} - ${format(new Date(end), "kk:mm")}`
              : new Date(end).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "America/Sao_Paulo"
              }).replace(",", " -")}
          </Typography>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => (
        <Typography variant="span" className="min-w-48">
          {row.getValue("description")}
        </Typography>
      ),
    },
  ], []);


  useEffect(() => {
    GetBlockedTimeSlots({}).then(data => {
      setExceptions(data);
    })
  }, [isFormVisible])

  const onSubmit = async (values: z.infer<typeof blockedTimesSchema>) => {
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
    setTimeout(() => {
      setIsFormVisible(false);
    }, 1000);
  }

  useEffect(() => {
    if (!isOpened) {
      setTimeout(() => {
        form.reset();
        setType("period");
        setIsFormVisible(false);
      }, 200)
    }
  }, [form, isOpened])

  return (
    <Dialog open={isOpened} onOpenChange={setIsOpened} >
      <DialogTrigger asChild>
        <Button variant="outline">Exceções</Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[90vw] md:max-w-[36rem] max-h-[90vh] rounded-md overflow-hidden !p-0"
        aria-describedby={undefined}
        onInteractOutside={(e) => {
          e.preventDefault();
          if (!isTypeOpen && !isDayOfWeekOpen && !isCalendarOpen) {
            setIsOpened(false);
          }
        }}
      >
        <DialogHeader className="flex w-full mb-2 px-[1.5rem] pt-[1.5rem]">
          <div className="flex gap-4 items-center">
            {isFormVisible &&
              <Button
                variant="ghost"
                className="!m-0 !p-0 max-w-3 max-h-3 hover:!bg-transparent group"
                onClick={() => setIsFormVisible(false)}
              >
                <IconChevronLeft className="-translate-y-[1px] !w-6 !h-6 text-neutral-400 group-hover:text-neutral-200" />
              </Button>
            }
            <DialogTitle className="self-center">Exceções</DialogTitle>
          </div>
        </DialogHeader>
        <div className="flex md:flex-row flex-col gap-2 max-w-[90vw]">
          <div className="flex flex-col gap-2 w-full px-6 pb-6 h-screen">
            {!isFormVisible &&
              <div className="flex justify-between w-full">
                <Typography variant="span" className="whitespace-nowrap">Minhas exceções</Typography>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsFormVisible(true)}>
                    <IconPlus />
                    Adicionar
                  </Button>
                  <Button
                    variant="outline"
                    className="!bg-red-500"
                    disabled={!selectedRows.length}
                    onClick={() => setIsFormVisible(true)}
                  >
                    <IconTrash />
                    Remover
                  </Button>
                </div>
              </div>
            }
            {!isFormVisible &&
              <DataTable
                columns={columns}
                data={exceptions || []}
                onRowSelection={(data) => setSelectedRows(data)}
                className="bg-background max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-140px)]"
              />
            }
            {isFormVisible && <Form {...form}>
              <div className="w-full">
                <form id="blocked-time-slots" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-auto pb-[1.5rem]">
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
                            placeholder={type === "period" ? "Selecione uma data e um horário" : "Selecione um horário"}
                            mode={type === "period" ? "datetime" : "time"}
                            value={watch.start}
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
                    control={form.control}
                    name="end"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-left">Fim</FormLabel>
                        <FormControl>
                          <TimePicker
                            placeholder={type === "period" ? "Selecione uma data e um horário" : "Selecione um horário"}
                            mode={type === "period" ? "datetime" : "time"}
                            value={watch.end}
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
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-left">Descrição</FormLabel>
                        <FormControl>
                          <TextArea
                            className="!min-h-14"
                            placeholder=""
                            onChange={(e) => field.onChange(e.target.value)}
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
              </div>
            </Form>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}