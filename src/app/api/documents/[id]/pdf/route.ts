import { NextResponse } from "next/server";
import { db } from "@/db";
import { generatedDocuments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUserId, unauthorizedResponse } from "@/lib/auth-helpers";
import { renderToBuffer } from "@react-pdf/renderer";
import { ShokumukeirekishoPDF } from "@/services/resume/templates/shokumukeirekisho-pdf";
import type { ShokumukeirekishoContent } from "@/types/document";
import React from "react";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return unauthorizedResponse();

  const { id } = await params;

  const doc = await db.query.generatedDocuments.findFirst({
    where: and(eq(generatedDocuments.id, id), eq(generatedDocuments.userId, userId)),
  });

  if (!doc) {
    return NextResponse.json({ error: "書類が見つかりません" }, { status: 404 });
  }

  const content = doc.content as ShokumukeirekishoContent;

  // Construct font URL from request origin
  const origin = new URL(request.url).origin;
  const fontUrl = `${origin}/fonts/NotoSansJP-Regular.ttf`;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(ShokumukeirekishoPDF, { content, fontUrl }) as any;
    const buffer = await renderToBuffer(element);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="shokumukeirekisho-${id}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "PDF生成に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
