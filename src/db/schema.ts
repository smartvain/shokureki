import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  json,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// Users - NextAuth管理
// ============================================================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

// ============================================================
// Service Connections - 外部サービス接続設定
// ============================================================
export const serviceConnections = pgTable("service_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  service: text("service").notNull(), // "github" | "jira" | "linear"
  label: text("label").notNull(),
  encryptedConfig: text("encrypted_config").notNull(), // AES-256-GCM encrypted JSON
  status: text("status").notNull().default("active"), // "active" | "inactive" | "error"
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// Daily Digests - 日次ダイジェスト
// ============================================================
export const dailyDigests = pgTable(
  "daily_digests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD
    activityCount: integer("activity_count").notNull().default(0),
    summaryText: text("summary_text"),
    repoSummaries: json("repo_summaries").$type<{ repoRole: string; summary: string }[]>(),
    status: text("status").notNull().default("collecting"), // "collecting" | "summarizing" | "ready" | "reviewed"
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("daily_digests_user_date_idx").on(table.userId, table.date)]
);

// ============================================================
// Achievement Candidates - AI生成の実績候補
// ============================================================
export const achievementCandidates = pgTable("achievement_candidates", {
  id: uuid("id").primaryKey().defaultRandom(),
  digestId: uuid("digest_id")
    .notNull()
    .references(() => dailyDigests.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "development" | "review" | "bugfix" | "design" | "documentation" | "communication" | "leadership"
  repoRole: text("repo_role"),
  technologies: json("technologies").$type<string[]>().default([]),
  significance: text("significance").notNull().default("medium"), // "high" | "medium" | "low"
  status: text("status").notNull().default("pending"), // "pending" | "accepted" | "rejected" | "edited"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================================
// Projects - プロジェクト
// ============================================================
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  company: text("company"),
  startDate: text("start_date"), // YYYY-MM
  endDate: text("end_date"), // YYYY-MM or null
  description: text("description"),
  role: text("role"),
  teamSize: text("team_size"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// Achievements - 確定した実績
// ============================================================
export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  candidateId: uuid("candidate_id").references(() => achievementCandidates.id),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  technologies: json("technologies").$type<string[]>().default([]),
  period: text("period"), // "2026-01" or date range
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// Profiles - 個人情報
// ============================================================
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  lastName: text("last_name").notNull().default(""),
  firstName: text("first_name").notNull().default(""),
  lastNameKana: text("last_name_kana"),
  firstNameKana: text("first_name_kana"),
  birthDate: text("birth_date"),
  gender: text("gender"),
  email: text("email"),
  phone: text("phone"),
  postalCode: text("postal_code"),
  address: text("address"),
  selfIntroduction: text("self_introduction"),
  summary: text("summary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// Educations - 学歴
// ============================================================
export const educations = pgTable("educations", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  schoolName: text("school_name").notNull(),
  faculty: text("faculty"),
  degree: text("degree"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  status: text("status").notNull().default("graduated"), // graduated, enrolled, withdrawn, expected
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// Certifications - 免許・資格
// ============================================================
export const certifications = pgTable("certifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  issuingOrganization: text("issuing_organization"),
  acquiredDate: text("acquired_date"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// Skills - スキル・技術
// ============================================================
export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  category: text("category").notNull(), // 言語, フレームワーク, ツール, etc.
  name: text("name").notNull(),
  level: text("level"), // 初級, 中級, 上級, エキスパート
  yearsOfExperience: integer("years_of_experience"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// Work Histories - 職務経歴
// ============================================================
export const workHistories = pgTable("work_histories", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  companyDescription: text("company_description"),
  employmentType: text("employment_type"), // 正社員, 契約社員, etc.
  position: text("position"),
  department: text("department"),
  startDate: text("start_date").notNull(), // YYYY-MM
  endDate: text("end_date"), // YYYY-MM or null
  isCurrent: boolean("is_current").default(false),
  responsibilities: text("responsibilities"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// Generated Documents - 生成書類
// ============================================================
export const generatedDocuments = pgTable("generated_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "shokumukeirekisho" | "rirekisho"
  title: text("title").notNull(),
  format: text("format").notNull(), // "reverse_chronological" | "chronological" | "career_based"
  content: json("content").notNull(), // Generated content as JSON
  targetCompany: text("target_company"),
  targetPosition: text("target_position"),
  version: integer("version").notNull().default(1),
  status: text("status").notNull().default("draft"), // "draft" | "finalized"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================
// Relations
// ============================================================
export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  profile: one(profiles),
  serviceConnections: many(serviceConnections),
  dailyDigests: many(dailyDigests),
  achievements: many(achievements),
  projects: many(projects),
  generatedDocuments: many(generatedDocuments),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
  educations: many(educations),
  certifications: many(certifications),
  skills: many(skills),
  workHistories: many(workHistories),
}));

export const dailyDigestsRelations = relations(dailyDigests, ({ one, many }) => ({
  user: one(users, { fields: [dailyDigests.userId], references: [users.id] }),
  candidates: many(achievementCandidates),
}));

export const achievementCandidatesRelations = relations(achievementCandidates, ({ one }) => ({
  digest: one(dailyDigests, {
    fields: [achievementCandidates.digestId],
    references: [dailyDigests.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, { fields: [achievements.userId], references: [users.id] }),
  candidate: one(achievementCandidates, {
    fields: [achievements.candidateId],
    references: [achievementCandidates.id],
  }),
  project: one(projects, {
    fields: [achievements.projectId],
    references: [projects.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  achievements: many(achievements),
}));

export const workHistoriesRelations = relations(workHistories, ({ one }) => ({
  profile: one(profiles, {
    fields: [workHistories.profileId],
    references: [profiles.id],
  }),
}));

export const educationsRelations = relations(educations, ({ one }) => ({
  profile: one(profiles, {
    fields: [educations.profileId],
    references: [profiles.id],
  }),
}));

export const certificationsRelations = relations(certifications, ({ one }) => ({
  profile: one(profiles, {
    fields: [certifications.profileId],
    references: [profiles.id],
  }),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  profile: one(profiles, {
    fields: [skills.profileId],
    references: [profiles.id],
  }),
}));
