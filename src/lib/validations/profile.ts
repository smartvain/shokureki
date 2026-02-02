import { z } from "zod";

export const profileFormSchema = z.object({
  lastName: z.string().min(1, "姓は必須です").max(50),
  firstName: z.string().min(1, "名は必須です").max(50),
  lastNameKana: z.string().max(50).default(""),
  firstNameKana: z.string().max(50).default(""),
  birthDate: z.string().default(""),
  gender: z.string().default(""),
  email: z.string().email("有効なメールアドレスを入力してください").or(z.literal("")).default(""),
  phone: z.string().max(20).default(""),
  postalCode: z
    .string()
    .regex(/^\d{3}-?\d{4}$/, "正しい郵便番号を入力してください")
    .or(z.literal(""))
    .default(""),
  address: z.string().max(500).default(""),
  selfIntroduction: z.string().max(5000).default(""),
  summary: z.string().max(5000).default(""),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const educationFormSchema = z.object({
  schoolName: z.string().min(1, "学校名は必須です").max(200),
  faculty: z.string().max(200).default(""),
  degree: z.string().max(100).default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  status: z.enum(["graduated", "enrolled", "withdrawn", "expected"]).default("graduated"),
});

export type EducationFormValues = z.infer<typeof educationFormSchema>;

export const certificationFormSchema = z.object({
  name: z.string().min(1, "資格名は必須です").max(200),
  issuingOrganization: z.string().max(200).default(""),
  acquiredDate: z.string().default(""),
});

export type CertificationFormValues = z.infer<typeof certificationFormSchema>;

export const skillFormSchema = z.object({
  category: z.string().min(1, "カテゴリは必須です").max(100),
  name: z.string().min(1, "スキル名は必須です").max(200),
  level: z.string().default(""),
  yearsOfExperience: z.coerce.number().int().min(0).max(50).nullable().default(null),
});

export type SkillFormValues = z.infer<typeof skillFormSchema>;
