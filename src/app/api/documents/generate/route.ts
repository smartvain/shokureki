import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  achievements,
  projects,
  profiles,
  skills,
  workHistories,
  generatedDocuments,
} from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { generateResume } from "@/services/resume/generator";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const body = await request.json();
  const { format, achievementIds, targetCompany, targetPosition } = body;

  if (!format || !achievementIds?.length) {
    return NextResponse.json({ error: "フォーマットと実績を選択してください" }, { status: 400 });
  }

  // Fetch user's profile
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  if (!profile || !profile.lastName) {
    return NextResponse.json({ error: "先にプロフィールを登録してください" }, { status: 400 });
  }

  // Fetch selected achievements with project names
  const selectedAchievements = await db
    .select({
      title: achievements.title,
      description: achievements.description,
      category: achievements.category,
      technologies: achievements.technologies,
      period: achievements.period,
      projectName: projects.name,
    })
    .from(achievements)
    .leftJoin(projects, eq(achievements.projectId, projects.id))
    .where(and(eq(achievements.userId, userId), inArray(achievements.id, achievementIds)));

  // Fetch user's skills
  const userSkills = await db.query.skills.findMany({
    where: eq(skills.profileId, profile.id),
  });

  // Fetch user's work histories
  const userWorkHistories = await db.query.workHistories.findMany({
    where: eq(workHistories.profileId, profile.id),
  });

  // Generate resume via AI
  try {
    const content = await generateResume({
      format,
      profile: {
        lastName: profile.lastName,
        firstName: profile.firstName,
        summary: profile.summary,
        selfIntroduction: profile.selfIntroduction,
      },
      workHistories: userWorkHistories.map((wh) => ({
        companyName: wh.companyName,
        companyDescription: wh.companyDescription,
        employmentType: wh.employmentType,
        position: wh.position,
        department: wh.department,
        startDate: wh.startDate,
        endDate: wh.endDate,
        isCurrent: wh.isCurrent,
        responsibilities: wh.responsibilities,
      })),
      achievements: selectedAchievements.map((a) => ({
        title: a.title,
        description: a.description,
        category: a.category,
        technologies: a.technologies,
        period: a.period,
        projectName: a.projectName,
      })),
      skills: userSkills.map((s) => ({
        category: s.category,
        name: s.name,
        level: s.level,
        yearsOfExperience: s.yearsOfExperience,
      })),
      targetCompany: targetCompany || undefined,
      targetPosition: targetPosition || undefined,
    });

    // Save to database
    const title = targetCompany ? `職務経歴書 - ${targetCompany}` : "職務経歴書";

    const [doc] = await db
      .insert(generatedDocuments)
      .values({
        userId,
        type: "shokumukeirekisho",
        title,
        format,
        content,
        targetCompany: targetCompany || null,
        targetPosition: targetPosition || null,
        status: "draft",
      })
      .returning();

    return NextResponse.json(doc);
  } catch (error) {
    return NextResponse.json(
      {
        error: "AI生成に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
