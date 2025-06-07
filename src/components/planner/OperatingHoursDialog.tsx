"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TimePicker } from "@/components/ui/time-picker";
import { OperatingHoursProps, operatingHoursSchema } from "@/models/OperatingHours";
import { Typography } from "../ui/typography";
import { Checkbox } from "../ui/checkbox";
import { useState, useEffect, forwardRef, useCallback } from "react";
import { getOperatingHours, updateOperatingHours } from "@/services/operatingHours";
import { z } from "zod";
// import { BlockTimeSlotsDialog } from "./BlockTimeSlotsDialog";
import { Loading } from "../ui/loading/loading";
import { usePlannerData } from "@/contexts/planner/PlannerDataContext";

type daysOfWeekType = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"

export const OperatingHoursDialog = forwardRef<HTMLDivElement, { onClose?: () => void, onClick?: () => void }>(
  ({ onClose, onClick }, ref) => {
    const [isOpened, setIsOpened] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { handleUpdate } = usePlannerData();

    const handleDialogToggle = useCallback((open: boolean) => {
      setIsOpened(open);
      if (!open) {
        onClose?.()
      }
    }, [onClose]);

    const form = useForm<OperatingHoursProps>({
      resolver: zodResolver(operatingHoursSchema),
      defaultValues: {
        sunday: {},
        monday: {},
        tuesday: {},
        wednesday: {},
        thursday: {},
        friday: {},
        saturday: {},
      },
    });


    useEffect(() => {
      getOperatingHours({}).then((data) => {
        const daysOfWeek: daysOfWeekType[] = [
          "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
        ];

        data.map((day: { day_of_week: number, start_time: string, end_time: string, closed: boolean }, index: number) => {
          form.setValue(`${daysOfWeek[index]}.start`, day.start_time ? new Date(day.start_time) : null);
          form.setValue(`${daysOfWeek[index]}.end`, day.end_time ? new Date(day.end_time) : null);
          form.setValue(`${daysOfWeek[index]}.closed`, day.closed);
        });
        setIsLoading(false);
      });
    }, [form])

    const [days, setDays] = useState<{
      name: daysOfWeekType,
      label: string,
      pickerOpen: {
        start: boolean,
        end: boolean
      }
    }[]>([
      { name: "sunday", label: "Domingo", pickerOpen: { start: false, end: false } },
      { name: "monday", label: "Segunda-feira", pickerOpen: { start: false, end: false } },
      { name: "tuesday", label: "Terça-feira", pickerOpen: { start: false, end: false } },
      { name: "wednesday", label: "Quarta-feira", pickerOpen: { start: false, end: false } },
      { name: "thursday", label: "Quinta-feira", pickerOpen: { start: false, end: false } },
      { name: "friday", label: "Sexta-feira", pickerOpen: { start: false, end: false } },
      { name: "saturday", label: "Sábado", pickerOpen: { start: false, end: false } },
    ]);

    const toggleOpenPicker = useCallback(
      (dayName: daysOfWeekType, type: "start" | "end") => {
        setDays((prevDays) =>
          prevDays.map((day) =>
            day.name === dayName
              ? {
                ...day,
                pickerOpen: {
                  ...day.pickerOpen,
                  [type]: !day.pickerOpen[type],
                },
              }
              : day
          )
        );
      },
      []
    );

    useEffect(() => {
      if (!isOpened) {
        setDays([
          { name: "sunday", label: "Domingo", pickerOpen: { start: false, end: false } },
          { name: "monday", label: "Segunda-feira", pickerOpen: { start: false, end: false } },
          { name: "tuesday", label: "Terça-feira", pickerOpen: { start: false, end: false } },
          { name: "wednesday", label: "Quarta-feira", pickerOpen: { start: false, end: false } },
          { name: "thursday", label: "Quinta-feira", pickerOpen: { start: false, end: false } },
          { name: "friday", label: "Sexta-feira", pickerOpen: { start: false, end: false } },
          { name: "saturday", label: "Sábado", pickerOpen: { start: false, end: false } },
        ]);
        form.reset();
      }
    }, [form, isOpened]);

    const onSubmit = useCallback((values: z.infer<typeof operatingHoursSchema>) => {
      updateOperatingHours({ data: values }).then(() => {
        setTimeout(() => {
          handleUpdate();
        }, 1000)
      });
      setTimeout(() => {
        form.clearErrors();
        handleDialogToggle(false);
      }, 1000);
    }, [form, handleDialogToggle, handleUpdate])

    return (
      <Dialog open={isOpened} onOpenChange={handleDialogToggle} >
        <DialogTrigger asChild>
          <Button
            className="w-full"
            variant="ghost"
            onClick={onClick}
          >
            <Typography variant="span">
              Horários de funcionamento
            </Typography>
          </Button>
        </DialogTrigger>
        <DialogContent
          className="max-w-[90vw] md:max-w-[36rem] max-h-[95vh] h-screen rounded-md overflow-hidden !p-0 bg-neutral-50 dark:bg-neutral-900"
          aria-describedby={undefined}
          onInteractOutside={(e) => {
            e.preventDefault();
            if (days.every((day) => !day.pickerOpen.start && !day.pickerOpen.end)) {
              handleDialogToggle(false)
            }
          }}
        >
          <DialogHeader className="mb-2 px-[1.5rem] pt-[1.5rem]">
            <DialogTitle>Horários de funcionamento</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form id="operating-hours" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:max-h-[75vh] max-h-[65vh] overflow-auto px-[1.5rem] pb-[1.5rem]">
              {!isLoading ? days.map((day) => (
                <section
                  key={day.name}
                  className="flex flex-col w-full justify-center"
                >
                  <div className="flex justify-between items-center">
                    <Typography variant="span">{day.label}</Typography>
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`${day.name}.closed`}
                        render={({ field }) => (
                          <FormItem className="flex w-full gap-2 items-center">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked: boolean) => {
                                  field.onChange(checked);
                                  form.setValue(`${day.name}.closed`, checked);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-left !mt-[1px]">Fechado</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex w-full gap-4">
                    <FormField
                      control={form.control}
                      name={`${day.name}.start`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                          <FormLabel className="text-left hidden">Início</FormLabel>
                          <FormControl>
                            <TimePicker
                              className="dark:bg-neutral-900 dark:hover:bg-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:!text-neutral-200"
                              open={day.pickerOpen.start}
                              onOpenChange={() => toggleOpenPicker(day.name, "start")}
                              mode="time"
                              placeholder="Início"
                              onChange={(date) => {
                                field.onChange(date);
                              }}
                              disabled={form.watch(`${day.name}.closed`)}
                              value={field.value ?? undefined}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`${day.name}.end`}
                      render={({ field }) => (
                        <FormItem className="flex flex-col w-full">
                          <FormLabel className="text-left hidden">Fim</FormLabel>
                          <FormControl>
                            <TimePicker
                              className="dark:bg-neutral-900 dark:hover:bg-neutral-800 bg-neutral-100 hover:bg-neutral-200 dark:!text-neutral-200"
                              open={day.pickerOpen.end}
                              onOpenChange={() => toggleOpenPicker(day.name, "end")}
                              mode="time"
                              placeholder="Fim"
                              onChange={(date) => {
                                field.onChange(date);
                              }}
                              disabled={form.watch(`${day.name}.closed`)}
                              value={field.value ?? undefined}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              )) :
                <div className="flex w-full justify-center items-center max-h-[70vh]">
                  <div className="flex items-center justify-center w-full h-[60vh]">
                    <Loading display={isLoading} />
                  </div>
                </div>
              }
            </form>
            {!isLoading &&
              <DialogFooter className="pr-[2.4rem] pl-6 mb-6 w-full">
                <div className="flex justify-between w-full">
                  {/* <BlockTimeSlotsDialog /> */}
                  <Button form="operating-hours" type="submit" className="bg-green-500 hover:bg-green-600 text-white">Salvar</Button>
                </div>
              </DialogFooter>}
          </Form>
        </DialogContent>
      </Dialog>
    )
  })

OperatingHoursDialog.displayName = "OperatingHoursDialog"