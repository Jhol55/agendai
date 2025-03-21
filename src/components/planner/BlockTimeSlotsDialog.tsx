import { useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { DialogContent } from "../ui/dialog";




export const BlockTimeSlotsDialog = () => {
  const [isOpened, setIsOpened] = useState(false);

  return (
    <Dialog open={isOpened} onOpenChange={setIsOpened} >
      <DialogTrigger asChild>
        <Button variant="outline">Bloquear períodos</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] md:max-w-[36rem] max-h-[90vh] rounded-md overflow-hidden !p-0">
        <DialogHeader className="mb-2 px-[1.5rem] pt-[1.5rem]">
          <DialogTitle>Bloquear períodos</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}