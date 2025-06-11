import { z } from "zod";

export interface NewAppointment {
  id: string;
  title?: string;
  clientId?: number;
  start?: Date;
  end?: Date;
  original_start?: Date;
  original_end?: Date;
  resourceId: string;
  status: string;
  details: {
    service: string;
    serviceId?: number | undefined;
    durationMinutes?: number;
    online: boolean;
    payments: {
      id?: number | undefined;
      type: "service" | "fee";
      value?: number;
      status: "pending" | "received" | "refunded" | "confirmed";
      sendPaymentLink: boolean;
      billingType?: "credit_card" | "debit_card" | "cash" | "pix" | null;
      dueDate?: Date;
    }[];
  }
}

export interface Appointment {
  id: string;
  calendarId: string;
  title: string;
  clientId?: number;
  start: Date;
  end: Date;
  original_start?: Date;
  original_end?: Date;
  resourceId: string;
  status: string;
  details: {
    service: string;
    serviceId?: number | undefined;
    durationMinutes?: number;
    online: boolean;
    payments: {
      id?: number | undefined;
      type: "service" | "fee";
      value?: number;
      status: "pending" | "received" | "refunded" | "confirmed";
      sendPaymentLink: boolean;
      billingType?: "credit_card" | "debit_card" | "cash" | "pix" | null;
      dueDate: Date;
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
  original_start: z.date().optional(),
  original_end: z.date().optional(),
  status: z.string(),
  details: z.object({
    service: z.string().min(1, { message: "O serviço é obrigatório" }),
    serviceId: z.number().optional(),
    durationMinutes: z.number().optional(),
    online: z.boolean(),
    payments: z.array(
      z.object({
        id: z.number().optional(),
        type: z.enum(["fee", "service"]),
        value: z.number().optional(),
        status: z.enum(["pending", "received", "refunded", "confirmed"]),
        sendPaymentLink: z.boolean(),
        billingType: z.enum(["credit_card", "debit_card", "cash", "pix"]).nullable().optional(),
        dueDate: z.date()
      })
    ),
  }),
})
  .refine((data) => data.end.getTime() >= data.start.getTime(), {
    message: "O horário de fim deve ser posterior ao horário de início",
    path: ["end"],
  })
// .superRefine((data, ctx) => {
//   const payments = data.details.payments
//     .sort((a, b) => a.type.localeCompare(b.type))
//     .filter(payment => payment.status !== "refunded")

//   function findPaymentIndex(type: string) {
//     return payments
//       .findIndex(payment => payment.type === type);
//   }

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const index = findPaymentIndex("fee");
//   const payment = payments[index];

//   const dueDate = new Date(payment.dueDate);
//   dueDate.setHours(0, 0, 0, 0);

//   if (dueDate.getTime() < today.getTime()) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: "A data de vencimento deve ser igual ou posterior à data de hoje.",
//       path: ["details", "payments", "0", "dueDate"],
//     });
//   }

// })
// .refine((data) => {
//   const payments = data.details.payments
//     .sort((a, b) => a.type.localeCompare(b.type))
//     .filter(payment => payment.status !== "refunded")

//   function findPaymentIndex(type: string) {
//     return payments
//       .findIndex(payment => payment.type === type);
//   }

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const index = findPaymentIndex("service");
//   const payment = payments[index];

//   const dueDate = new Date(payment.dueDate);
//   dueDate.setHours(0, 0, 0, 0);

//   return dueDate.getTime() >= today.getTime();

// }, {
//   message: "A data de vencimento deve ser igual ou posterior à data de hoje.",
//   path: ["details", "payments", "1", "dueDate"],
// });


export const createAppointmentSchema = z.object({
  title: z.string().min(1, { message: "O nome do cliente é obrigatório" }),
  calendarId: z.string(),
  clientId: z.number().optional(),
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
        id: z.number().optional(),
        type: z.enum(["fee", "service"]),
        value: z.number().optional(),
        status: z.enum(["pending", "received", "refunded", "confirmed"]),
        sendPaymentLink: z.boolean(),
        billingType: z.enum(["credit_card", "debit_card", "cash", "pix"]).nullable().optional(),
        dueDate: z.date()
      })
    ),
  })
})
  .refine((data) => data.end.getTime() >= data.start.getTime(), {
    message: "O horário de fim deve ser posterior ao horário de início",
    path: ["end"],
  })
  .refine((data) => {
    function findPaymentIndex(type: string) {
      return data.details.payments
        .findIndex(payment => payment.type === type && payment.status !== "refunded");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const index = findPaymentIndex("fee");
    const payment = data.details.payments[index];

    const dueDate = new Date(payment.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate.getTime() >= today.getTime();

  }, {
    message: "A data de vencimento deve ser igual ou posterior à data de hoje.",
    path: ["details", "payments", "0", "dueDate"],
  })
  .refine((data) => {
    function findPaymentIndex(type: string) {
      return data.details.payments
        .slice()
        .sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
        .findIndex(payment => payment.type === type && payment.status !== "refunded");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const index = findPaymentIndex("service");
    const payment = data.details.payments[index];

    const dueDate = new Date(payment.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate.getTime() >= today.getTime();

  }, {
    message: "A data de vencimento deve ser igual ou posterior à data de hoje.",
    path: ["details", "payments", "1", "dueDate"],
  });
