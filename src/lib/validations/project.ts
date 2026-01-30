import { z } from "zod";

export const projectFormSchema = z.object({
  name: z.string().min(1, "プロジェクト名は必須です").max(200),
  company: z.string().max(200).default(""),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "YYYY-MM形式で入力してください")
    .or(z.literal(""))
    .default(""),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "YYYY-MM形式で入力してください")
    .or(z.literal(""))
    .default(""),
  description: z.string().max(5000).default(""),
  role: z.string().max(200).default(""),
  teamSize: z.string().max(50).default(""),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
