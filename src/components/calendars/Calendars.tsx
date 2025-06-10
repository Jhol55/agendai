import { useCallback, useEffect, useMemo, useState } from "react";
import { Typography } from "../ui/typography";
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
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
  TimelineLine,
} from "@/components/ui/timeline";
import { Form, FormMessage } from "@/components/ui/form";
import { WootButton } from "../ui/woot-button";
import { Path, useForm, FormProvider } from "react-hook-form";
import { AddCalendarProps, AddCalendarSchema } from "./models/AddCalendar";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "../ui/input";
import { TextArea } from "../ui/text-area";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { IconChevronLeft } from "@tabler/icons-react";

import { getCookie, getUsers } from "@/services/users";
import { getTeams } from "@/services/teams";

import { FormSteps } from './FormSteps';
import { FormFieldConfig } from './types';
import { Select } from "@/components/ui/select/select";
import { getAllServices, getServices } from "@/services/services";
import { ServiceListTable } from "./ServiceListTable";
import { PaginationControls } from "./PaginationControls";
import { createCalendar, deleteCalendar, getCalendars, updateCalendar } from "@/services/calendars";
import { CalendarList, CalendarType } from "./CalendarList";
import { useSearchParams } from "next/navigation";
import Spinner from "../ui/spinner";
import { parseSafeDate } from "@/utils/utils";


// Version 1.90.2


export const Calendars = () => {
  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [services, setServices] = useState<{
    id: string,
    name: string,
    price: number,
    duration_minutes: number,
    allow_online: boolean,
    allow_in_person: boolean
    description: string;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editCalendarIndex, setEditCalendarIndex] = useState<number | undefined>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteCalendarIndex, setDeleteCalendarIndex] = useState<number | undefined>(undefined);

  const searchParams = useSearchParams();
  const accountId = searchParams.get("accountId") ?? "1";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, teamsData, servicesData, calendarsData] = await Promise.all([
          getUsers({}),
          getTeams({}),
          getAllServices({}).then((data) => data.services),
          getCalendars({ id: accountId })
        ]);
        setUsers(usersData);
        setTeams(teamsData);
        setServices(servicesData);
        setCalendars(calendarsData);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [accountId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000)

    if (calendars.length) {
      setIsLoading(false);
      clearTimeout(timeout);
    }
  }, [calendars])

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
      services: [],
      operatingHours: {
        sunday: { start: undefined, end: undefined, closed: false },
        monday: { start: undefined, end: undefined, closed: false },
        tuesday: { start: undefined, end: undefined, closed: false },
        wednesday: { start: undefined, end: undefined, closed: false },
        thursday: { start: undefined, end: undefined, closed: false },
        friday: { start: undefined, end: undefined, closed: false },
        saturday: { start: undefined, end: undefined, closed: false },
      },
      settings: {
        tax: "0",
        rescheduleDeadlineValue: "2",
        rescheduleDeadlineUnit: "days",
        paymentDeadlineValue: "1",
        taxDeadlineValue: "2"
      }
    }),
    []
  );

  // Initialize react-hook-form
  const form = useForm<AddCalendarProps>({
    resolver: zodResolver(AddCalendarSchema),
    defaultValues,
  });

  const watch = form.watch();

  useEffect(() => {
    if (editCalendarIndex !== undefined && calendars.length > 0 && Object.keys(calendars[0]).length > 0) {
      form.reset({
        calendar: {
          id: calendars[editCalendarIndex]?.id ?? "",
          name: calendars[editCalendarIndex]?.name ?? "",
          description: calendars[editCalendarIndex]?.description ?? "",
        },
        agentOrTeam: {
          id: calendars[editCalendarIndex]?.user_or_team_id ?? "",
          type: calendars[editCalendarIndex]?.user_type ?? "",
        },
        services: calendars[editCalendarIndex]?.services,
        operatingHours: {
          sunday: {
            start: parseSafeDate(calendars[editCalendarIndex]?.operating_hours?.[0]?.start),
            end: parseSafeDate(calendars[editCalendarIndex]?.operating_hours?.[0]?.end),
            closed: calendars[editCalendarIndex]?.operating_hours?.[0]?.closed
          },
          monday: {
            start: parseSafeDate(calendars[editCalendarIndex]?.operating_hours?.[1]?.start),
            end: parseSafeDate(calendars[editCalendarIndex]?.operating_hours?.[1]?.end),
            closed: calendars[editCalendarIndex]?.operating_hours?.[1]?.closed
          },
          tuesday: {
            start: parseSafeDate(calendars[editCalendarIndex]?.operating_hours?.[2]?.start),
            end: parseSafeDate(calendars[editCalendarIndex]?.operating_hours?.[2]?.end),
            closed: calendars[editCalendarIndex]?.operating_hours?.[2]?.closed
          },
          wednesday: {
            start: parseSafeDate(calendars[editCalendarIndex]?.operating_hours?.[3]?.start),
            end: parseSafeDate(calendars[editCalendarIndex]?.operating_hours?.[3]?.end),
            closed: calendars[editCalendarIndex]?.operating_hours?.[3]?.closed
          },
          thursday: {
            start: parseSafeDate(calendars[editCalendarIndex]?.operating_hours?.[4]?.start),
            end: parseSafeDate(calendars[editCalendarIndex]?.operating_hours?.[4]?.end),
            closed: calendars[editCalendarIndex]?.operating_hours?.[4]?.closed
          },
          friday: {
            start: parseSafeDate(calendars[editCalendarIndex]?.operating_hours?.[5]?.start),
            end: parseSafeDate(calendars[editCalendarIndex]?.operating_hours?.[5]?.end),
            closed: calendars[editCalendarIndex]?.operating_hours?.[5]?.closed
          },
          saturday: {
            start: parseSafeDate(calendars[editCalendarIndex]?.operating_hours?.[6]?.start),
            end: parseSafeDate(calendars[editCalendarIndex]?.operating_hours?.[6]?.end),
            closed: calendars[editCalendarIndex]?.operating_hours?.[6]?.closed
          },
        },
        settings: {
          tax: calendars[editCalendarIndex]?.settings.tax ?? "0",
          rescheduleDeadlineValue: calendars[editCalendarIndex]?.settings.reschedule_deadline_value ?? "2",
          rescheduleDeadlineUnit: calendars[editCalendarIndex]?.settings.reschedule_deadline_unit ?? "days",
          paymentDeadlineValue: calendars[editCalendarIndex]?.settings.payment_deadline_value ?? "1",
          taxDeadlineValue: calendars[editCalendarIndex]?.settings.tax_deadline_value ?? "2"
        }
      });
    }
  }, [calendars, editCalendarIndex, form]);

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return services.slice(startIndex, endIndex);
  }, [services, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(services.length / itemsPerPage);

  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Configuration for the timeline steps
  const timelines = [
    { title: "Informações básicas", content: "Adicione um nome e descrição ao seu calendário." },
    { title: "Adicionar agentes", content: "Adicione um agente ou um time de agentes." },
    { title: "Adicionar serviços", content: "Adicione um ou mais serviços." },
    { title: "Definir horários", content: "Defina os horários de funcionamento semanais para o calendário." },
    { title: "Configurações adicionais", content: "Ajuste as preferências do calendário." },
  ];

  // Headers and content for each form step
  const formHeaders = [
    { title: "Informações básicas", content: "Adicione um nome e descrição ao seu calendário." },
    { title: "Adicionar agentes", content: "Adicione um agente ou uma equipe para organizar e gerenciar agendamentos no calendário." },
    { title: "Adicionar serviços", content: "Adicione um ou mais serviços previamente cadastrados ao seu calendário." },
    { title: "Definir horários", content: "Defina os horários de início e fim para cada dia da semana. Após criar o calendário, você também poderá bloquear horários específicos." },
    { title: "Configurações adicionais", content: "Refine as definições do calendário, incluindo a taxa de reserva, as políticas de agendamento e aspectos financeiros, para atender às suas necessidades específicas." },
  ];

  // Explicit typing for the form steps configuration array
  const formStepsConfig: FormFieldConfig[][] = useMemo(() => {
    return [
      // Step 0: Calendar details
      [
        { name: "calendar.name", component: Input, label: "Nome", placeholder: "Nome do calendário", className: "", type: "text" },
        { name: "calendar.description", component: TextArea, label: "Descrição", placeholder: "Descrição do calendário", className: "min-h-20", type: "textarea" },
      ],
      // Step 1: Agent or Team selection
      [
        {
          name: "agentOrTeam.id", component: Select, placeholder: "Nome...", type: "select", className: "",
          src: watch.agentOrTeam.type === "agent" ? usersSelectList : teamsSelectList,
          label: (
            <div>
              <Button
                variant="ghost"
                type="button"
                className={cn(
                  watch.agentOrTeam.type === "agent" &&
                  "bg-neutral-200 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-700"
                )}
                onClick={() => {
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
                  watch.agentOrTeam.type === "team" &&
                  "bg-neutral-200 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-700"
                )}
                onClick={() => {
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
      // Step 2: Add services
      [
        {
          name: "services", type: "custom",
          component: (
            <ServiceListTable services={paginatedServices} fieldName="services" />
          )
        },
      ],
      // Step 3: Operating hours
      [
        { name: "operatingHours.sunday", label: "Domingo", type: "dayHours" },
        { name: "operatingHours.monday", label: "Segunda-feira", type: "dayHours" },
        { name: "operatingHours.tuesday", label: "Terça-feira", type: "dayHours" },
        { name: "operatingHours.wednesday", label: "Quarta-feira", type: "dayHours" },
        { name: "operatingHours.thursday", label: "Quinta-feira", type: "dayHours" },
        { name: "operatingHours.friday", label: "Sexta-feira", type: "dayHours" },
        { name: "operatingHours.saturday", label: "Sábado", type: "dayHours" },
      ],
      // Step 4: Settings
      [
        { name: "settings.tax", component: Input, label: "Taxa de reserva", placeholder: "", className: "", type: "text", mask: "currency" },
        { name: "settings.taxDeadlineValue", component: Input, label: "Prazo para pagamento da taxa de reserva (Dias antes)", placeholder: "", className: "", type: "text" },
        { name: "settings.rescheduleDeadlineValue", component: Input, label: "Prazo para reagendamento", className: "w-full", placeholder: "", type: "text", group: "reschedule" },
        { name: "settings.rescheduleDeadlineUnit", component: Select, src: [{ label: "Dias", value: "days" }, { label: "Horas", value: "hours" }], label: "Unidade", placeholder: "", className: "w-full", type: "select", group: "reschedule" },
        { name: "settings.paymentDeadlineValue", component: Input, label: "Prazo para pagamento do serviço (Dias após)", placeholder: "", className: "", type: "text" },
      ],
    ];
  }, [form, paginatedServices, teamsSelectList, usersSelectList, watch]);

  // Callback for form submission
  const onSubmit = useCallback(
    async (data: AddCalendarProps) => {
      if (editCalendarIndex === undefined) {
        await createCalendar({ data });
      } else {
        await updateCalendar({ data });
      }

      await getCalendars({ id: accountId }).then(setCalendars);

      form.reset(); // Reset form after submission
      setStep(0); // Go back to the first step
      setShowForm(false); // Hide the form
      setEditCalendarIndex(undefined);
    },
    [accountId, editCalendarIndex, form]
  );

  // Callback to advance to the next step
  const handleNextStep = useCallback(async (newStep?: number) => {
    let targetStep = newStep !== undefined ? newStep : step + 1; // O passo alvo inicial
    targetStep = Math.min(targetStep, formStepsConfig.length - 1); // Garante que não exceda o último passo

    let fieldsToValidateInCurrentIteration: Path<AddCalendarProps>[] = [];
    let validationPassedUpToStep = step; // Acompanha até qual passo a validação passou

    // Itera pelos passos, validando um por um
    for (let s = step; s <= targetStep; s++) {
      if (s < 0 || s >= formStepsConfig.length) {
        break; // Sai do loop se o passo estiver fora dos limites
      }

      fieldsToValidateInCurrentIteration = formStepsConfig[s].flatMap((input) => {
        if (input.type === "dayHours") {
          const dayName = (input.name as string).split(".")[1];
          return [
            `operatingHours.${dayName}.start`,
            `operatingHours.${dayName}.end`,
            `operatingHours.${dayName}.closed`,
          ];
        }
        return input.name;
      }) as Path<AddCalendarProps>[];

      // Se o passo atual não tem campos para validar, ele é considerado válido para pular
      if (fieldsToValidateInCurrentIteration.length === 0) {
        validationPassedUpToStep = s;
        continue; // Pula para o próximo passo
      }

      // Valida APENAS os campos do passo atual (s)
      const isValid = await form.trigger(fieldsToValidateInCurrentIteration);

      if (!isValid) {
        // Se a validação falhar para este passo (s),
        // o formulário deve ir para ESTE passo (s) onde falhou.
        setStep(s);
        form.clearErrors(); // Opcional: limpa erros de outros campos, foca no erro atual
        // Opcional: Foca no primeiro campo com erro nesse passo
        // if (Object.keys(form.formState.errors).length > 0) {
        //     form.setFocus(Object.keys(form.formState.errors)[0] as Path<AddCalendarProps>);
        // }
        return; // Sai da função, pois a navegação já foi feita para o passo com erro
      } else {
        // Se o passo atual (s) é válido, atualiza o marcador de passo válido
        validationPassedUpToStep = s;
      }
    }

    // Se o loop terminou (todos os passos até targetStep foram validados com sucesso)
    // ou se newStep era menor que step, avança para o targetStep (que é o newStep ou step + 1)
    if (validationPassedUpToStep === targetStep) {
      setStep(targetStep); // Define o passo final como o targetStep
      form.clearErrors(); // Limpa todos os erros após a validação completa
    }

    // Se você tiver um cenário onde newStep é menor que step, e você quer permitir voltar sem revalidar tudo,
    // adicione uma verificação aqui.
    if (newStep !== undefined && newStep < step) {
      setStep(newStep);
      form.clearErrors();
    }


  }, [step, form, formStepsConfig]); // Dependências permanecem as mesmas

  // Callback to go back to the previous step or close the form
  const handlePrevStep = useCallback((newStep?: number) => {
    setStep((prevStep) => {
      if (prevStep === 0) {
        setTimeout(() => {
          form.reset(); // Reset form if going back from the first step
        }, 200)
        setShowForm(false); // Hide the form
        setEditCalendarIndex(undefined);
      }
      return newStep === undefined ? Math.max(prevStep - 1, 0) : newStep;
    });
  }, [form]);

  return (
    <main
      className={cn(
        "flex md:flex-row flex-col w-full !bg-[rgb(253,253,253)] dark:!bg-dark-chatwoot-primary",
        !showForm && "!flex-col",
        showForm && "md:gap-10"
      )}
    >
      <section
        className={cn(
          "flex flex-col md:w-fit w-full",
          !showForm && "md:w-full",
          showForm && "md:h-full md:!w-[30rem] w-full"
        )}
      >
        <header className={cn("flex flex-col md:pb-10 px-6 sm:px-0 gap-2", showForm && "md:fixed px-0")}>
          <div className="flex items-center justify-between gap-2 w-full mx-auto">
            <div className="flex items-center gap-4 sm:px-0">
              {showForm && (
                <Button
                  variant="ghost"
                  className="hover:bg-transparent md:!p-0 px-2"
                  onClick={() => handlePrevStep()}
                >
                  <IconChevronLeft className="!h-8 !w-8" />
                </Button>
              )}
              <Typography variant="h1" className="h-10">
                Calendários
              </Typography>
            </div>
            {!showForm && (
              <WootButton onClick={() => {
                setShowForm(true);
                form.reset(defaultValues);
              }}
              >
                Adicionar Calendário
              </WootButton>
            )}
          </div>
          {!showForm && (
            <Typography variant="span" className="dark:!text-neutral-400 !text-neutral-500 font-normal font-inter max-w-3xl">
              Um calendário é uma ferramenta que permite gerenciar compromissos. A lista abaixo mostra todos os calendários disponíveis em sua conta, incluindo aqueles compartilhados com você diretamente ou por meio de sua equipe.
            </Typography>
          )}
        </header>
        {showForm && (
          <aside className={cn("top-16", showForm && "md:fixed")}>
            <Timeline className="max-w-[20rem] w-full md:block hidden">
              {timelines.map((timeline, index) => (
                <TimelineItem key={index} status="done">
                  <TimelineHeading className="cursor-pointer" onClick={() => index >= step ? handleNextStep(index) : handlePrevStep(index)}>{timeline.title}</TimelineHeading>
                  <TimelineDot
                    status={
                      step > index
                        ? "done"
                        : step === index
                          ? "current"
                          : "default"
                    }
                    className={cn(
                      step > index && "bg-green-500 border-green-500",
                      step === index &&
                      "border-neutral-600 [&>svg]:!text-neutral-600"
                    )}
                  />
                  {index < timelines.length - 1 && (
                    <TimelineLine done={step > index} className={cn(step > index && "bg-green-500")} />
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
      {showForm ? (
        <section className={cn("flex flex-col gap-4 p-4 w-full h-full")}>
          <div className="relative dark:bg-neutral-800 shadow-md bg-neutral-100 py-6 rounded-lg h-fit sm:h-full">
            <header className="px-[1.5rem] pb-4">
              <Typography variant="h1">{formHeaders[step]?.title}</Typography>
              <Typography variant="span" className="dark:!text-neutral-400 !text-neutral-600">
                {formHeaders[step].content}
              </Typography>
            </header>
            {/* FormProvider makes form context available to all nested components */}
            <FormProvider {...form}>
              <form
                id="add-calendar"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 px-[1.5rem] pb-[1.5rem] overflow-hidden"
              >
                {/* Render the current step's fields using FormSteps component */}
                <FormSteps fields={formStepsConfig[step]} />
              </form>
              <footer className="flex w-full items-start justify-between px-[1.5rem]">
                {step < formStepsConfig.length - 1 && (
                  <>
                    <div className="flex flex-col gap-2">
                      {step === 2 && <FormMessage>{form.formState.errors.services?.message as string}</FormMessage>}
                      <WootButton className="w-fit" type="button" onClick={() => handleNextStep()}>Avançar</WootButton>
                    </div>
                    {step === 2 &&
                      <div className="w-2/3">
                        <PaginationControls
                          totalItems={services.length}
                          itemsPerPage={itemsPerPage}
                          currentPage={currentPage}
                          onPageChange={handlePageChange}
                        />
                      </div>}
                  </>
                )}
                {step === formStepsConfig.length - 1 && (
                  <div className="flex items-center gap-4">
                    <WootButton type="submit" form="add-calendar">
                      {editCalendarIndex === undefined ? "Criar Calendário" : "Atualizar Calendário"}
                    </WootButton>
                    {form.formState.isSubmitting && <Spinner />}
                  </div>
                )}
              </footer>
            </FormProvider>
          </div>
        </section>
      ) : (
        isLoading ? (
          <div className="w-full h-full flex justify-center">
            <div className="flex gap-4 items-start">
              <Typography variant="h2">Carregando calendários</Typography>
              <Spinner />
            </div>
          </div>
        ) : (
          !(calendars.length > 0 && Object.keys(calendars[0]).length > 0) ? (
            <div className="flex justify-center items-start w-full h-full">
              <Typography variant="h2" className="!text-neutral-600 dark:!text-neutral-400">Não existem calendários associados a esta conta.</Typography>
            </div>
          ) : (
            <>
              <CalendarList calendarList={calendars} onEdit={(index) => {
                setEditCalendarIndex(index);
                setShowForm(true);
              }}
                onDelete={(index) => {
                  setShowDeleteDialog(true);
                  setDeleteCalendarIndex(index)
                }}
              />
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
                        Esta ação removerá o calendário selecionado e não poderá ser desfeita.
                      </Typography>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      className="!border-none"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowDeleteDialog(false);
                      }}
                    >
                      Voltar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600 text-white !border-none"
                      onClick={async (e) => {
                        e.preventDefault();
                        if (deleteCalendarIndex !== undefined) {
                          setShowDeleteDialog(false);
                          await deleteCalendar({ id: calendars[deleteCalendarIndex]?.id });
                          await getCalendars({ id: accountId }).then(setCalendars);                       
                        }
                      }}
                    >
                      Continuar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )
        )
      )}
    </main>
  );
};