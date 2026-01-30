import { NextResponse } from "next/server";
import { db } from "@/db";
import { achievements, projects } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const period = searchParams.get("period");
  const projectId = searchParams.get("projectId");

  const conditions = [eq(achievements.userId, userId)];
  if (category) conditions.push(eq(achievements.category, category));
  if (period) conditions.push(eq(achievements.period, period));
  if (projectId) conditions.push(eq(achievements.projectId, projectId));

  const result = await db
    .select({
      id: achievements.id,
      title: achievements.title,
      description: achievements.description,
      category: achievements.category,
      technologies: achievements.technologies,
      period: achievements.period,
      projectId: achievements.projectId,
      projectName: projects.name,
      sortOrder: achievements.sortOrder,
      createdAt: achievements.createdAt,
    })
    .from(achievements)
    .leftJoin(projects, eq(achievements.projectId, projects.id))
    .where(and(...conditions))
    .orderBy(achievements.sortOrder, desc(achievements.createdAt));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const body = await request.json();

  const technologies = body.technologies
    ? body.technologies
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean)
    : [];

  const [achievement] = await db
    .insert(achievements)
    .values({
      userId,
      title: body.title,
      description: body.description,
      category: body.category,
      technologies,
      period: body.period || null,
      projectId: body.projectId || null,
    })
    .returning();

  return NextResponse.json(achievement);
}
