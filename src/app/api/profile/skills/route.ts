import { NextResponse } from "next/server";
import { db } from "@/db";
import { skills } from "@/db/schema";
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

  const result = await db.query.skills.findMany({
    where: eq(skills.profileId, profileId),
    orderBy: skills.sortOrder,
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const profileId = await getOrCreateProfileId(userId);
  const body = await request.json();

  const [created] = await db
    .insert(skills)
    .values({
      profileId,
      category: body.category,
      name: body.name,
      level: body.level || null,
      yearsOfExperience: body.yearsOfExperience ?? null,
    })
    .returning();

  return NextResponse.json(created);
}

export async function DELETE(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { id } = await request.json();
  await db.delete(skills).where(eq(skills.id, id));

  return NextResponse.json({ success: true });
}
