// src/components/FormSteps/FormSteps.tsx
import React, { useMemo } from 'react';
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
import { FormFieldConfig, CustomFieldConfig, TextAreaFieldConfig, InputFieldConfig, SelectFieldConfig, DayHoursFieldConfig, MaskType } from './types';

import { applyMask, cleanValueByMask } from './masks'; 
import { Input } from "@/components/ui/input";

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

  const groupedFields = useMemo(() => {
    const groups: { [key: string]: FormFieldConfig[] } = {};
    const ungrouped: FormFieldConfig[] = [];

    fields.forEach(fieldConfig => {
      if (fieldConfig.group) {
        if (!groups[fieldConfig.group]) {
          groups[fieldConfig.group] = [];
        }
        groups[fieldConfig.group].push(fieldConfig);
      } else {
        ungrouped.push(fieldConfig);
      }
    });
    return { groups, ungrouped };
  }, [fields]);

  // Função auxiliar para determinar o 'type' HTML do input com base na prop 'mask'
  const getHtmlInputType = (maskType?: MaskType): React.HTMLInputTypeAttribute => {
    if (!maskType) return 'text'; 
    switch (maskType) {
      case 'number':
      case 'email':
      case 'tel':
      case 'url':
      case 'password':
        return maskType;
      case 'date': 
      case 'time':
      case 'cpf':
      case 'cnpj':
      case 'phone':
      case 'currency':
        return 'text'; 
      default:
        return 'text'; 
    }
  };

  const renderField = (fieldConfig: FormFieldConfig) => {
    if (!fieldConfig.type) return null;

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
      const dayPath = dayConfig.name;
      const dayLabel = dayConfig.label;

      return (
        <div
          key={dayConfig.name as string}
          className="relative flex sm:flex-row flex-col w-full gap-4 sm:items-end"
        >
          <FormField
            control={form.control}
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
                <FormMessage className='absolute' />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${dayPath}.end` as FieldPath<AddCalendarProps>}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <TimePicker
                    {...commonFieldProps(field.value, dayConfig.className || "")}
                    placeholder="Fim"
                    mode="time"
                    value={field.value instanceof Date ? field.value : undefined}
                    onChange={(date) => field.onChange(date)}
                  />
                </FormControl>
                <FormMessage className='absolute' />
              </FormItem>
            )}
          />
          <div className="absolute top-0 right-0">
            <FormField
              control={form.control}
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
          name={selectField.name as FieldPath<AddCalendarProps>}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-left">{selectField.label}</FormLabel>
              <FormControl>
                <SelectComponent
                  {...commonFieldProps(field.value, selectField.className || "")}
                  placeholder={selectField.placeholder}
                  value={field.value as string | undefined}
                  src={selectField.src}
                  onSelect={(value: string) => {
                    field.onChange(value);
                    form.clearErrors(selectField.name as FieldPath<AddCalendarProps>);
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
      const TextAreaComponent = textAreaField.component || Input; // Default to Input if no specific component provided

      return (
        <FormField
          key={textAreaField.name as string}
          control={form.control}
          name={textAreaField.name as FieldPath<AddCalendarProps>}
          render={({ field }) => {
            let displayValue: string | undefined = undefined;
            if (field.value !== undefined && field.value !== null) {
              displayValue = String(field.value);
            } else {
              displayValue = ''; 
            }

            return (
              <FormItem className="flex flex-col">
                <FormLabel className="text-left">{textAreaField.label}</FormLabel>
                <FormControl>
                  <TextAreaComponent
                    {...commonFieldProps(field.value, textAreaField.className || "")}
                    placeholder={textAreaField.placeholder}
                    value={displayValue}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      field.onChange(e.target.value)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      );
    }

    const inputField = fieldConfig as InputFieldConfig;
    const InputComponent = inputField.component || Input; // Usa Input do Shadcn UI como padrão

    return (
      <FormField
        key={inputField.name as string}
        control={form.control}
        name={inputField.name as FieldPath<AddCalendarProps>}
        render={({ field }) => {
          // Determine the value to display in the input
          let displayValue: string | number | readonly string[] | undefined = undefined;

          if (field.value !== undefined && field.value !== null) {
            // Check if the mask type is one that requires custom formatting
            const needsFormatting = ['cpf', 'cnpj', 'phone', 'currency', 'date', 'time'].includes(inputField.mask as string);

            if (needsFormatting) {
              displayValue = applyMask(String(field.value), inputField.mask);
            } else if (inputField.mask === 'number') {
              // If it's a number type, pass the numerical value directly if it's a number
              displayValue = typeof field.value === 'number' ? field.value : String(field.value);
            } else {
              // For other types ('text', 'email', etc.), just convert to string
              displayValue = String(field.value);
            }
          } else {
            displayValue = ''; // Ensure value is an empty string if undefined/null
          }

          return (
            <FormItem className="flex flex-col">
              <FormLabel className="text-left">{inputField.label}</FormLabel>
              <FormControl>
                <InputComponent
                  {...commonFieldProps(field.value, inputField.className || "")}
                  placeholder={inputField.placeholder}
                  value={displayValue} // Use o valor preparado
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const rawValue = e.target.value;
                    // Limpa o valor da máscara (se aplicável) e converte tipo (se 'number')
                    const cleanedValue = cleanValueByMask(rawValue, inputField.mask);
                    field.onChange(cleanedValue);
                  }}
                  // Define o tipo HTML do input com base na prop 'mask'
                  type={getHtmlInputType(inputField.mask)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  };

  return (
    <>
      {/* Render ungrouped fields first */}
      {groupedFields.ungrouped.map((fieldConfig) => renderField(fieldConfig))}

      {/* Render grouped fields */}
      {Object.entries(groupedFields.groups).map(([groupName, groupFields]) => (
        <div key={groupName} className={`flex w-full gap-2`}>
          {groupFields.map((fieldConfig) => renderField(fieldConfig))}
        </div>
      ))}
    </>
  );
};