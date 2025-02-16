import { z } from "zod";

export interface Appointment {
  id: string;
  title: string;
  clientId: number;
  start: Date;
  end: Date;
  resourceId: string;
  order: number;
  status: string;
  details: {
    service: string;
    serviceId?: number | undefined;
    durationMinutes?: number;
    online: boolean;
    payments: {
      type: "service" | "fee";
      value?: number;
      status: "pending" | "received";
      sendPaymentLink: boolean;
    }[];
  }
}

export const updateAppointmentSchema = z.object({
  title: z.string().min(1, { message: "O nome do cliente é obrigatório" }),
  clientId: z.number(),
  start: z.date({
    required_error: "A data de início é obrigatória",
  }),
  end: z.date({
    required_error: "A data de fim é obrigatória",
  }),
  status: z.string(),
  details: z.object({
    service: z.string().min(1, { message: "O serviço é obrigatório" }),
    serviceId: z.number().optional(),
    durationMinutes: z.number().optional(),
    online: z.boolean(),
    payments: z.array(
      z.object({
        type: z.enum(["fee", "service"]),
        value: z.number().optional(),
        status: z.enum(["pending", "received"]),
        sendPaymentLink: z.boolean(),
      })
    ),
  }),
});


export const createAppointmentSchema = z.object({
  title: z.string().min(1, { message: "O nome do cliente é obrigatório" }),
  clientId: z.number(),
  start: z.date({
    required_error: "A data de início é obrigatória",
  }),
  end: z.date({
    required_error: "A data de fim é obrigatória",
  }),
  resourceId: z.string()
    .min(1, { message: "Resource is required" }),
  status: z.string(),
  order: z.number().optional(),
  details: z.object({
    service: z.string().min(1, { message: "O serviço é obrigatório" }),
    serviceId: z.number().optional(),
    durationMinutes: z.number().optional(),
    online: z.boolean(),
    payments: z.array(
      z.object({
        type: z.enum(["fee", "service"]),
        value: z.number().optional(),
        status: z.enum(["pending", "received"]),
        sendPaymentLink: z.boolean(),
      })
    ),
  })
})
  .refine((data) => data.end.getTime() >= data.start.getTime(), {
    message: "O horário de fim deve ser posterior ao horário de início",
    path: ["end"],
  })
