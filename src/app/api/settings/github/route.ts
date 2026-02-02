import { NextResponse } from "next/server";
import { db } from "@/db";
import { serviceConnections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/crypto";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { Octokit } from "@octokit/rest";
import { RequestError } from "@octokit/request-error";

// GET: Fetch GitHub connection status
export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const connection = await db.query.serviceConnections.findFirst({
    where: and(
      eq(serviceConnections.userId, userId),
      eq(serviceConnections.service, "github")
    ),
  });

  if (!connection) {
    return NextResponse.json({
      connected: false,
      repos: [],
    });
  }

  const config = JSON.parse(decrypt(connection.encryptedConfig));

  return NextResponse.json({
    connected: connection.status === "active",
    username: config.username,
    repos: (config.repos || []).map((r: { fullName: string; selected: boolean }) => ({
      fullName: r.fullName,
      selected: r.selected,
    })),
  });
}

// POST: Save GitHub token
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { token } = await request.json();

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "トークンが必要です" }, { status: 400 });
  }

  // Verify the token works
  try {
    const octokit = new Octokit({ auth: token });
    const { data: user } = await octokit.users.getAuthenticated();
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
    });

    const config = {
      token,
      username: user.login,
      repos: repos.map((r) => ({
        fullName: r.full_name,
        selected: false,
      })),
    };

    const encryptedConfig = encrypt(JSON.stringify(config));

    // Upsert connection
    const existing = await db.query.serviceConnections.findFirst({
      where: and(
        eq(serviceConnections.userId, userId),
        eq(serviceConnections.service, "github")
      ),
    });

    if (existing) {
      await db
        .update(serviceConnections)
        .set({
          encryptedConfig,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(serviceConnections.id, existing.id));
    } else {
      await db.insert(serviceConnections).values({
        userId,
        service: "github",
        label: `GitHub (${user.login})`,
        encryptedConfig,
        status: "active",
      });
    }

    return NextResponse.json({
      connected: true,
      username: user.login,
      repos: config.repos.map((r) => ({
        fullName: r.fullName,
        selected: r.selected,
      })),
    });
  } catch (error) {
    if (error instanceof RequestError) {
      switch (error.status) {
        case 401:
          return NextResponse.json(
            { error: "無効なトークンです。トークンが正しいか確認してください。" },
            { status: 400 }
          );
        case 403:
          if (error.response?.headers?.["x-ratelimit-remaining"] === "0") {
            return NextResponse.json(
              { error: "GitHub APIのレート制限に達しました。しばらく待ってから再試行してください。" },
              { status: 429 }
            );
          }
          return NextResponse.json(
            { error: "repo スコープが付与されていません。トークンの権限を確認してください。" },
            { status: 400 }
          );
        default:
          if (error.status >= 500) {
            return NextResponse.json(
              { error: "GitHub側でエラーが発生しています。しばらく待ってから再試行してください。" },
              { status: 502 }
            );
          }
      }
    }

    console.error("GitHub token validation error:", error);
    return NextResponse.json(
      { error: "GitHubとの通信に失敗しました。ネットワーク接続を確認して再試行してください。" },
      { status: 500 }
    );
  }
}
