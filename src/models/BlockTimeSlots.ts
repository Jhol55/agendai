import { z } from "zod"

export interface BlockTimeSlotsProps {
  id: string;
  freq?: "period" | "weekly"
  start: string
  end: string
  original_start: string
  original_end: string
  is_recurring: boolean
  day_of_week?: number
  description?: string
  blocked: boolean
  interval?: number;
}

export interface UpdatedBlockTimeSlotsProps {
  id: string;
  freq?: "period" | "weekly";
  start: Date;
  end: Date;
  is_recurring: boolean;
  day_of_week?: number;
  description?: string;
  blocked: boolean;
  interval?: number;
  original_start?: Date
  original_end?: Date
}



export const blockedTimesSchema = z.object({
  id: z.string(),
  freq: z.string().optional(),
  start: z.date({
    required_error: "Data e hora de início são obrigatórias",
  }).optional(),
  end: z.date({
    required_error: "Data e hora de fim são obrigatórias",
  }).optional(),
  original_start: z.date().optional(),
  original_end: z.date().optional(),
  is_recurring: z.boolean().default(false),
  blocked: z.boolean(),
  interval: z.number().optional(),
  day_of_week: z
    .number()
    .min(0, { message: "O dia da semana deve ser entre 0 (domingo) e 6 (sábado)" })
    .max(6, { message: "O dia da semana deve ser entre 0 (domingo) e 6 (sábado)" })
    .optional(),
  description: z.string().optional(),
})
  .superRefine((data, ctx) => {
    // Verifica se start está definido
    if (data.start === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['start'],
        message:
          data.freq === 'period'
            ? 'A data de início é obrigatória'
            : 'O horário de início é obrigatório',
      });
    }

    if (data.end === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['end'],
        message:
          data.freq === 'period'
            ? 'A data de fim é obrigatória'
            : 'O horário de fim é obrigatório',
      });
    }

    if (data.start && data.end && data.start >= data.end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['start'],
        message: 'A data de início deve ser anterior à data de fim',
      });
    }
  });
