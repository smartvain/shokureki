import { NextResponse } from "next/server";
import { db } from "@/db";
import { workHistories, profiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";

async function getProfileId(userId: string): Promise<string | null> {
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    columns: { id: true },
  });
  return profile?.id ?? null;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const profileId = await getProfileId(userId);
  if (!profileId) {
    return NextResponse.json({ error: "プロフィールが見つかりません" }, { status: 404 });
  }

  const { id } = await params;
  const body = await request.json();

  const [updated] = await db
    .update(workHistories)
    .set({
      companyName: body.companyName,
      companyDescription: body.companyDescription || null,
      employmentType: body.employmentType || null,
      position: body.position || null,
      department: body.department || null,
      startDate: body.startDate,
      endDate: body.isCurrent ? null : body.endDate || null,
      isCurrent: body.isCurrent || false,
      responsibilities: body.responsibilities || null,
      updatedAt: new Date(),
    })
    .where(and(eq(workHistories.id, id), eq(workHistories.profileId, profileId)))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "職務経歴が見つかりません" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const profileId = await getProfileId(userId);
  if (!profileId) {
    return NextResponse.json({ error: "プロフィールが見つかりません" }, { status: 404 });
  }

  const { id } = await params;

  const [deleted] = await db
    .delete(workHistories)
    .where(and(eq(workHistories.id, id), eq(workHistories.profileId, profileId)))
    .returning({ id: workHistories.id });

  if (!deleted) {
    return NextResponse.json({ error: "職務経歴が見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
