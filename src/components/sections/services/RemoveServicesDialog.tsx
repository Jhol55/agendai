
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Typography } from "@/components/ui/typography"
import { IconTrash } from "@tabler/icons-react"
import { useCallback, useState } from "react"
import { Row } from "@tanstack/react-table"
import { deleteServices } from "@/services/services"

type RawServiceType = {
  id: string,
  name: string,
  price: number,
  description: string,
  duration_minutes: number,
  allow_online: boolean,
  allow_in_person: boolean,
  active: boolean
}

export const RemoveServicesDialog = ({ services, onSubmitSuccess }: { services: Row<RawServiceType>[], onSubmitSuccess?: () => void }) => {

  const [isOpened, setIsOpened] = useState(false);

  const Remove = useCallback(async () => {
    await deleteServices({ data: { services } });
    onSubmitSuccess?.();
  }, [onSubmitSuccess, services])

  return (
    <AlertDialog open={isOpened} onOpenChange={setIsOpened}>
      <AlertDialogTrigger className="flex items-center" asChild>
      <Button variant="ghost" disabled={!services.length}>
          <IconTrash className="h-4 w-4 !text-red-400" />
          <Typography variant="span" className="md:block hidden !text-red-400">Remover</Typography>
        </Button>
      </AlertDialogTrigger>
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
              Esta ação removerá o serviço selecionado e não poderá ser desfeita após salvar o formulário.
            </Typography>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
          className="!text-white dark!:text-white"
            onClick={(e) => {
              e.preventDefault();
              setIsOpened(false);
            }}
          >
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-500 hover:bg-red-600 text-white"
            onClick={(e) => {
              e.preventDefault();
              setIsOpened(false);
              Remove();
            }}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}