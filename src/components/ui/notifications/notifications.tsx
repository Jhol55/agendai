import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../dropdown-menu"
import { IconCalendar, IconMail, IconMailOpened } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { getNotifications } from "@/services/notifications"
import { Loading } from "../loading/loading"
import { Typography } from "../typography"
import { Separator } from "../separator"



export function Notifications() {

  const [notifications, setNotifications] = useState([]);
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
    scheduling: <IconCalendar className="h-5 w-5" />
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
                    <span className="border rounded-md p-2 bg-neutral-50 dark:bg-neutral-800">{icons[notification.type]}</span>
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

function BellIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}


function CalendarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}


function TruckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  )
}