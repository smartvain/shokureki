"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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

interface Document {
  id: string;
  type: string;
  title: string;
  format: string;
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

const statusLabels: Record<string, string> = {
  draft: "下書き",
  finalized: "確定",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);

  async function fetchDocuments() {
    const res = await fetch("/api/documents");
    if (res.ok) setDocuments(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocuments();
  }, []);

  async function handleDelete(id: string) {
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    fetchDocuments();
  }

  async function handleDownloadPdf(id: string) {
    const res = await fetch(`/api/documents/${id}/pdf`, { method: "POST" });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shokumukeirekisho-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">書類一覧</h1>
          <p className="text-muted-foreground">生成した書類を管理します</p>
        </div>
        <Button asChild>
          <Link href="/documents/generate/shokumukeirekisho">新規作成</Link>
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            書類がまだありません。「新規作成」から職務経歴書を生成できます。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-medium">{doc.title}</h3>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                      {doc.targetCompany && <span>{doc.targetCompany}</span>}
                      {doc.targetPosition && <span>{doc.targetPosition}</span>}
                      <span>v{doc.version}</span>
                      <span>{new Date(doc.updatedAt).toLocaleDateString("ja-JP")}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline">{formatLabels[doc.format] || doc.format}</Badge>
                    <Badge variant={doc.status === "finalized" ? "default" : "secondary"}>
                      {statusLabels[doc.status] || doc.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/documents/${doc.id}`}>閲覧</Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadPdf(doc.id)}>
                    PDF出力
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        削除
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>書類を削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>この操作は取り消せません。</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(doc.id)}>
                          削除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
