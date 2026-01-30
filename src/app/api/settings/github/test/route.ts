import { NextResponse } from "next/server";
import { db } from "@/db";
import { serviceConnections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { decrypt } from "@/lib/crypto";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { Octokit } from "@octokit/rest";

export async function POST() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const connection = await db.query.serviceConnections.findFirst({
    where: and(
      eq(serviceConnections.userId, userId),
      eq(serviceConnections.service, "github")
    ),
  });

  if (!connection) {
    return NextResponse.json({ error: "GitHubが未設定です" }, { status: 404 });
  }

  try {
    const config = JSON.parse(decrypt(connection.encryptedConfig));
    const octokit = new Octokit({ auth: config.token });
    const { data: user } = await octokit.users.getAuthenticated();

    return NextResponse.json({ username: user.login });
  } catch {
    // Update connection status to error
    await db
      .update(serviceConnections)
      .set({ status: "error", updatedAt: new Date() })
      .where(eq(serviceConnections.id, connection.id));

    return NextResponse.json(
      { error: "GitHubへの接続に失敗しました。トークンを確認してください。" },
      { status: 400 }
    );
  }
}
