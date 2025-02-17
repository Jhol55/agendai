import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../dropdown-menu"
import { IconCalendar, IconMail, IconMailOpened } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { getNotifications } from "@/services/notifications"
import { Loading } from "../loading/loading"
import { Typography } from "../typography"
import { Separator } from "../separator"

interface NotificationProps {
  title: string;
  type: "scheduling" | "payment";
}

export function Notifications() {

  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getNotifications({}).then(data => setNotifications(data));
  }, [])

  useEffect(() => {
    if (notifications.length) {
      setIsLoading(false);
    }
  }, [notifications])

  const icons = {
    scheduling: <IconCalendar className="h-5 w-5" />,
    payment: ""
  }

  const [isOpened, setIsOpened] = useState(false);

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
            {!isLoading ? notifications?.length >= 99 ? 99 : notifications?.length : null}
            <Loading display={isLoading} className="absolute !scale-[0.2]" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background !p-0 w-full max-w-md" side="top" align="center">
        <Card className="w-full max-w-md border-0 bg-background">
          <CardHeader>
            <CardTitle className="text-xl">Notificações</CardTitle>
            <CardDescription>{`Você tem ${notifications?.length} ${notifications.length > 1 ? "novas mensagens" : "nova mensagem"}.`}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {notifications.map((notification, index) => (
              <div key={index} className="flex flex-col gap-4">
                <div className="flex gap-4 items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="border rounded-md p-2 bg-neutral-50 dark:bg-neutral-800">{icons[notification.type]}</div>
                    <Typography variant="span">{notification.title}</Typography>
                  </div>
                  <Button variant="outline">Ver</Button>
                </div>
                <Separator orientation="horizontal" />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Clear all notifications
            </Button>
          </CardFooter>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}




