import { NextResponse } from "next/server";
import { db } from "@/db";
import { workHistories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthenticatedUserId, unauthorizedResponse, getOrCreateProfileId } from "@/lib/auth-helpers";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const profileId = await getOrCreateProfileId(userId);

  const result = await db.query.workHistories.findMany({
    where: eq(workHistories.profileId, profileId),
    orderBy: [workHistories.sortOrder, desc(workHistories.startDate)],
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const profileId = await getOrCreateProfileId(userId);
  const body = await request.json();

  const [created] = await db
    .insert(workHistories)
    .values({
      profileId,
      companyName: body.companyName,
      companyDescription: body.companyDescription || null,
      employmentType: body.employmentType || null,
      position: body.position || null,
      department: body.department || null,
      startDate: body.startDate,
      endDate: body.isCurrent ? null : body.endDate || null,
      isCurrent: body.isCurrent || false,
      responsibilities: body.responsibilities || null,
    })
    .returning();

  return NextResponse.json(created);
}
