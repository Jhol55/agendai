import { z } from "zod";

export interface ServiceType {
    id?: string;
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    allowOnline: boolean;
    allowInPerson: boolean;
    active: boolean;
}

export const AddNewServiceSchema = z.object({
    name: z.string().min(1, ({ message: "O nome é obrigatório" })),
    description: z.string().min(1, ({ message: "A descrição é obrigatória" })),
    price: z.number({ required_error: "O preço é obrigatório" }),
    durationMinutes: z
        .number({ required_error: "O tempo de duração é obrigatório" })
        .min(1, ({ message: "O tempo de duração é obrigatório" })),
    allowOnline: z.boolean().optional(),
    allowInPerson: z.boolean().optional(),
    active: z.boolean(),
})
.refine(data => data.allowInPerson || data.allowOnline, {
    message: "Pelo menos uma opção deve ser selecionada",
    path: ["allowInPerson"]
})
.refine(data => data.allowInPerson || data.allowOnline, {
    message: "Pelo menos uma opção deve ser selecionada",
    path: ["allowOnline"]
})

export const updateServiceSchema = z.object({
    name: z.string().min(1, ({ message: "O nome é obrigatório" })),
    description: z.string().min(1, ({ message: "A descrição é obrigatória" })),
    price: z.number({ required_error: "O preço é obrigatório" }),
    durationMinutes: z
        .number({ required_error: "O tempo de duração é obrigatório" })
        .min(1, ({ message: "O tempo de duração é obrigatório" })),
    allowOnline: z.boolean().optional(),
    allowInPerson: z.boolean().optional(),
    active: z.boolean(),
})
.refine(data => data.allowInPerson || data.allowOnline, {
    message: "Pelo menos uma opção deve ser selecionada",
    path: ["allowInPerson"]
})
.refine(data => data.allowInPerson || data.allowOnline, {
    message: "Pelo menos uma opção deve ser selecionada",
    path: ["allowOnline"]
})