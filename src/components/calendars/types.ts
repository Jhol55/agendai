import { Path } from "react-hook-form";
import { AddCalendarProps } from "./models/AddCalendar";
import { InputProps } from '../ui/input';
import { TextAreaProps } from '../ui/text-area';
import { SelectProps } from '../ui/select/select';
import React from "react";

// New: A more specific ReactComponentType that can infer the ref type
// This type allows you to specify the element type (e.g., HTMLInputElement)
// that the component might be forwarding a ref to.
type ReactComponentType<P = NonNullable<unknown>, TElement = unknown> =
  | React.ComponentType<P>
  | React.ForwardRefExoticComponent<P & React.RefAttributes<TElement>>;

export type MaskType =
  | 'cpf'
  | 'cnpj'
  | 'phone'
  | 'currency'
  | 'date'
  | 'time'
  | 'number'
  | 'email'
  | 'tel'
  | 'url'
  | 'password'
  | 'text';

// Base interface for all form fields
export interface BaseFormField {
  name: Path<AddCalendarProps>;
  label?: React.ReactNode;
  placeholder?: string;
  className?: string;
  group?: string;
  mask?: MaskType;
}

export interface CustomFieldConfig extends BaseFormField {
  component: React.ReactNode | (() => React.ReactNode);
  type: "custom";
}

// Type for text input fields (Input, TextArea)
export interface InputFieldConfig extends BaseFormField {
  component: ReactComponentType<InputProps, HTMLInputElement>;
  type: "text";
}

export interface TextAreaFieldConfig extends BaseFormField {
  component: ReactComponentType<TextAreaProps, HTMLTextAreaElement>;
  type: "textarea";
}

// Type for the Select component
export interface SelectFieldConfig extends BaseFormField {
  // Assuming Select forwards ref to HTMLSelectElement (or similar)
  // Adjust 'HTMLSelectElement' if your Select component forwards to a different element
  component: ReactComponentType<SelectProps, HTMLSelectElement>;
  type: "select";
  src: {
    label: string;
    value: string;
  }[]
}

// Type for operating hours fields (groups start, end, and closed)
export interface DayHoursFieldConfig extends BaseFormField {
  type: "dayHours";
  name: Path<AddCalendarProps>;
}

// Union type for all possible form field configurations
export type FormFieldConfig =
  | CustomFieldConfig
  | InputFieldConfig
  | TextAreaFieldConfig
  | SelectFieldConfig
  | DayHoursFieldConfig;