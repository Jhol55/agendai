import { useCallback, useMemo, useState } from "react"
import { Typography } from "../ui/typography"
import { CalendarList } from "./CalendarList"

import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
  TimelineLine,
} from "@/components/ui/timeline"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { WootButton } from "../ui/woot-button"
import { Path, useForm } from "react-hook-form";
import { AddCalendarProps, AddCalendarSchema } from "./models/AddCalendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { TextArea } from "../ui/text-area";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { IconChevronLeft } from "@tabler/icons-react";
import { TimePicker } from "../ui/time-picker";
import { Checkbox } from "../ui/checkbox";

const calendars = [
  {
    id: 1,
    name: 'Jhonathan Galhardo'
  }
]

export const Calendars = () => {
  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const timelines = [
    {
      title: "Criar",
      content: "Criar um novo calendário para um profissional"
    },
    {
      title: "Definir horários",
      content: "Defina os horários de funcionamento da semana"
    },
    {
      title: "Definir horários",
      content: "Defina os horários de funcionamento da semana"
    }
  ]

  const formHeaders = [
    {
      title: "Criar novo calendário",
      content: "Adicione um nome e uma descrição a seu novo calendário."
    },
    {
      title: "Criar novo calendário",
      content: "Defina os horários de início e fim de cada dia da semana. Após criar o calendário, você também poderá bloquear horários específicos."
    },
    {
      title: "Criar novo calendário",
      content: "Defina os horários de início e fim de cada dia da semana. Após criar o calendário, você também poderá bloquear horários específicos."
    }
  ]


  const inputs = [
    [
      { name: "calendar.name", component: Input, label: "Nome", placeholder: "Nome do calendário", className: "" },
      { name: "calendar.description", component: TextArea, label: "Descrição", placeholder: "Descrição do calendário", className: "min-h-20" }
    ],
    [
      { name: "operatingHours.sunday.start", component: TimePicker, label: "Domingo", placeholder: "Selecione um horário", className: "" },
      { name: "operatingHours.sunday.end", component: TimePicker, label: "", placeholder: "Selecione um horário", className: "" },
      { name: "operatingHours.sunday.closed", component: Checkbox, label: "Fechado", placeholder: "", className: "" },

      { name: "operatingHours.monday.start", component: TimePicker, label: "Segunda-feira", placeholder: "Selecione um horário", className: "" },
      { name: "operatingHours.monday.end", component: TimePicker, label: "", placeholder: "Selecione um horário", className: "" },
      { name: "operatingHours.monday.closed", component: Checkbox, label: "Fechado", placeholder: "", className: "" },

      { name: "operatingHours.tuesday.start", component: TimePicker, label: "Terça-feira", placeholder: "Selecione um horário", className: "" },
      { name: "operatingHours.tuesday.end", component: TimePicker, label: "", placeholder: "Selecione um horário", className: "" },
      { name: "operatingHours.tuesday.closed", component: Checkbox, label: "Fechado", placeholder: "", className: "" },

      { name: "operatingHours.wednesday.start", component: TimePicker, label: "Quarta-feira", placeholder: "Selecione um horário", className: "" },
      { name: "operatingHours.wednesday.end", component: TimePicker, label: "", placeholder: "Selecione um horário", className: "" },
      { name: "operatingHours.wednesday.closed", component: Checkbox, label: "Fechado", placeholder: "", className: "" },

      { name: "operatingHours.thursday.start", component: TimePicker, label: "Quinta-feira", placeholder: "Selecione um horário", className: "" },
      { name: "operatingHours.thursday.end", component: TimePicker, label: "", placeholder: "Selecione um horário", className: "" },
      { name: "operatingHours.thursday.closed", component: Checkbox, label: "Fechado", placeholder: "", className: "" },

      { name: "operatingHours.friday.start", component: TimePicker, label: "Sexta-feira", placeholder: "Selecione um horário", className: "" },
      { name: "operatingHours.friday.end", component: TimePicker, label: "", placeholder: "Selecione um horário", className: "" },
      { name: "operatingHours.friday.closed", component: Checkbox, label: "Fechado", placeholder: "", className: "" },

      { name: "operatingHours.saturday.start", component: TimePicker, label: "Sábado", placeholder: "Selecione um horário", className: "" },
      { name: "operatingHours.saturday.end", component: TimePicker, label: "", placeholder: "Selecione um horário", className: "" },
      { name: "operatingHours.saturday.closed", component: Checkbox, label: "Fechado", placeholder: "", className: "" },
    ],
    [
      { name: "calendar.name", component: Input, label: "Nome", placeholder: "Nome do calendário", className: "" },
      { name: "calendar.description", component: TextArea, label: "Descrição", placeholder: "Descrição do calendário", className: "min-h-20" }
    ],
  ]

  const defaultValues = useMemo(() => ({
    calendar: {
      name: "",
      description: ""
    },
    operatingHours: {
      sunday: { start: undefined, end: undefined, closed: false },
      monday: { start: undefined, end: undefined, closed: false },
      tuesday: { start: undefined, end: undefined, closed: false },
      wednesday: { start: undefined, end: undefined, closed: false },
      thursday: { start: undefined, end: undefined, closed: false },
      friday: { start: undefined, end: undefined, closed: false },
      saturday: { start: undefined, end: undefined, closed: false },
    }
  }), [])

  const form = useForm<AddCalendarProps>({
    resolver: zodResolver(AddCalendarSchema),
    defaultValues
  });

  const watch = form.watch();

  const onSubmit = useCallback(() => {
    return 1
  }, [])

  return (
    <main className={cn("flex sm:flex-row flex-col items-center justify-center w-full gap-8")}>
      <section className={cn("flex flex-col md:w-fit w-full", !showForm && "md:w-full h-full", showForm && "md:h-full md:!w-[20rem] w-full")}>
        <header className={cn("block md:pb-10 px-6 sm:px-0", showForm && "md:fixed px-0")}>
          <div className="flex items-center justify-between gap-2 w-full mx-auto">
            <div className="flex items-center gap-4 sm:px-0">
              {showForm &&
                <Button
                  variant="ghost"
                  className="hover:bg-transparent sm:!p-0 px-2"
                  onClick={() => setStep((prevStep) => {
                    if (prevStep === 0) {
                      form.reset();
                      setShowForm(false);                                      
                    }
                    return Math.max(prevStep - 1, 0)
                  })}
                >
                  <IconChevronLeft className="!h-8 !w-8" />
                </Button>
              }
              <Typography variant="h1" className="h-10">Calendários</Typography>
            </div>
            {!showForm &&
              <WootButton onClick={() => setShowForm(true)}>
                Adicionar calendário
              </WootButton>
            }
          </div>
        </header>
        {showForm &&
          <aside className={cn("block top-28", showForm && "md:fixed")}>
            <Timeline className="max-w-[20rem] w-full md:block hidden">
              {timelines.map((timeline, index) => (
                <TimelineItem key={index} status="done">
                  <TimelineHeading>{timeline.title}</TimelineHeading>
                  <TimelineDot
                    status={step > index ? "done" : step === index ? "current" : "default"}
                    className={cn(step > index && "bg-green-500 border-green-500")}
                  />
                  {index < timelines.length - 1 &&
                    <TimelineLine
                      done={step > index}
                      className={cn(step > index && "bg-green-500")}
                    />}
                  <TimelineContent>
                    <Typography variant="span" className="!text-neutral-600 dark:!text-neutral-400">
                      {timeline.content}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </aside>
        }
      </section>
      {showForm &&
        <section className={cn("flex flex-col gap-4 p-4 w-full h-full")}>
          <div className="dark:bg-neutral-800 shadow-md bg-neutral-100 py-6 rounded-lg h-fit sm:h-full">
            <header className="px-[1.5rem] pb-4">
              <Typography variant="h1">{formHeaders[step].title}</Typography>
              <Typography variant="span" className="!text-neutral-400">{formHeaders[step].content}</Typography>
            </header>
            <Form {...form}>
              <form id="add-calendar" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-[1.5rem] pb-[1.5rem] overflow-auto">
                {inputs[step].map((input, index) => {
                  const Component = input.component;
                  if (input.label === "" && input.component === TimePicker) {
                    const prev = inputs[step][index - 1];
                    const next = inputs[step][index + 1];
                    const PrevComponent = prev.component;
                    const NextComponent = next.component;
                    return (
                      <div key={input.name} className="relative flex gap-4 items-end">
                        <FormField
                          control={form.control}
                          name={prev.name as Path<AddCalendarProps>}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="text-left">{prev.label}</FormLabel>
                              <FormControl>
                                <PrevComponent
                                  className={cn("dark:focus:ring-skyblue dark:focus:ring-1 h-10 data-[state=closed]:!ring-0 data-[state=open]:ring-1 data-[state=open]:ring-skyblue transition-all duration-75 !text-neutral-400", field.value && "dark:!text-neutral-200 !text-neutral-700", prev.className)}
                                  placeholder={prev.placeholder}
                                  mode="time"
                                  value={field.value as ((string | number | readonly string[]) & (Date | null)) | undefined}
                                  autoComplete="off"
                                  onChange={(e) => field.onChange(e instanceof Date ? e : (e?.target as HTMLInputElement).value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={input.name as Path<AddCalendarProps>}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="text-left">{input.label}</FormLabel>
                              <FormControl>
                                <Component
                                  className={cn("dark:focus:ring-skyblue dark:focus:ring-1 h-10 data-[state=closed]:!ring-0 data-[state=open]:ring-1 data-[state=open]:ring-skyblue transition-all duration-75 !text-neutral-400", field.value && "dark:!text-neutral-200 !text-neutral-700", input.className)}
                                  placeholder={input.placeholder}
                                  mode="time"
                                  value={field.value as ((string | number | readonly string[]) & (Date | null)) | undefined}
                                  autoComplete="off"
                                  onChange={(e) => field.onChange(e instanceof Date ? e : (e?.target as HTMLInputElement).value)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="absolute top-0 right-0">
                          <FormField
                            control={form.control}
                            name={next.name as Path<AddCalendarProps>}
                            render={({ field }) => (
                              <FormItem className="flex w-full gap-2 items-center">
                                <FormControl>
                                  <NextComponent
                                    checked={field.value as boolean}
                                    onCheckedChange={(checked: boolean) => {
                                      field.onChange(checked);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-left !mt-[1px]">Fechado</FormLabel>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    );
                  }
                  if (input.label !== "" && inputs[step][index + 1]?.label === "") {
                    return null;
                  }
                  if (input.component === Checkbox) {
                    return null
                  }
                  return (
                    <FormField
                      key={input.name}
                      control={form.control}
                      name={input.name as Path<AddCalendarProps>}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-left">{input.label}</FormLabel>
                          <FormControl>
                            <Component
                              className={cn("dark:focus:ring-skyblue dark:focus:ring-1 h-10", field.value && "dark:!text-neutral-200 !text-neutral-700", input.className)}
                              placeholder={input.placeholder}
                              autoComplete="off"
                              value={field.value as ((string | number | readonly string[]) & (Date | null)) | undefined}
                              onChange={(e) => field.onChange(e instanceof Date ? e : (e?.target as HTMLInputElement).value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
              </form>
              <footer className="flex w-full items-start justify-between px-[1.5rem]">
                <WootButton
                  onClick={async () => {
                    const fieldNames = inputs[step].map((input) => input.name) as unknown as (keyof AddCalendarProps)[];
                    const isValid = await form.trigger(fieldNames);

                    if (!isValid) return;

                    setStep((prevStep) => Math.min(prevStep + 1, inputs.length - 1));
                  }}
                >
                  Avançar
                </WootButton>
              </footer>
            </Form>
          </div>
        </section>
      }
    </main>
    //  <CalendarList calendarList={calendars} />
  )
}