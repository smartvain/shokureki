import { NextResponse } from "next/server";
import { db } from "@/db";
import { generatedDocuments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { id } = await params;

  const doc = await db.query.generatedDocuments.findFirst({
    where: and(
      eq(generatedDocuments.id, id),
      eq(generatedDocuments.userId, userId)
    ),
  });

  if (!doc) {
    return NextResponse.json({ error: "書類が見つかりません" }, { status: 404 });
  }

  return NextResponse.json(doc);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (body.title !== undefined) updateData.title = body.title;
  if (body.content !== undefined) updateData.content = body.content;
  if (body.status !== undefined) updateData.status = body.status;

  const [updated] = await db
    .update(generatedDocuments)
    .set(updateData)
    .where(
      and(eq(generatedDocuments.id, id), eq(generatedDocuments.userId, userId))
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "書類が見つかりません" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { id } = await params;

  const [deleted] = await db
    .delete(generatedDocuments)
    .where(
      and(eq(generatedDocuments.id, id), eq(generatedDocuments.userId, userId))
    )
    .returning({ id: generatedDocuments.id });

  if (!deleted) {
    return NextResponse.json({ error: "書類が見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
