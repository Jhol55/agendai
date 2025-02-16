import { z } from "zod";

export interface OperatingHoursProps {
  sunday: {
    start: Date | null;
    end: Date | null;
    closed?: boolean;
  },
  monday: {
    start: Date | null;
    end: Date | null;
    closed?: boolean;
  },
  tuesday: {
    start: Date | null;
    end: Date | null;
    closed?: boolean;
  },
  wednesday: {
    start: Date | null;
    end: Date | null;
    closed?: boolean;
  },
  thursday: {
    start: Date | null;
    end: Date | null;
    closed?: boolean;
  },
  friday: {
    start: Date | null;
    end: Date | null;
    closed?: boolean;
  },
  saturday: {
    start: Date | null;
    end: Date | null;
    closed?: boolean;
  },
}

const daySchema = z.object({
  start: z
    .date({ required_error: "O horário de início é obrigatório" })
    .or(z.null()),
  end: z
    .date({ required_error: "O horário de fim é obrigatório" })
    .or(z.null()),
  closed: z.boolean().optional(),
})


export const operatingHoursSchema = z.object({
  sunday: daySchema,
  monday: daySchema,
  tuesday: daySchema,
  wednesday: daySchema,
  thursday: daySchema,
  friday: daySchema,
  saturday: daySchema,
});