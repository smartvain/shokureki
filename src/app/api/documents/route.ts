import { NextResponse } from "next/server";
import { db } from "@/db";
import { generatedDocuments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const docs = await db
    .select({
      id: generatedDocuments.id,
      type: generatedDocuments.type,
      title: generatedDocuments.title,
      format: generatedDocuments.format,
      targetCompany: generatedDocuments.targetCompany,
      targetPosition: generatedDocuments.targetPosition,
      version: generatedDocuments.version,
      status: generatedDocuments.status,
      createdAt: generatedDocuments.createdAt,
      updatedAt: generatedDocuments.updatedAt,
    })
    .from(generatedDocuments)
    .where(eq(generatedDocuments.userId, userId))
    .orderBy(desc(generatedDocuments.updatedAt));

  return NextResponse.json(docs);
}
