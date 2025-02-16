import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 new notifications.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-muted rounded-md flex items-center justify-center aspect-square w-10">
              <BellIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">New message from Jane</p>
              <p className="text-muted-foreground text-sm">Hey, just wanted to follow up on our meeting yesterday.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-muted rounded-md flex items-center justify-center aspect-square w-10">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Upcoming event reminder</p>
              <p className="text-muted-foreground text-sm">Your team meeting is scheduled for tomorrow at 2pm.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-muted rounded-md flex items-center justify-center aspect-square w-10">
              <TruckIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Delivery update</p>
              <p className="text-muted-foreground text-sm">
                Your order #12345 has been shipped and will arrive tomorrow.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Clear all notifications
        </Button>
      </CardFooter>
    </Card>
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