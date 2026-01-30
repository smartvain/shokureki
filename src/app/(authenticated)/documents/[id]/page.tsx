"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ShokumukeirekishoContent } from "@/types/document";

interface DocumentData {
  id: string;
  type: string;
  title: string;
  format: string;
  content: ShokumukeirekishoContent;
  targetCompany: string | null;
  targetPosition: string | null;
  version: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const formatLabels: Record<string, string> = {
  reverse_chronological: "逆編年体",
  chronological: "編年体",
  career_based: "キャリア",
};

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDocument() {
      const res = await fetch(`/api/documents/${params.id}`);
      if (res.ok) {
        setDoc(await res.json());
      }
      setLoading(false);
    }
    fetchDocument();
  }, [params.id]);

  async function handleFinalize() {
    if (!doc) return;
    const res = await fetch(`/api/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "finalized" }),
    });
    if (res.ok) {
      setDoc({ ...doc, status: "finalized" });
    }
  }

  async function handleDelete() {
    if (!doc) return;
    await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
    router.push("/documents");
  }

  async function handleDownloadPdf() {
    if (!doc) return;
    const res = await fetch(`/api/documents/${doc.id}/pdf`, { method: "POST" });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shokumukeirekisho-${doc.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">読み込み中...</h1>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">書類が見つかりません</h1>
      </div>
    );
  }

  const content = doc.content;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{doc.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Badge variant="outline">
              {formatLabels[doc.format] || doc.format}
            </Badge>
            <Badge variant={doc.status === "finalized" ? "default" : "secondary"}>
              {doc.status === "finalized" ? "確定" : "下書き"}
            </Badge>
            {doc.targetCompany && <span>{doc.targetCompany}</span>}
            {doc.targetPosition && <span>{doc.targetPosition}</span>}
            <span>v{doc.version}</span>
            <span>{new Date(doc.updatedAt).toLocaleDateString("ja-JP")}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadPdf}>PDF出力</Button>
          {doc.status === "draft" && (
            <Button variant="outline" onClick={handleFinalize}>
              確定
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">削除</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>書類を削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  この操作は取り消せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  削除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">職務要約</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{content.summary}</p>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">スキル</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {content.skills.map((sg, i) => (
            <div key={i} className="text-sm">
              <span className="font-medium">{sg.category}:</span>{" "}
              {sg.items.join(", ")}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Work Histories */}
      {content.workHistories.map((wh, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="text-base">{wh.companyName}</CardTitle>
            <CardDescription>
              {[wh.period, wh.employmentType, wh.position, wh.department]
                .filter(Boolean)
                .join(" | ")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wh.companyDescription && (
              <p className="text-sm text-muted-foreground">
                {wh.companyDescription}
              </p>
            )}
            {wh.projects.map((proj, j) => (
              <div key={j} className="space-y-2 rounded-md border p-3">
                <h4 className="font-medium text-sm">{proj.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {[
                    proj.period,
                    proj.role && `担当: ${proj.role}`,
                    proj.teamSize && `規模: ${proj.teamSize}`,
                  ]
                    .filter(Boolean)
                    .join(" | ")}
                </p>
                <p className="text-sm">{proj.description}</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {proj.achievements.map((ach, k) => (
                    <li key={k}>{ach}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1">
                  {proj.technologies.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Self PR */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">自己PR</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{content.selfPR}</p>
        </CardContent>
      </Card>
    </div>
  );
}
