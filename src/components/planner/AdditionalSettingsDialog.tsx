import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";
import { forwardRef, useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdditionalSettingsProps, AdditionalSettingsSchema } from "@/models/AdditionalSettings";
import { z } from "zod";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { Input } from "../ui/input";
import { SettingsState } from "@/contexts/settings/SettingsContext.type";

export const AdditionalSettingsDialog = forwardRef<HTMLDivElement, object>((props, ref) => {
  const [isOpened, setIsOpened] = useState(false);
  const [isPending, startOnSubmitTransition] = useTransition();
  const { settings, updateSettings } = useSettings();

  const findIndex = ({ type, array = [] }: { type: string, array: { type: string }[] | undefined }): number => {
    return array.findIndex(item => item.type === type);
  };

  const form = useForm<AdditionalSettingsProps>({
    resolver: zodResolver(AdditionalSettingsSchema),
    defaultValues: {
      scheduling: [
        {
          type: "tax",
          value: settings?.scheduling[findIndex({ type: "tax", array: settings.scheduling })].value
        }
      ]
    },
  });

  useEffect(() => {
    form.reset({
      scheduling: [
        {
          type: "tax",
          value: settings?.scheduling[findIndex({ type: "tax", array: settings.scheduling })].value
        }
      ]
    })
  }, [form, settings])


  function onSubmit(values: z.infer<typeof AdditionalSettingsSchema>) {
    const newSettings: SettingsState = {
      scheduling: [
        {
          type: "tax",
          value: values.scheduling[findIndex({ type: "tax", array: settings?.scheduling })].value
        },
      ]
    };


    startOnSubmitTransition(() => {
      toast.promise(
        () =>
          new Promise((resolve) => {
            resolve(updateSettings({ data: newSettings }));
          }),
        {
          loading: "Adding appointment",
          success: "Appointment added",
          error: "Failed to add appointment",
        },
      );
      
    });
    setTimeout(() => {
      setIsOpened(false);
    }, 1000);
  }

  return (
    <Dialog open={isOpened} onOpenChange={setIsOpened}>
      <DialogTrigger asChild>
        <Button className="w-full" variant="outline">Configurações adicionais</Button>
      </DialogTrigger>
      {settings &&
        <DialogContent
          className="max-w-[90vw] md:max-w-[36rem] max-h-[90vh] rounded-md overflow-hidden !p-0"
          aria-describedby={undefined}
        >
          <DialogHeader className="mb-2 px-[1.5rem] pt-[1.5rem]">
            <DialogTitle>Configurações adicionais</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form id="update-settings" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-h-[70vh] overflow-auto px-[1.5rem] pb-[1.5rem]">
              <FormField
                control={form.control}
                name={`scheduling.${findIndex({ type: "tax", array: settings?.scheduling })}.value`}
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel className="text-left">Taxa de reserva</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
            <DialogFooter className="px-[1.5rem] mb-6">
              <Button form="update-settings" type="submit" className="bg-green-500 hover:bg-green-600 text-white">Salvar</Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      }
    </Dialog>
  )
})

AdditionalSettingsDialog.displayName = "AdditionalSettingsDialog"