import { useCallback, useEffect, useMemo, useState } from "react";
import { Typography } from "../ui/typography";

import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
  TimelineLine,
} from "@/components/ui/timeline";
import { Form } from "@/components/ui/form";
import { WootButton } from "../ui/woot-button";
import { Path, useForm, FormProvider } from "react-hook-form";
import { AddCalendarProps, AddCalendarSchema } from "./models/AddCalendar";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "../ui/input";
import { TextArea } from "../ui/text-area";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { IconChevronLeft } from "@tabler/icons-react";

import { getUsers } from "@/services/users";
import { getTeams } from "@/services/teams";

import { FormSteps } from './FormSteps'; // Import the new FormSteps component
import { FormFieldConfig } from './types'; // Import strict field configuration types
import { Select } from "@/components/ui/select/select"; // Needed for formStepsConfig reference

// Placeholder for calendars, typically fetched from an API
const calendars = [
  {
    id: 1,
    name: "Jhonathan Galhardo",
  },
];

export const Calendars = () => {
  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [agentOrTeamType, setAgentOrTeamType] = useState<"agent" | "team">(
    "agent"
  );
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);

  // Effect to fetch initial user and team data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, teamsData] = await Promise.all([
          getUsers({}),
          getTeams({}),
        ]);
        setUsers(usersData);
        setTeams(teamsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        // In a real application, you might use a toast or alert to show the error
      }
    };
    fetchData();
  }, []);

  // Default values for the form, memoized for stability
  const defaultValues = useMemo(
    () => ({
      calendar: {
        name: "",
        description: "",
      },
      agentOrTeam: {
        id: "",
        type: "agent" as "agent" | "team", // Explicitly cast type
      },
      operatingHours: {
        sunday: { start: undefined, end: undefined, closed: false },
        monday: { start: undefined, end: undefined, closed: false },
        tuesday: { start: undefined, end: undefined, closed: false },
        wednesday: { start: undefined, end: undefined, closed: false },
        thursday: { start: undefined, end: undefined, closed: false },
        friday: { start: undefined, end: undefined, closed: false },
        saturday: { start: undefined, end: undefined, closed: false },
      },
    }),
    []
  );

  // Initialize react-hook-form
  const form = useForm<AddCalendarProps>({
    resolver: zodResolver(AddCalendarSchema),
    defaultValues,
  });

  // Memoized list of users formatted for the Select component
  const usersSelectList = useMemo(() => {
    return users.map((user) => ({
      label: user.name,
      value: String(user.id),
    }));
  }, [users]);

  // Memoized list of teams formatted for the Select component
  const teamsSelectList = useMemo(() => {
    return teams.map((team) => ({
      label: team.name,
      value: String(team.id),
    }));
  }, [teams]);

  // Configuration for the timeline steps
  const timelines = [
    { title: "Criar novo calendário", content: "Crie um novo calendário para um profissional." },
    { title: "Adicionar agentes", content: "Adicione um agente ou uma equipe para organizar e gerenciar agendamentos no calendário." },
    { title: "Definir horários", content: "Defina os horários de funcionamento semanais para o calendário." },
  ];

  // Headers and content for each form step
  const formHeaders = [
    { title: "Criar novo calendário", content: "Adicione um nome e descrição ao seu novo calendário." },
    { title: "Adicionar agentes", content: "Adicione um agente ou uma equipe para organizar e gerenciar agendamentos no calendário." },
    { title: "Definir horários", content: "Defina os horários de início e fim para cada dia da semana. Após criar o calendário, você também poderá bloquear horários específicos." },
  ];

  // Explicit typing for the form steps configuration array
  const formStepsConfig: FormFieldConfig[][] = useMemo(() => {
    return [
      // Step 0: Calendar details
      [
        { name: "calendar.name", component: Input, label: "Name", placeholder: "Nome do calendário", className: "", type: "text" },
        { name: "calendar.description", component: TextArea, label: "Description", placeholder: "Descrição do calendário", className: "min-h-20", type: "textarea" },
      ],
      // Step 1: Agent or Team selection
      [
        {
          name: "agentOrTeam.id", component: Select, label: "Name", placeholder: "Nome...", type: "select",
          src: agentOrTeamType === "agent" ? usersSelectList : teamsSelectList,
          className: "dark:focus:ring-skyblue dark:focus:ring-1 h-10 data-[state=closed]:!ring-0 data-[state=open]:ring-1 data-[state=open]:ring-skyblue transition-all duration-75",
          customHeader: (
            <div>
              <Button
                variant="ghost"
                type="button"
                className={cn(
                  agentOrTeamType === "agent" &&
                  "bg-neutral-200 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-700"
                )}
                onClick={() => {
                  setAgentOrTeamType("agent");
                  form.setValue("agentOrTeam.type", "agent");
                  form.setValue("agentOrTeam.id", "");
                }}
              >
                <Typography variant="span">Agentes</Typography>
              </Button>
              <Button
                variant="ghost"
                type="button"
                className={cn(
                  agentOrTeamType === "team" &&
                  "bg-neutral-200 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-700"
                )}
                onClick={() => {
                  setAgentOrTeamType("team");
                  form.setValue("agentOrTeam.type", "team");
                  form.setValue("agentOrTeam.id", "");
                }}
              >
                <Typography variant="span">Times</Typography>
              </Button>
            </div>
          )
        },
      ],
      // Step 2: Operating hours
      [
        { name: "operatingHours.sunday", label: "Domingo", type: "dayHours" },
        { name: "operatingHours.monday", label: "Segunda-feira", type: "dayHours" },
        { name: "operatingHours.tuesday", label: "Terça-feira", type: "dayHours" },
        { name: "operatingHours.wednesday", label: "Quarta-feira", type: "dayHours" },
        { name: "operatingHours.thursday", label: "Quinta-feira", type: "dayHours" },
        { name: "operatingHours.friday", label: "Sexta-feira", type: "dayHours" },
        { name: "operatingHours.saturday", label: "Sábado", type: "dayHours" },
      ],      
    ];
  }, [agentOrTeamType, form, teamsSelectList, usersSelectList]);

  // Callback for form submission
  const onSubmit = useCallback(
    (data: AddCalendarProps) => {
      console.log("Form submitted:", data);
      form.reset(); // Reset form after submission
      setStep(0); // Go back to the first step
      setShowForm(false); // Hide the form
    },
    [form]
  );

  // Callback to advance to the next step
  const handleNextStep = useCallback(async () => {
    // Get fields relevant to the current step for validation
    const currentStepFields = formStepsConfig[step].flatMap((input) => {
      if (input.type === "dayHours") {
        const dayName = (input.name as string).split(".")[1];
        return [
          `operatingHours.${dayName}.start`,
          `operatingHours.${dayName}.end`,
          `operatingHours.${dayName}.closed`,
        ];
      }
      return input.name;
    }) as Path<AddCalendarProps>[]; // Cast to Path<AddCalendarProps>[] for trigger

    // Trigger validation for current step fields
    const isValid = await form.trigger(currentStepFields);

    if (isValid) {
      setStep((prevStep) => Math.min(prevStep + 1, formStepsConfig.length - 1));
      form.clearErrors();
    }
  }, [step, form, formStepsConfig]);

  // Callback to go back to the previous step or close the form
  const handlePrevStep = useCallback(() => {
    setStep((prevStep) => {
      if (prevStep === 0) {
        form.reset(); // Reset form if going back from the first step
        setShowForm(false); // Hide the form
      }
      return Math.max(prevStep - 1, 0); // Go back one step, minimum 0
    });
  }, [form]);

  return (
    <main
      className={cn(
        "flex md:flex-row flex-col w-full md:gap-14 !bg-[rgb(253,253,253)] dark:!bg-dark-chatwoot-primary"
      )}
    >
      <section
        className={cn(
          "flex flex-col md:w-fit w-full",
          !showForm && "md:w-full h-full",
          showForm && "md:h-full md:!w-[30rem] w-full"
        )}
      >
        <header className={cn("md:pb-10 px-6 sm:px-0", showForm && "md:fixed px-0")}>
          <div className="flex items-center justify-between gap-2 w-full mx-auto">
            <div className="flex items-center gap-4 sm:px-0">
              {showForm && (
                <Button
                  variant="ghost"
                  className="hover:bg-transparent md:!p-0 px-2"
                  onClick={handlePrevStep}
                >
                  <IconChevronLeft className="!h-8 !w-8" />
                </Button>
              )}
              <Typography variant="h1" className="h-10">
                Calendários
              </Typography>
            </div>
            {!showForm && (
              <WootButton onClick={() => setShowForm(true)}>
                Adicionar Calendário
              </WootButton>
            )}
          </div>
        </header>
        {showForm && (
          <aside className={cn("top-16", showForm && "md:fixed")}>
            <Timeline className="max-w-[20rem] w-full md:block hidden">
              {timelines.map((timeline, index) => (
                <TimelineItem key={index} status="done">
                  <TimelineHeading>{timeline.title}</TimelineHeading>
                  <TimelineDot
                    status={
                      step > index
                        ? "done"
                        : step === index
                          ? "current"
                          : "default"
                    }
                    className={cn(
                      step > index && "bg-woot-500 border-woot-500",
                      step === index &&
                      "border-neutral-600 [&>svg]:!text-neutral-600"
                    )}
                  />
                  {index < timelines.length - 1 && (
                    <TimelineLine done={step > index} className={cn(step > index && "bg-woot-500")} />
                  )}
                  <TimelineContent>
                    <Typography variant="span" className="!text-neutral-600 dark:!text-neutral-400">
                      {timeline.content}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </aside>
        )}
      </section>
      {showForm && (
        <section className={cn("flex flex-col gap-4 p-4 w-full h-full")}>
          <div className="dark:bg-neutral-800 shadow-md bg-neutral-100 py-6 rounded-lg h-fit sm:h-full">
            <header className="px-[1.5rem] pb-4">
              <Typography variant="h1">{formHeaders[step].title}</Typography>
              <Typography variant="span" className="dark:!text-neutral-400 !text-neutral-600">
                {formHeaders[step].content}
              </Typography>
            </header>
            {/* FormProvider makes form context available to all nested components */}
            <FormProvider {...form}>
              <form
                id="add-calendar"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 px-[1.5rem] pb-[1.5rem] overflow-auto"
              >
                {/* Render the current step's fields using FormSteps component */}
                <FormSteps
                  fields={formStepsConfig[step]}
                  agentOrTeamType={agentOrTeamType}
                  usersSelectList={usersSelectList}
                  teamsSelectList={teamsSelectList}
                />
              </form>
              <footer className="flex w-full items-start justify-between px-[1.5rem]">
                {step < formStepsConfig.length - 1 && (
                  <WootButton onClick={handleNextStep}>Avançar</WootButton>
                )}
                {step === formStepsConfig.length - 1 && (
                  <WootButton type="submit" form="add-calendar" onClick={() => console.log(form.watch())}>
                    Criar Calendário
                  </WootButton>
                )}
              </footer>
            </FormProvider>
          </div>
        </section>
      )}
      {/* <CalendarList calendarList={calendars} /> */}
    </main>
  );
};