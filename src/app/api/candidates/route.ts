import { NextResponse } from "next/server";
import { db } from "@/db";
import { achievementCandidates, dailyDigests, achievements } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";

// GET: List pending candidates
export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const candidates = await db
    .select({
      id: achievementCandidates.id,
      title: achievementCandidates.title,
      description: achievementCandidates.description,
      category: achievementCandidates.category,
      technologies: achievementCandidates.technologies,
      significance: achievementCandidates.significance,
      status: achievementCandidates.status,
      createdAt: achievementCandidates.createdAt,
      digestDate: dailyDigests.date,
    })
    .from(achievementCandidates)
    .innerJoin(dailyDigests, eq(achievementCandidates.digestId, dailyDigests.id))
    .where(and(eq(dailyDigests.userId, userId), eq(achievementCandidates.status, "pending")))
    .orderBy(desc(achievementCandidates.createdAt));

  return NextResponse.json(candidates);
}

// PATCH: Accept or reject a candidate
export async function PATCH(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { candidateId, action, editedTitle, editedDescription } = await request.json();

  if (!candidateId || !["accept", "reject"].includes(action)) {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  // Verify the candidate belongs to this user
  const candidate = await db
    .select()
    .from(achievementCandidates)
    .innerJoin(dailyDigests, eq(achievementCandidates.digestId, dailyDigests.id))
    .where(and(eq(achievementCandidates.id, candidateId), eq(dailyDigests.userId, userId)))
    .then((rows) => rows[0]);

  if (!candidate) {
    return NextResponse.json({ error: "候補が見つかりません" }, { status: 404 });
  }

  if (action === "reject") {
    await db
      .update(achievementCandidates)
      .set({ status: "rejected" })
      .where(eq(achievementCandidates.id, candidateId));

    return NextResponse.json({ success: true });
  }

  // Accept: create achievement and update candidate status
  const title = editedTitle || candidate.achievement_candidates.title;
  const description = editedDescription || candidate.achievement_candidates.description;

  const [achievement] = await db
    .insert(achievements)
    .values({
      userId,
      candidateId,
      title,
      description,
      category: candidate.achievement_candidates.category,
      technologies: candidate.achievement_candidates.technologies,
      period: candidate.daily_digests.date.slice(0, 7), // YYYY-MM
    })
    .returning();

  await db
    .update(achievementCandidates)
    .set({ status: editedTitle || editedDescription ? "edited" : "accepted" })
    .where(eq(achievementCandidates.id, candidateId));

  return NextResponse.json(achievement);
}
