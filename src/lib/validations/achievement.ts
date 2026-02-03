import { z } from "zod";

export const achievementFormSchema = z.object({
  title: z.string().min(1, "タイトルは必須です").max(100),
  description: z.string().min(1, "説明は必須です").max(2000),
  category: z.enum([
    "development",
    "review",
    "bugfix",
    "design",
    "documentation",
    "communication",
    "leadership",
  ]),
  technologies: z.string().default(""), // comma-separated, parsed on submit
  period: z
    .string()
    .regex(/^\d{4}-\d{2}(-\d{2})?$/, "YYYY-MM または YYYY-MM-DD 形式で入力してください")
    .or(z.literal(""))
    .default(""),
  projectId: z.string().uuid().nullable().default(null),
});

export type AchievementFormValues = z.infer<typeof achievementFormSchema>;
