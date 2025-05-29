import { MouseEventHandler, useEffect, useState, useTransition } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { IconEdit } from "@tabler/icons-react";
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { AddNewServiceSchema, ServiceType, updateServiceSchema } from "@/models/Services"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { TextArea } from "@/components/ui/text-area"
import { Checkbox } from "@/components/ui/checkbox"
import { updateService } from "@/services/services"
import { cn } from "@/lib/utils"
import { toast } from "sonner";

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

export const EditServiceDialog = ({
  onSubmitSuccess,
  service,
  onClick,
}: {
  onSubmitSuccess?: () => void,
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void,
  service: RawServiceType
}) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isPending, startUpdateServiceTransition] = useTransition();

  const form = useForm<ServiceType>({
    resolver: zodResolver(updateServiceSchema),
    reValidateMode: "onChange",
    defaultValues: {
      id: service.id,
      name: service.name,
      description: service.description,
      allowOnline: service.allow_online,
      allowInPerson: service.allow_in_person,
      durationMinutes: service.duration_minutes,
      active: service.active,
      price: Number(service.price)
    }
  });


  async function onSubmit(values: z.infer<typeof AddNewServiceSchema>) {
    const newService = {
      id: service.id,
      name: values.name,
      description: values.description,
      allowOnline: values.allowOnline,
      allowInPerson: values.allowInPerson,
      price: values.price,
      durationMinutes: values.durationMinutes,
      active: values.active,
    }

    startUpdateServiceTransition(() => {
      toast.promise(
        () =>
          new Promise((resolve) => {
            resolve(updateService({ data: newService }));
          }).then(() => {
            setTimeout(() => {
              form.reset();
              setIsOpened(false);
              onSubmitSuccess?.();
            }, 500);
          }),
        {
          loading: "Atualizando serviço...",
          success: "Serviço atualizado com sucesso!",
          error: "Ocorreu um erro ao atualizar o serviço. Tente novamente!",
        },
      );
    });
  }

  useEffect(() => {
    if (!isOpened) {
      form.reset();
    }
  }, [form, isOpened])

  const watch = form.watch();

  return (
    <Dialog open={isOpened} onOpenChange={setIsOpened}>
      <Button variant="ghost" className="!p-0 hover:bg-transparent w-full h-full" onDoubleClick={() => setIsOpened(true)} onClick={onClick}>
      </Button>
      <DialogContent
        className="max-w-[90vw] md:max-w-[36rem] max-h-[90vh] rounded-md overflow-hidden !p-0"
      >
        <DialogHeader className="mb-2 px-[1.5rem] pt-[1.5rem]">
          <DialogTitle>Novo serviço</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form id="update-service" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-h-[70vh] overflow-auto px-[1.5rem] pb-[1.5rem]">
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-col mt-2.5">
                  <FormLabel className="text-left">Status</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          field.onChange(true)
                        }}
                        variant={field.value === true ? "default" : "outline"}
                        className={cn(
                          "w-1/3 hover:bg-green-500 dark:hover:bg-green-500 hover:text-white !text-white",
                          field.value === true && "bg-green-500 dark:bg-green-500 text-white hover:bg-green-500 dark:hover:bg-green-500"
                        )}
                        type="button"
                      >
                        Ativo
                      </Button>
                      <Button
                        onClick={() => {
                          field.onChange(false)
                        }}
                        variant={field.value === false ? "default" : "outline"}
                        className={cn(
                          "w-1/3 hover:bg-red-500 dark:hover:bg-red-500 hover:text-white !text-white",
                          field.value === false && "bg-red-500 dark:bg-red-500 text-white hover:bg-red-500 dark:hover:bg-red-500"
                        )}
                        type="button"
                      >
                        Inativo
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-left">Nome</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do serviço..."
                      autoComplete="off"
                      onChange={(e) => field.onChange(e.target.value)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-6">
              <FormField
                control={form.control}
                name="allowInPerson"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={(() => {
                            return field.value
                          })()}
                          onCheckedChange={(checked: boolean) => {
                            field.onChange(checked);
                            form.clearErrors("allowOnline");
                          }}
                        />
                        <FormLabel className="text-left">Permite presencial</FormLabel>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="allowOnline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked: boolean) => {
                            field.onChange(checked);
                            form.clearErrors("allowInPerson");
                          }}
                        />
                        <FormLabel className="text-left">Permite online</FormLabel>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="!mt-2">
              <FormMessage>
                {form.formState.errors.allowInPerson?.message}
              </FormMessage>
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-left">Descrição</FormLabel>
                  <FormControl>
                    <TextArea
                      className="!min-h-16"
                      placeholder="Descrição do serviço..."
                      onChange={(e) => field.onChange(e.target.value)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2 w-full">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel className="text-left">Valor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Valor"
                        spellCheck={false}
                        value={Number(field.value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, "");
                          field.onChange(numericValue ? Number(numericValue) / 100 : "");
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel className="text-left">Duração (min)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Duração em minutos..."
                        spellCheck={false}
                        value={Number(field.value ?? 0)}
                        onChange={(e) => {
                          const numericValue = e.target.value.replace(/\D/g, "");
                          field.onChange(numericValue ? Number(numericValue) : 0);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex !mt-2 w-full gap-2">
              {form.formState.errors.price?.message
                ?
                <FormMessage className="w-full">
                  {form.formState.errors.price?.message}
                </FormMessage>
                :
                <div className="w-full" />
              }
              <FormMessage className="w-full">
                {form.formState.errors.durationMinutes?.message}
              </FormMessage>
            </div>
          </form>
          <DialogFooter className="px-[1.5rem] mb-6">
            <Button
              form="update-service"
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Salvar
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}