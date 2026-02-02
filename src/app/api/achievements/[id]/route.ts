import { NextResponse } from "next/server";
import { db } from "@/db";
import { achievements } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.category !== undefined) updateData.category = body.category;
  if (body.period !== undefined) updateData.period = body.period || null;
  if (body.projectId !== undefined) updateData.projectId = body.projectId || null;
  if (body.technologies !== undefined) {
    updateData.technologies =
      typeof body.technologies === "string"
        ? body.technologies
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean)
        : body.technologies;
  }

  const [updated] = await db
    .update(achievements)
    .set(updateData)
    .where(and(eq(achievements.id, id), eq(achievements.userId, userId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "実績が見つかりません" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { id } = await params;

  const [deleted] = await db
    .delete(achievements)
    .where(and(eq(achievements.id, id), eq(achievements.userId, userId)))
    .returning({ id: achievements.id });

  if (!deleted) {
    return NextResponse.json({ error: "実績が見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
