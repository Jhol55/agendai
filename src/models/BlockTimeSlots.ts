import { z } from "zod"

export const blockedTimesSchema = z.object({
  type: z.string().optional(),
  start: z.date({
    required_error: "Data e hora de início são obrigatórias",
  }).optional().nullable(),
  end: z.date({
    required_error: "Data e hora de fim são obrigatórias",
  }).optional().nullable(),
  is_recurring: z.boolean().default(false),
  day_of_week: z
    .number()
    .min(0, { message: "O dia da semana deve ser entre 0 (domingo) e 6 (sábado)" })
    .max(6, { message: "O dia da semana deve ser entre 0 (domingo) e 6 (sábado)" })
    .optional()
    .nullable(),
  description: z.string().optional(),
})
