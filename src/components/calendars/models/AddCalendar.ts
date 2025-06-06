import { z } from "zod";

interface DayProps {
  start: Date | undefined;
  end: Date | undefined;
  closed?: boolean;
}

export interface AddCalendarProps {
  calendar: {
    name: string;
    description: string;
  };
  agentOrTeam: {
    id: string;
    type: string;
  }
  operatingHours: {
    sunday: DayProps;
    monday: DayProps;
    tuesday: DayProps;
    wednesday: DayProps;
    thursday: DayProps;
    friday: DayProps;
    saturday: DayProps;
  };
}

const daySchema = z.object({
  start: z
    .date({ required_error: "O horário de início é obrigatório" }), 
  end: z
    .date({ required_error: "O horário de fim é obrigatório" }),
  closed: z.boolean().optional(),
});

export const AddCalendarSchema = z.object({
  calendar: z.object({
    name: z.string().min(1, "O nome do calendário é obrigatório"),
    description: z.string(),
  }),
  operatingHours: z.object({
    sunday: daySchema,
    monday: daySchema,
    tuesday: daySchema,
    wednesday: daySchema,
    thursday: daySchema,
    friday: daySchema,
    saturday: daySchema,
  }),
});