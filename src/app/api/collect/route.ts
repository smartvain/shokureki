import { NextResponse } from "next/server";
import { db } from "@/db";
import { serviceConnections, dailyDigests, achievementCandidates } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { decrypt } from "@/lib/crypto";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { collectGitHubActivities } from "@/services/collectors/github";
import { summarizeActivities } from "@/services/ai/openai";

export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { date, manualNotes } = await request.json();
  const targetDate = date || new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Get GitHub connection
  const connection = await db.query.serviceConnections.findFirst({
    where: and(
      eq(serviceConnections.userId, userId),
      eq(serviceConnections.service, "github"),
      eq(serviceConnections.status, "active")
    ),
  });

  // Collect activities from GitHub (in memory only)
  const activities = [];

  if (connection) {
    const config = JSON.parse(decrypt(connection.encryptedConfig));
    const selectedRepos = config.repos
      .filter((r: { selected: boolean }) => r.selected)
      .map((r: { fullName: string }) => r.fullName);

    if (selectedRepos.length > 0) {
      const githubActivities = await collectGitHubActivities({
        token: config.token,
        repos: selectedRepos,
        date: targetDate,
      });
      activities.push(...githubActivities);
    }
  }

  // Create or update daily digest
  let digest = await db.query.dailyDigests.findFirst({
    where: and(eq(dailyDigests.userId, userId), eq(dailyDigests.date, targetDate)),
  });

  if (!digest) {
    const [newDigest] = await db
      .insert(dailyDigests)
      .values({
        userId,
        date: targetDate,
        activityCount: activities.length,
        status: "summarizing",
      })
      .returning();
    digest = newDigest;
  } else {
    await db
      .update(dailyDigests)
      .set({
        activityCount: activities.length,
        status: "summarizing",
        updatedAt: new Date(),
      })
      .where(eq(dailyDigests.id, digest.id));
  }

  // AI summarization (raw data is NOT stored, only AI output)
  try {
    const result = await summarizeActivities(activities, manualNotes);

    // Update digest with summary
    await db
      .update(dailyDigests)
      .set({
        summaryText: result.dailySummary,
        status: "ready",
        updatedAt: new Date(),
      })
      .where(eq(dailyDigests.id, digest.id));

    // Store achievement candidates (anonymized by AI)
    const candidates = [];
    for (const candidate of result.achievementCandidates) {
      const [inserted] = await db
        .insert(achievementCandidates)
        .values({
          digestId: digest.id,
          title: candidate.title,
          description: candidate.description,
          category: candidate.category,
          technologies: candidate.technologies,
          significance: candidate.significance,
          status: "pending",
        })
        .returning();
      candidates.push(inserted);
    }

    return NextResponse.json({
      digest: {
        id: digest.id,
        date: targetDate,
        activityCount: activities.length,
        summary: result.dailySummary,
        status: "ready",
      },
      candidates,
    });
  } catch (error) {
    // Update digest status to error
    await db
      .update(dailyDigests)
      .set({
        status: "collecting",
        updatedAt: new Date(),
      })
      .where(eq(dailyDigests.id, digest.id));

    return NextResponse.json(
      {
        error: "AI要約に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
