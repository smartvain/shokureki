import { NextResponse } from "next/server";
import { db } from "@/db";
import { certifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUserId, unauthorizedResponse, getOrCreateProfileId } from "@/lib/auth-helpers";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const profileId = await getOrCreateProfileId(userId);

  const result = await db.query.certifications.findMany({
    where: eq(certifications.profileId, profileId),
    orderBy: certifications.sortOrder,
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const profileId = await getOrCreateProfileId(userId);
  const body = await request.json();

  const [created] = await db
    .insert(certifications)
    .values({
      profileId,
      name: body.name,
      issuingOrganization: body.issuingOrganization || null,
      acquiredDate: body.acquiredDate || null,
    })
    .returning();

  return NextResponse.json(created);
}

export async function DELETE(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { id } = await request.json();
  await db.delete(certifications).where(eq(certifications.id, id));

  return NextResponse.json({ success: true });
}
