import { z } from "zod";

export interface AdditionalSettingsProps {
  scheduling: {
    type: string
    value?: string | number | undefined
  }[]
}

export const AdditionalSettingsSchema = z.object({
  scheduling: z.array(
    z.object({
      value: z.union([z.string(), z.number()]).optional(),
    })
  ),
});