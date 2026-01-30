import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, achievements } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const result = await db
    .select({
      id: projects.id,
      name: projects.name,
      company: projects.company,
      startDate: projects.startDate,
      endDate: projects.endDate,
      description: projects.description,
      role: projects.role,
      teamSize: projects.teamSize,
      createdAt: projects.createdAt,
      achievementCount: sql<number>`count(${achievements.id})::int`,
    })
    .from(projects)
    .leftJoin(achievements, eq(achievements.projectId, projects.id))
    .where(eq(projects.userId, userId))
    .groupBy(projects.id)
    .orderBy(desc(projects.createdAt));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const body = await request.json();

  const [project] = await db
    .insert(projects)
    .values({
      userId,
      name: body.name,
      company: body.company || null,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      description: body.description || null,
      role: body.role || null,
      teamSize: body.teamSize || null,
    })
    .returning();

  return NextResponse.json(project);
}
