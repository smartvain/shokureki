import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
}

export async function getOrCreateProfileId(userId: string): Promise<string> {
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
    columns: { id: true },
  });

  if (existing) return existing.id;

  const [created] = await db.insert(profiles).values({ userId }).returning({ id: profiles.id });

  return created.id;
}
