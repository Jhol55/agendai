import { z } from "zod";

// --- O que já existe (interfaces e AddCalendarProps permanecem) ---
interface DayProps {
  start: Date | undefined;
  end: Date | undefined;
  closed?: boolean;
}

export interface AddCalendarProps {
  calendar: {
    id: number | string;
    name: string;
    description: string;
  };
  agentOrTeam: {
    id: string;
    type: string;
  };
  services: { id: string | number }[];
  operatingHours: {
    sunday: DayProps;
    monday: DayProps;
    tuesday: DayProps;
    wednesday: DayProps;
    thursday: DayProps;
    friday: DayProps;
    saturday: DayProps;
  };
  settings: {
    tax: string,
    rescheduleDeadlineValue: string,
    rescheduleDeadlineUnit: string,
    paymentDeadlineValue: string,
    taxDeadlineValue: string
  }
}

// --- Modificação no daySchema para corrigir o erro de ZodEffects ---

// Schema para um dia fechado: 'closed' é true, 'start' e 'end' são opcionais.
const closedDaySchemaPart = z.object({
  closed: z.literal(true),
  // Permite undefined ou null para start/end quando fechado
  start: z.date().optional().or(z.null()),
  end: z.date().optional().or(z.null()),
});

// Schema para um dia aberto: 'closed' é false ou ausente, 'start' e 'end' são obrigatórios.
const openDaySchemaPart = z.object({
  closed: z.literal(false).optional(),
  start: z.date({ required_error: "O horário de início é obrigatório" }),
  end: z.date({ required_error: "O horário de fim é obrigatório" }),
});

// daySchema é a união discriminada.
// IMPORTANTE: O refine é aplicado AO RESULTADO da união,
// porque o refine transforma o schema em ZodEffects, que não é aceito diretamente pela união discriminada.
export const daySchema = z.discriminatedUnion("closed", [
  closedDaySchemaPart,
  openDaySchemaPart,
])
  .superRefine((data, ctx) => {
    // Se o dia não estiver fechado (ou 'closed' for false/undefined),
    // e se start e end existirem, valide que end é depois de start.
    // Usamos superRefine para validações que dependem de múltiplas propriedades ou lógica complexa.
    if (data.closed !== true) { // Implies an 'open' day
      if (data.start && data.end) {
        if (data.end <= data.start) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "O horário de fim deve ser depois do horário de início",
            path: ["end"], // Aponta o erro para o campo 'end'
          });
        }
      }
      // Adiciona validação de preenchimento de start/end se não estiver fechado
      // Embora o openDaySchemaPart já tenha required_error, isso captura casos como:
      // { closed: false, start: Date, end: undefined } que ainda seriam um problema.
      if (!data.start && data.end) { // If end exists but start doesn't for an open day
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O horário de início é obrigatório",
          path: ["start"],
        });
      }
      if (data.start && !data.end) { // If start exists but end doesn't for an open day
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O horário de fim é obrigatório",
          path: ["end"],
        });
      }
    }
  });


// --- O AddCalendarSchema permanece o mesmo, pois daySchema foi atualizado ---
export const AddCalendarSchema = z.object({
  calendar: z.object({
    id: z.number().optional(),
    name: z.string().min(1, "O nome do calendário é obrigatório"),
    description: z.string(),
  }),
  agentOrTeam: z.object({
    id: z.string().min(1, "É obrigatório selecionar um agente ou time"),
    type: z.string(),
  }),
  services: z
  .array(
    z.object({
      id: z.preprocess(
        (val) => String(val),
        z.string().min(1, "O ID do serviço não pode ser vazio.")
      ),
    })
  )
  .min(1, "É obrigatório adicionar pelo menos um serviço."),
  operatingHours: z.object({
    sunday: daySchema,
    monday: daySchema,
    tuesday: daySchema,
    wednesday: daySchema,
    thursday: daySchema,
    friday: daySchema,
    saturday: daySchema,
  }),
  settings: z.object({
  tax: z.string().optional().default("0"),
  rescheduleDeadlineValue: z.string({ required_error: "O valor do prazo para reagendamento é obrigatório." }),
  rescheduleDeadlineUnit: z.string({ required_error: "A unidade do prazo para reagendamento é obrigatória." }),
  paymentDeadlineValue: z.string({ required_error: "O valor do prazo para pagamento é obrigatório." }),
  taxDeadlineValue: z.string({ required_error: "O valor do prazo para imposto é obrigatório." })
  })
});