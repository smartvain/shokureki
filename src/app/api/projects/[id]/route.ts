import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();

  const [updated] = await db
    .update(projects)
    .set({
      name: body.name,
      company: body.company || null,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      description: body.description || null,
      role: body.role || null,
      teamSize: body.teamSize || null,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "プロジェクトが見つかりません" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { id } = await params;

  const [deleted] = await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning({ id: projects.id });

  if (!deleted) {
    return NextResponse.json({ error: "プロジェクトが見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
