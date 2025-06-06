import React from 'react';
import { useFormContext, FieldPath } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { TimePicker } from "../ui/time-picker";
import { Checkbox } from "../ui/checkbox";
import { AddCalendarProps } from "./models/AddCalendar";
import { FormFieldConfig, CustomFieldConfig, TextAreaFieldConfig, InputFieldConfig, SelectFieldConfig, DayHoursFieldConfig } from './types';

interface FormStepsProps {
  fields: FormFieldConfig[];
}

export const FormSteps: React.FC<FormStepsProps> = ({
  fields,
}) => {
  const form = useFormContext<AddCalendarProps>();

  const commonFieldProps = (fieldValue: unknown, inputClassName: string) => ({
    className: cn(
      "dark:focus:ring-skyblue dark:focus:ring-1 focus:ring-skyblue focus:ring-1 h-10",
      fieldValue !== undefined && fieldValue !== null && "dark:!text-neutral-200 !text-neutral-700",
      inputClassName
    ),
    autoComplete: "off",
  });

  return (
    <>
      {fields.map((fieldConfig) => {
        if (!fieldConfig.type) return;

        if (fieldConfig.type === "custom") {
          const customField = fieldConfig as CustomFieldConfig;
        
          return (
            <div key={customField.name as string}>
              {typeof customField.component === "function"
                ? customField.component()
                : customField.component}
            </div>
          );
        }

        if (fieldConfig.type === "dayHours") {
          const dayConfig = fieldConfig as DayHoursFieldConfig;
          // dayPath is like "operatingHours.sunday"
          const dayPath = dayConfig.name;
          const dayLabel = dayConfig.label;

          return (
            <div
              key={dayConfig.name}
              className="relative flex sm:flex-row flex-col w-full gap-4 sm:items-end"
            >
              <FormField
                control={form.control}
                // Correctly define the path for nested properties using template literals
                // and casting to FieldPath<AddCalendarProps> for react-hook-form compatibility
                name={`${dayPath}.start` as FieldPath<AddCalendarProps>}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-left">{dayLabel}</FormLabel>
                    <FormControl>
                      <TimePicker
                        {...commonFieldProps(field.value, dayConfig.className || "")}
                        placeholder="Início"
                        mode="time"
                        value={field.value instanceof Date ? field.value : undefined}
                        onChange={(date) => field.onChange(date)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                // Same correction for the 'end' property
                name={`${dayPath}.end` as FieldPath<AddCalendarProps>}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-left"></FormLabel>
                    <FormControl>
                      <TimePicker
                        {...commonFieldProps(field.value, dayConfig.className || "")}
                        placeholder="Fim"
                        mode="time"
                        value={field.value instanceof Date ? field.value : undefined}
                        onChange={(date) => field.onChange(date)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="absolute top-0 right-0">
                <FormField
                  control={form.control}
                  // Same correction for the 'closed' property
                  name={`${dayPath}.closed` as FieldPath<AddCalendarProps>}
                  render={({ field }) => (
                    <FormItem className="flex w-full gap-2 items-center">
                      <FormControl>
                        <Checkbox
                          checked={field.value as boolean}
                          onCheckedChange={(checked: boolean) => field.onChange(checked)}
                        />
                      </FormControl>
                      <FormLabel className="text-left !mt-[1px]">Fechado</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          );
        }

        if (fieldConfig.type === "select") {
          const selectField = fieldConfig as SelectFieldConfig;
          const SelectComponent = selectField.component as React.ElementType;

          return (
            <FormField
              key={selectField.name as string}
              control={form.control}
              name={selectField.name}
              render={({ field }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel className="text-left">{selectField.label}</FormLabel>
                  <FormControl>
                    <SelectComponent
                      {...commonFieldProps(field.value, selectField.className || "")}
                      placeholder={selectField.placeholder}
                      value={field.value as string | undefined}
                      src={selectField.src}
                      onSelect={(value: string) => {
                        field.onChange(value);
                        form.clearErrors(selectField.name);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        }

        if (fieldConfig.type === "textarea") {
          const textAreaField = fieldConfig as TextAreaFieldConfig;
          const TextAreaComponent = textAreaField.component as React.ElementType;

          return (
            <FormField
              key={textAreaField.name as string} // Explicitly cast name for key prop
              control={form.control}
              name={textAreaField.name}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-left">{textAreaField.label}</FormLabel>
                  <FormControl>
                    <TextAreaComponent
                      {...commonFieldProps(field.value, textAreaField.className || "")}
                      placeholder={textAreaField.placeholder}
                      value={field.value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        field.onChange(e.target.value)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        }
        const inputField = fieldConfig as InputFieldConfig;
        const InputComponent = inputField.component as React.ElementType;

        return (
          <FormField
            key={inputField.name as string} // Explicitly cast name for key prop
            control={form.control}
            name={inputField.name}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-left">{inputField.label}</FormLabel>
                <FormControl>
                  <InputComponent
                    {...commonFieldProps(field.value, inputField.className || "")}
                    placeholder={inputField.placeholder}
                    value={field.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      field.onChange(e.target.value)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      })}
    </>
  );
};