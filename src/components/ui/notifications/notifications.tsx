import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { motion } from "framer-motion";
import { IconCalendar, IconMail, IconMailOpened, IconX } from "@tabler/icons-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { getNotifications, updateNotificationReadStatusById } from "@/services/notifications"
import { Loading } from "../loading/loading"
import { Typography } from "../typography"
import { Separator } from "../separator"
import { subscribe } from "@/database/realtime"
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { usePlannerData } from "@/contexts/planner/PlannerDataContext";
import { dateTimeFormatOptions } from "@/constants/dateTimeFormatOptions";
import React from "react";


interface NotificationProps {
  title: string;
  type: "appointments" | "payment";
  created_at: string;
  ref_id: number;
  is_read: boolean;
}

interface MessageProps {
  startTime: string;
  endTime: string;
  clientName: string;
  serviceName: string;
  isOnline: boolean;
  status: string;
}

export function Notifications() {
  const { getAppointmentById } = usePlannerData();
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [message, setMessage] = useState<MessageProps | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [trigger, setTrigger] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const handleUpdate = useCallback(() => setTrigger(!trigger), [trigger])
  const toastRef = useRef<string | number | undefined>(undefined)

  useEffect(() => {
    setIsLoading(message ? false : true);
    getNotifications({ page }).then(data => {
      setNotifications(data.notifications);
      setTotalPages(data.totalPages);
      setUnreadCount(data.unreadCount);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, page])

  useEffect(() => {
    const subscription = subscribe({
      channel: "notifications",
      table: "notifications",
      onChange: (payload) => {
        if (payload.eventType === "INSERT") {
          const newData = payload.new as unknown as NotificationProps;
          toastRef.current = toast.success(newData.title, { duration: 180000 });         
        }    
        handleUpdate();    
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [handleUpdate])

  useEffect(() => {
    let timeout: NodeJS.Timeout;
  
    if (!notifications?.length) {
      timeout = setTimeout(() => {
        setIsLoading(false);
        setUnreadCount(0);
      }, 5000);
    } else {
      setIsLoading(false);
    }
  
    return () => clearTimeout(timeout);
  }, [notifications]);

  useEffect(() => {
    if (toastRef.current && isOpened) {
      toast.dismiss(toastRef.current)
    }

    if (!isOpened) {
      setTimeout(()=> {
        setMessage(undefined);
      }, 200)
    }
  }, [isOpened])

  const readMessage = async ({ id, type }: { id: number, type: string }) => {
    setMessage(undefined);
    setIsMessageLoading(true);
    const getFunctionType = (type: string) => {
      return {
        appointments: getAppointmentById(id)
      }[type]
    }
    const message = await getFunctionType(type) as MessageProps;
    await updateNotificationReadStatusById({ data: { id, isRead: true, type } })
    setMessage(message);
  }

  const icons = {
    appointments: <IconCalendar className="h-5 w-5" />,
    payment: ""
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    setPage(page + 1);
  };

  const getPages = () => {
    if (page <= 2) return [1, 2, 3];
    return [page - 1, page, page + 1];
  };

  return (
    <DropdownMenu open={isOpened} onOpenChange={setIsOpened}>
      <DropdownMenuTrigger asChild className="relative">
        <Button variant="secondary" size="icon" className="rounded-full dark:bg-neutral-800">
          {
            isOpened
              ? <IconMailOpened className="h-4 w-4 -translate-y-[1px]" />
              : <IconMail className="h-4 w-4" />
          }
          <span className="sr-only">Toggle user menu</span>
          <div className="absolute flex items-center justify-center -top-3 -right-1 rounded-full h-5 w-5 shrink-0 text-xs bg-red-500 dark:bg-red-500 pointer-events-none">
            <span className="-translate-x-[1px]">{!isLoading ? unreadCount >= 99 ? 99 : unreadCount : null}</span>
            <Loading display={isLoading} className="absolute -translate-x-[0.5px] !scale-[0.2]" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background dark:bg-neutral-900 !p-0 sm:w-full w-screen md:max-w-md max-w-[90%] max-h-[90vh] mx-auto" side="top" align="center">
        <Card className="w-full border-0 bg-background dark:bg-neutral-900">
          <CardHeader className="!px-8 !pb-4">
            <CardTitle className="text-xl">Notificações</CardTitle>
            <div className="flex items-center">
              <CardDescription className="whitespace-nowrap">{
                unreadCount == 0
                  ? "Não há novas mensagens no momento."
                  : `Você tem ${unreadCount} ${unreadCount > 1
                    ? "mensagens novas não lidas"
                    : "mensagem nova não lida"}.`
              }
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 overflow-auto md:h-[calc(100vh-19rem)] h-[calc(100vh-22rem)] !p-0 !px-2">
            {!isLoading && !message && notifications?.length
              ? notifications.map((notification, index) => (
                <React.Fragment key={index}>
                  <Button
                    variant="outline"
                    className={cn("h-full max-h-16 border-none", notification.is_read ? "dark:bg-neutral-900" : "dark:bg-neutral-700")}
                    onClick={() => readMessage({ id: notification.ref_id, type: "appointments" })}
                  >
                    <div className="flex flex-col gap-4 w-full">
                      <div className="flex gap-4 items-center justify-between !px-2 w-full">
                        <div className="flex items-center gap-4 w-full">
                          <div className="border rounded-md p-2 bg-neutral-50 dark:bg-neutral-700">{icons[notification.type]}</div>
                          <div className="flex flex-col items-start gap-1 w-full overflow-hidden truncate">
                            <Typography>
                              {new Date(notification.created_at).toLocaleString("pt-BR", dateTimeFormatOptions).replace(",", " -")}
                            </Typography>
                            <Typography variant="span">{notification.title}</Typography>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Button>
                  <Separator orientation="horizontal" />
                </React.Fragment>
              )) : (!isLoading && message ?
                <div className="flex flex-col justify-center items-center h-full w-full px-6 pb-6">
                  <div className="flex flex-col justify-center items-center border rounded-md h-full w-full p-6 gap-4 dark:bg-background dark:border-neutral-800 bg-neutral-50">
                    <div className="flex gap-2">
                      <Typography variant="span" className="text-justify">Segue abaixo os detalhes do agendamento realizado pelo assistente:</Typography>
                    </div>
                    <div className="flex flex-col gap-1 h-full w-full">
                      <div className="flex gap-2 ">
                        <Typography variant="b" className="text-sm">Cliente:</Typography>
                        <Typography variant="span">{message.clientName}</Typography>
                      </div>
                      <div className="flex gap-2 ">
                        <Typography variant="b" className="text-sm">Serviço:</Typography>
                        <Typography variant="span">{message.serviceName}</Typography>
                      </div>
                      <div className="flex gap-2 ">
                        <Typography variant="b" className="text-sm">Modalidade:</Typography>
                        <Typography variant="span">{message.isOnline ? "Online" : "Presencial"}</Typography>
                      </div>
                      <div className="flex gap-2 ">
                        <Typography variant="b" className="text-sm">Início:</Typography>
                        <Typography variant="span">{new Date(message.startTime).toLocaleString("pt-BR", dateTimeFormatOptions).replace(",", " -")}</Typography>
                      </div>
                      <div className="flex gap-2 ">
                        <Typography variant="b" className="text-sm">Fim:</Typography>
                        <Typography variant="span">{new Date(message.endTime).toLocaleString("pt-BR", dateTimeFormatOptions).replace(",", " -")}</Typography>
                      </div>
                    </div>
                  </div>
                </div>
                : (isLoading &&
                  <div className="flex justify-center items-center h-full w-full">
                    <Loading display={isLoading} className="!scale-[0.5]" />
                  </div>
                ))}
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-4 justify-center !pb-4 !px-8">
            <Pagination className={cn(message && isMessageLoading && "hidden", "pt-4")}>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={handlePrevious} disabled={page - 1 < 1 || !notifications?.length}>Anterior</PaginationPrevious>
                </PaginationItem>
                <motion.div
                  initial={{ opacity: 0, x: 0 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex gap-2 relative"
                >
                  <div className={cn("absolute border w-10 h-full rounded-md bg-background", page > 1 && "left-1/2 -translate-x-1/2")} />
                  {getPages().map((pageNumber) => (
                    <PaginationItem key={pageNumber} className="z-50">
                      <PaginationLink
                        onClick={() => handlePageChange(pageNumber)}
                        disabled={pageNumber > totalPages}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                </motion.div>
                <PaginationItem>
                  <PaginationNext onClick={handleNext} disabled={page + 1 > totalPages || !notifications?.length}>Próximo</PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <Button
              variant="outline"
              className={cn(message && isMessageLoading && "hidden", "w-full")}
            >
              Marcar todos como lidos
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMessage(undefined);
                setIsMessageLoading(false);
              }}
              className={cn(!message && "hidden", "w-full")}
            >
              <IconX className="h-4 w-4" />
              Fechar
            </Button>
          </CardFooter>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}




