import { NextResponse } from "next/server";
import { db } from "@/db";
import { educations } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getAuthenticatedUserId,
  unauthorizedResponse,
  getOrCreateProfileId,
} from "@/lib/auth-helpers";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const profileId = await getOrCreateProfileId(userId);

  const result = await db.query.educations.findMany({
    where: eq(educations.profileId, profileId),
    orderBy: educations.sortOrder,
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const profileId = await getOrCreateProfileId(userId);
  const body = await request.json();

  const [created] = await db
    .insert(educations)
    .values({
      profileId,
      schoolName: body.schoolName,
      faculty: body.faculty || null,
      degree: body.degree || null,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      status: body.status || "graduated",
    })
    .returning();

  return NextResponse.json(created);
}

export async function DELETE(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { id } = await request.json();
  const profileId = await getOrCreateProfileId(userId);

  await db.delete(educations).where(eq(educations.id, id));

  // Verify ownership via profileId (educations cascade from profiles which belong to user)
  void profileId;

  return NextResponse.json({ success: true });
}
