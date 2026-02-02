import { NextResponse } from "next/server";
import { db } from "@/db";
import { serviceConnections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/crypto";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";

// PUT: Toggle repo selection
export async function PUT(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { repoFullName } = await request.json();

  const connection = await db.query.serviceConnections.findFirst({
    where: and(eq(serviceConnections.userId, userId), eq(serviceConnections.service, "github")),
  });

  if (!connection) {
    return NextResponse.json({ error: "GitHubが未設定です" }, { status: 404 });
  }

  const config = JSON.parse(decrypt(connection.encryptedConfig));
  config.repos = config.repos.map((r: { fullName: string; selected: boolean }) =>
    r.fullName === repoFullName ? { ...r, selected: !r.selected } : r
  );

  await db
    .update(serviceConnections)
    .set({
      encryptedConfig: encrypt(JSON.stringify(config)),
      updatedAt: new Date(),
    })
    .where(eq(serviceConnections.id, connection.id));

  return NextResponse.json({ success: true });
}
