import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });

  if (!profile) {
    return NextResponse.json({
      exists: false,
      lastName: "",
      firstName: "",
      lastNameKana: "",
      firstNameKana: "",
      birthDate: "",
      gender: "",
      email: "",
      phone: "",
      postalCode: "",
      address: "",
      selfIntroduction: "",
      summary: "",
    });
  }

  return NextResponse.json({ exists: true, ...profile });
}

export async function PUT(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const body = await request.json();

  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    columns: { id: true },
  });

  if (existing) {
    const [updated] = await db
      .update(profiles)
      .set({
        lastName: body.lastName,
        firstName: body.firstName,
        lastNameKana: body.lastNameKana || null,
        firstNameKana: body.firstNameKana || null,
        birthDate: body.birthDate || null,
        gender: body.gender || null,
        email: body.email || null,
        phone: body.phone || null,
        postalCode: body.postalCode || null,
        address: body.address || null,
        selfIntroduction: body.selfIntroduction || null,
        summary: body.summary || null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, existing.id))
      .returning();

    return NextResponse.json(updated);
  }

  const [created] = await db
    .insert(profiles)
    .values({
      userId,
      lastName: body.lastName,
      firstName: body.firstName,
      lastNameKana: body.lastNameKana || null,
      firstNameKana: body.firstNameKana || null,
      birthDate: body.birthDate || null,
      gender: body.gender || null,
      email: body.email || null,
      phone: body.phone || null,
      postalCode: body.postalCode || null,
      address: body.address || null,
      selfIntroduction: body.selfIntroduction || null,
      summary: body.summary || null,
    })
    .returning();

  return NextResponse.json(created);
}
