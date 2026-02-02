"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Candidate {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[] | null;
  significance: string;
  status: string;
  digestDate: string;
}

interface CollectResult {
  digest: {
    id: string;
    date: string;
    activityCount: number;
    summary: string;
    status: string;
  };
  candidates: Candidate[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [collecting, setCollecting] = useState(false);
  const [manualNotes, setManualNotes] = useState("");
  const [result, setResult] = useState<CollectResult | null>(null);
  const [pendingCandidates, setPendingCandidates] = useState<Candidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [achievementCount, setAchievementCount] = useState<number>(0);
  const [documentCount, setDocumentCount] = useState<number>(0);

  async function fetchCandidates() {
    const res = await fetch("/api/candidates");
    if (res.ok) {
      const data = await res.json();
      setPendingCandidates(data);
    }
  }

  async function fetchStats() {
    const [achRes, docRes] = await Promise.all([
      fetch("/api/achievements"),
      fetch("/api/documents"),
    ]);
    if (achRes.ok) {
      const data = await achRes.json();
      setAchievementCount(data.length);
    }
    if (docRes.ok) {
      const data = await docRes.json();
      setDocumentCount(data.length);
    }
  }

  useEffect(() => {
    fetchCandidates();
    fetchStats();
  }, []);

  async function handleCollect() {
    setCollecting(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString().split("T")[0],
          manualNotes: manualNotes || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        setManualNotes("");
        await fetchCandidates();
      } else {
        setError(data.error || "収集に失敗しました");
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setCollecting(false);
    }
  }

  async function handleCandidate(candidateId: string, action: "accept" | "reject") {
    const res = await fetch("/api/candidates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, action }),
    });

    if (res.ok) {
      await fetchCandidates();
    }
  }

  const categoryLabels: Record<string, string> = {
    development: "開発",
    review: "レビュー",
    bugfix: "バグ修正",
    design: "設計",
    documentation: "ドキュメント",
    communication: "コミュニケーション",
    leadership: "リーダーシップ",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <p className="text-muted-foreground">
          {session?.user?.name ? `${session.user.name}さん、` : ""}
          おかえりなさい
        </p>
      </div>

      {/* Collect Section */}
      <Card>
        <CardHeader>
          <CardTitle>今日の活動を収集</CardTitle>
          <CardDescription>
            GitHubの活動を自動収集し、AIが実績候補を生成します。
            手動メモ（議事録等）があればペーストしてください。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="手動メモ（オプション）：会議議事録、Slackで共有した内容など..."
            value={manualNotes}
            onChange={(e) => setManualNotes(e.target.value)}
            rows={3}
          />
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleCollect}
            disabled={collecting}
          >
            {collecting ? "収集中・AI分析中..." : "今日の活動を収集"}
          </Button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {result && (
            <div className="bg-muted/50 space-y-2 rounded-md border p-4">
              <p className="text-sm font-medium">
                {result.digest.activityCount}件の活動を収集しました
              </p>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {result.digest.summary}
              </p>
              {result.candidates.length > 0 && (
                <p className="text-sm">{result.candidates.length}件の実績候補を生成しました</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Candidates */}
      {pendingCandidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>実績候補のレビュー</CardTitle>
            <CardDescription>
              AIが生成した実績候補です。承認すると確定済み実績に追加されます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingCandidates.map((candidate) => (
              <div key={candidate.id} className="space-y-3 rounded-md border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-medium">{candidate.title}</h3>
                    <p className="text-muted-foreground text-sm">{candidate.description}</p>
                  </div>
                  <Badge variant={candidate.significance === "high" ? "default" : "secondary"}>
                    {candidate.significance === "high"
                      ? "重要"
                      : candidate.significance === "medium"
                        ? "中"
                        : "低"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">
                    {categoryLabels[candidate.category] || candidate.category}
                  </Badge>
                  {candidate.technologies?.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleCandidate(candidate.id, "accept")}>
                    承認
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCandidate(candidate.id, "reject")}
                  >
                    スキップ
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">実績候補</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingCandidates.length}</p>
            <p className="text-muted-foreground text-xs">レビュー待ち</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">確定済み実績</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{achievementCount}</p>
            <p className="text-muted-foreground text-xs">合計</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">生成書類</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{documentCount}</p>
            <p className="text-muted-foreground text-xs">合計</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
