import { NextResponse } from "next/server";
import { db } from "@/db";
import { serviceConnections } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/crypto";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { Octokit } from "@octokit/rest";

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
  } catch {
    return NextResponse.json(
      { error: "無効なトークンです。repo スコープが付与されているか確認してください。" },
      { status: 400 }
    );
  }
}
