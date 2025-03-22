import { z } from "zod";

export interface ServiceType {
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    allowOnline: boolean;
    allowInPerson: boolean;
    active: boolean;
}

export const AddNewServiceSchema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.number(),
    durationMinutes: z.number(),
    allowOnline: z.boolean(),
    allowInPerson: z.boolean(),
    active: z.boolean(),
})