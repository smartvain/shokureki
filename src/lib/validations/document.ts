import { z } from "zod";

export const documentGenerateSchema = z.object({
  format: z.enum(["reverse_chronological", "chronological", "career_based"]),
  achievementIds: z.array(z.string().uuid()).min(1, "実績を1つ以上選択してください"),
  targetCompany: z.string().max(200).default(""),
  targetPosition: z.string().max(200).default(""),
});

export type DocumentGenerateValues = z.infer<typeof documentGenerateSchema>;
