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

interface BlockTimeSlotsProps {
  type?: "period" | "dayOfWeek"
  start: Date | null
  end: Date | null
  is_recurring: boolean
  day_of_week?: number | null
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

  const form = useForm<BlockTimeSlotsProps>({
    resolver: zodResolver(blockedTimesSchema),
    defaultValues: {
      type: "period",
      start: null,
      end: null,
      is_recurring: false,
      day_of_week: null,
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
      accessorKey: "is_recurring",
      header: "Tipo",
      cell: ({ row }) => (
        <Typography variant="span" className="md:whitespace-nowrap">
          {row.getValue("is_recurring") ? "Dia da semana" : "Período"}
        </Typography>
      ),
    },
    {
      accessorKey: "start",
      header: "Início",
      cell: ({ row }) => (
        <Typography variant="span" className="min-w-48">
          {row.getValue("is_recurring") 
          ? daysOfWeek[parseInt(row.getValue("day_of_week"))].label + " - " + format(new Date(row.getValue("start")), "kk:mm") 
          : new Date(row.getValue("start")).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Sao_Paulo"
          }).replace(",", " -")}
        </Typography>
      ),
    },
    {
      accessorKey: "end",
      header: "Fim",
      cell: ({ row }) => (
        <Typography variant="span" className="min-w-48">
          {row.getValue("is_recurring") 
          ? daysOfWeek[parseInt(row.getValue("day_of_week"))].label + " - " + format(new Date(row.getValue("end")), "kk:mm") 
          : new Date(row.getValue("end")).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Sao_Paulo"
          }).replace(",", " -")}
        </Typography>
      ),
    },
    {
      accessorKey: "is_recurring",
      header: "",
      cell: ({ row }) => (
        <Typography variant="span" className="whitespace-nowrap !flex !justify-center">
          {row.getValue("is_recurring") ? "Sim" : "Não"}
        </Typography>
      ),
    },
    {
      accessorKey: "day_of_week",
      header: ({ table }) => null,
      cell: ({ row }) => (
        <Typography variant="span" className="whitespace-nowrap hidden">
          {daysOfWeek[parseInt(row.getValue("day_of_week"))].label}
        </Typography>
      ),
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => (
        <Typography variant="span" className="min-w-48">{row.getValue("description")}</Typography>
      ),
    },
  ], []);

  useEffect(() => {
    GetBlockedTimeSlots({}).then(data => {
      console.log(data)
      setExceptions(data);
    })
  }, [])

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
      setIsOpened(false);
    }, 1000);
  }

  useEffect(() => {
    if (!isOpened) {
      setTimeout(() => {
        form.reset();
        setType("period");
      }, 200)
    }
  }, [form, isOpened])

  return (
    <Dialog open={isOpened} onOpenChange={setIsOpened} >
      <DialogTrigger asChild>
        <Button variant="outline">Adicionar exceções</Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[90vw] max-h-[90vh] rounded-md overflow-hidden !p-0"
        aria-describedby={undefined}
        onInteractOutside={(e) => {
          e.preventDefault();
          if (!isTypeOpen && !isDayOfWeekOpen && !isCalendarOpen) {
            setIsOpened(false);
          }
        }}
      >
        <DialogHeader className="mb-2 px-[1.5rem] pt-[1.5rem]">
          <DialogTitle>Adicionar exceções</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 px-6 pb-6">
          <DataTable columns={columns} data={exceptions || []} className="bg-background max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-140px)]" />
          <Form {...form}>
            <form id="blocked-time-slots" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-h-[70vh] overflow-auto px-[1.5rem] pb-[1.5rem]">
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
                                      form.setValue("start", null);
                                      form.setValue("end", null);
                                      form.setValue("is_recurring", currentValue === "dayOfWeek");
                                      form.setValue("day_of_week", null)
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
            <DialogFooter className="px-[1.5rem] mb-6">
              <Button
                form="blocked-time-slots"
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Salvar
              </Button>
            </DialogFooter>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}