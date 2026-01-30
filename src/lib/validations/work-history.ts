import { z } from "zod";

export const workHistoryFormSchema = z.object({
  companyName: z.string().min(1, "会社名は必須です").max(200),
  companyDescription: z.string().max(2000).default(""),
  employmentType: z.string().max(50).default(""),
  position: z.string().max(200).default(""),
  department: z.string().max(200).default(""),
  startDate: z.string().min(1, "開始年月は必須です").regex(/^\d{4}-\d{2}$/, "YYYY-MM形式で入力してください"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "YYYY-MM形式で入力してください")
    .or(z.literal(""))
    .default(""),
  isCurrent: z.boolean().default(false),
  responsibilities: z.string().max(5000).default(""),
});

export type WorkHistoryFormValues = z.infer<typeof workHistoryFormSchema>;
