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
import { IconCalendar, IconMail, IconMailOpened } from "@tabler/icons-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { getNotifications } from "@/services/notifications"
import { Loading } from "../loading/loading"
import { Typography } from "../typography"
import { Separator } from "../separator"
import { subscribe } from "@/database/realtime"
import { cn } from "@/lib/utils";
import { toast } from "sonner";


interface NotificationProps {
  title: string;
  type: "appointments" | "payment";
  created_at: string;
  created_by: "ai" | "user";
}

export function Notifications() {

  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [trigger, setTrigger] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const handleUpdate = useCallback(() => setTrigger(!trigger), [trigger])
  const toastRef = useRef<string | number | undefined>(undefined)

  useEffect(() => {
    setIsLoading(true);
    getNotifications({ page }).then(data => {
      setNotifications(data.notifications);
      setTotalPages(data.totalPages);
      setUnreadCount(data.unreadCount);
    });
  }, [trigger, page])

  useEffect(() => {
    const subscription = subscribe({
      channel: "notifications",
      table: "notifications",
      onChange: (payload) => {
        const newData = payload.new as NotificationProps;
        toastRef.current = toast.success(newData.title, { duration: 180000 });
        handleUpdate();
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [handleUpdate])

  useEffect(() => {
    if (notifications?.length) {
      setIsLoading(false);
    }
  }, [notifications])

  useEffect(() => {
    if (isOpened) {
      toast.dismiss(toastRef.current)
    }
  }, [isOpened])

  const readMessage = (id: number) => {
    console.log(id)
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
        <Button variant="secondary" size="icon" className="rounded-full">
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
      <DropdownMenuContent className="bg-background dark:bg-neutral-900 !p-0 sm:w-full w-screen md:max-w-md max-w-full max-h-[85vh]" side="top" align="center">
        <Card className="w-full border-0 bg-background dark:bg-neutral-900">
          <CardHeader className="!p-6">
            <CardTitle className="text-xl">Notificações</CardTitle>
            <CardDescription>{
              unreadCount === 0
                ? "Não há novas mensagens no momento."
                : `Você tem ${unreadCount} ${unreadCount > 1
                  ? "mensagens novas não lidas"
                  : "mensagem nova não lida"}.`
            }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 overflow-auto h-[52vh] max-h-[52vh] !p-0">
            {!isLoading && notifications?.length
              ? notifications.map((notification, index) => (
                <div key={index} className="flex flex-col gap-4">
                  <div className="flex gap-4 items-center justify-between !px-6">
                    <div className="flex items-center gap-4">
                      <span className="border rounded-md p-2 bg-neutral-50 dark:bg-neutral-800">{icons[notification.type]}</span>
                      <div className="flex flex-col gap-1">
                        <Typography>
                          {new Date(notification.created_at).toLocaleString("pt-BR",
                            {
                              timeZone: 'America/Sao_Paulo',
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false,
                            }
                          ).replace(",", " -")}
                        </Typography>
                        <Typography variant="span">{notification.title}</Typography>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => readMessage(1)}>Ver</Button>
                  </div>
                  <Separator orientation="horizontal" />
                </div>
              )) : (
                <div className="flex justify-center items-center h-full w-full">
                  <Loading display={isLoading} className="!scale-[0.5]" />
                </div>
              )}
          </CardContent>
          <CardFooter className="flex flex-col items-center gap-4 justify-center !py-4 !px-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={handlePrevious} disabled={page - 1 < 1}>Anterior</PaginationPrevious>
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
                  <PaginationNext onClick={handleNext} disabled={page + 1 > totalPages}>Próximo</PaginationNext>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <Button variant="outline" className="w-full">
              Marcar todos como lidos
            </Button>
          </CardFooter>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}




