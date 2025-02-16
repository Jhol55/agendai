"use client";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { IconCalendar, IconBriefcase, IconClock, IconVideo, IconMapPin, IconBrandWhatsapp, IconCheck } from "@tabler/icons-react";
import { getDecodedAppointmentId, setAppointmentStatus } from "@/services/confirm";
import { Loading } from "@/components/ui/loading/loading";
import { WordRotate } from "@/components/ui/word-rotate";
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

type AppointmentType = {
  startTime: string;
  endTime: string;
  status: string;
  isOnline: boolean;
  serviceName: string;
  clientName: string;
};

function ConfirmationLink() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointment");

  const [appointment, setAppointment] = useState<AppointmentType | undefined>(undefined);

  const [isPending, startOnSubmitTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"confirmed" | "canceled" | undefined>(undefined)

  useEffect(() => {
    if (appointmentId) {
      getDecodedAppointmentId({ encoded: appointmentId }).then(setAppointment)
    }
  }, [appointmentId]);

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        setIsLoading(false);
      }, 4000)
    }
  }, [isLoading])

  function onSubmit({ status }: { status: "confirmed" | "canceled" }) {
    startOnSubmitTransition(async () => {
      if (appointmentId) {
        setIsLoading(true);
        setStatus(status);
        await setAppointmentStatus({ data: { encoded: appointmentId, status: status } });
      }
    });
  }

  return (
      <main className="h-screen w-full bg-gray-50 dark:bg-neutral-800">
        <section className="flex items-center justify-center w-full h-full">
          {appointment?.clientName && appointment.status === "pending" && !status ? (
            <div className="flex flex-col items-center justify-center gap-6 border rounded-md shadow-lg lg:max-w-[40%] max-w-[80%] max-h-[95%] px-6 py-8 bg-white dark:bg-neutral-900">
              <div className="flex flex-col justify-center gap-4">
                <Typography variant="h1" className="text-center">
                  Confirmação de Agendamento
                </Typography>
                <Typography variant="p" className="text-justify">
                  Olá {appointment?.clientName?.split(" ")[0]}! Esperamos que você esteja bem. 😊
                  <br />
                  Você tem um compromisso agendado conosco e gostaríamos de garantir que tudo esteja conforme o
                  planejado. Para isso, pedimos que confira os detalhes abaixo e confirme sua presença ou, caso necessário, cancele o compromisso.
                </Typography>
                <div className="flex flex-col items-center p-4 border rounded-md">
                  <div>
                    <Typography variant="h2" className="mb-4 text-center">
                      Detalhes do agendamento
                    </Typography>
                    <div className="flex md:gap-6 gap-0 flex-col md:flex-row">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <IconBriefcase className="w-5 h-5" />
                          <Typography variant="p" className="font-semibold">Serviço:</Typography>
                          <Typography variant="p">{appointment?.serviceName}</Typography>
                        </div>
                        <div className="flex md:hidden items-center gap-2 mb-4">
                          {appointment?.isOnline ? <IconVideo className="w-5 h-5" /> : <IconMapPin className="w-5 h-5" />}
                          <Typography variant="p" className="font-semibold">Modalidade:</Typography>
                          <Typography variant="p">{appointment?.isOnline ? "Online" : "Presencial"}</Typography>
                        </div>
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                          <IconCalendar className="w-5 h-5" />
                          <Typography variant="p" className="font-semibold">Data:</Typography>
                          <Typography variant="p">{new Date(appointment?.startTime).toLocaleDateString()}</Typography>
                        </div>
                      </div>
                      <div>
                        <div className="md:flex hidden items-center gap-2 mb-4">
                          {appointment?.isOnline ? <IconVideo className="w-5 h-5" /> : <IconMapPin className="w-5 h-5" />}
                          <Typography variant="p" className="font-semibold">Modalidade:</Typography>
                          <Typography variant="p">{appointment?.isOnline ? "Online" : "Presencial"}</Typography>
                        </div>
                        <div className="flex items-center gap-2 mb-0">
                          <IconClock className="w-5 h-5" />
                          <Typography variant="p" className="font-semibold">Horário:</Typography>
                          <Typography variant="p">
                            {new Date(appointment?.startTime).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Typography>
                  Sua confirmação é importante para que possamos garantir um atendimento adequado e uma experiência excelente para você. 😄
                </Typography>
              </div>
              <div className="flex gap-6 w-full md:w-fit">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="md:w-32 w-full bg-red-500 text-white hover:bg-red-600"
                    >
                      Cancelar
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
                      <AlertDialogDescription asChild>
                        <Typography
                          variant="span"
                          secondary
                        >
                          Esta ação é irreversível. Tem certeza de que deseja cancelar seu agendamento?
                        </Typography>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="md:w-32 w-full text-black dark:text-white"
                      >
                        Voltar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="md:w-32 w-full bg-red-500 text-white hover:bg-red-600"
                        onClick={() => onSubmit({ status: "canceled" })}
                      >
                        Continuar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="md:w-32 w-full bg-green-500 text-white hover:bg-green-600"
                    >
                      Confirmar
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
                      <AlertDialogDescription asChild>
                        <Typography
                          variant="span"
                          secondary
                        >
                          Esta ação é irreversível. Tem certeza de que deseja confirmar seu agendamento?
                        </Typography>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        className="md:w-32 w-full text-black dark:text-white"
                      >
                        Voltar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="md:w-32 w-full bg-green-500 text-white hover:bg-green-600"
                        onClick={() => onSubmit({ status: "confirmed" })}
                      >
                        Continuar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

              </div>
            </div>
          ) : (appointment?.clientName && (status || appointment?.status !== "pending") &&
            <div className="border rounded-md shadow-lg lg:max-w-[40%] max-w-[80%] w-full max-h-[95%] px-6 py-8 bg-white">
              {isLoading && (
                <div className="flex flex-col items-center justify-center gap-6">
                  <WordRotate className="text-md font-medium w-full" words={[
                    "Quase lá! Estamos carregando as informações... 🚀",
                    "Só mais um segundinho... ⌛"
                  ]} />
                  <Loading display={isLoading} className="!scale-[0.5]" />
                </div>
              )}
              {!isLoading && (status === "confirmed" || appointment?.status === "confirmed") ? (
                <div className="flex flex-col items-center w-full h-full">
                  <div className="flex flex-col items-center w-full h-full">
                    <Typography variant="h1" className="mb-4">
                      <span className="flex gap-2 items-center">
                        Agendamento confirmado com sucesso!
                        <IconCheck className="!w-8 !h-8 text-green-400" />
                      </span>
                    </Typography>
                    <Typography variant="p" className="text-justify">
                      Estamos muito felizes em recebê-lo e garantir que sua experiência seja incrível. <br />
                      Se precisar de qualquer ajuste, entre em contato através do botão abaixo. Nos vemos em breve! 😊
                    </Typography>
                  </div>
                  <div className="mt-6">
                    <a href="https://wa.me/551930913931" target="_blank" className="flex justify-center items-center w-fit h-full">
                      <Button className="bg-[#25D366] hover:bg-[#1da34d] shadow-md w-full h-full px-4 py-2" asChild>
                        <div className="flex gap-2 w-full h-full">
                          <IconBrandWhatsapp className="!w-8 !h-8" />
                          <Typography variant="span" className="!text-white">Ir para o WhatsApp</Typography>
                        </div>
                      </Button>
                    </a>
                  </div>
                </div>
              ) : !isLoading && (status === "canceled" || appointment?.status === "canceled") && (
                <div className="flex flex-col items-center w-full h-full">
                  <div className="flex flex-col items-center w-full h-full">
                    <Typography variant="h1" className="mb-4">
                      Agendamento cancelado com sucesso! 😞
                    </Typography>
                    <Typography variant="p" className="text-justify">
                      Entendemos que imprevistos acontecem! Seu agendamento foi cancelado. Se precisar reagendar ou tiver alguma dúvida, entre em contato através do botão abaixo.
                    </Typography>
                  </div>
                  <div className="mt-6">
                    <a href="https://wa.me/551930913931" target="_blank" className="flex justify-center items-center w-fit h-full">
                      <Button className="bg-[#25D366] hover:bg-[#1da34d] shadow-md w-full h-full px-4 py-2" asChild>
                        <div className="flex gap-2 w-full h-full">
                          <IconBrandWhatsapp className="!w-8 !h-8" />
                          <Typography variant="span" className="!text-white">Ir para o WhatsApp</Typography>
                        </div>
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
  );
}

export default function ConfirmationLinkWithSuspense() {
  return (
    <Suspense fallback={<div></div>}>
      <ConfirmationLink />
    </Suspense>
  )
}