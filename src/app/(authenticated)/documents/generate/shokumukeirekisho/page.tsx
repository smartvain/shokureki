"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { WizardStepper } from "@/components/documents/wizard-stepper";
import type { ShokumukeirekishoContent } from "@/types/document";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[] | null;
  period: string | null;
  projectName: string | null;
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

const formatOptions = [
  {
    value: "reverse_chronological" as const,
    label: "逆編年体（推奨）",
    description: "最新の職歴から記載。転職回数が少ない方におすすめ",
  },
  {
    value: "chronological" as const,
    label: "編年体",
    description: "古い職歴から記載。長い経歴を時系列で伝えたい方におすすめ",
  },
  {
    value: "career_based" as const,
    label: "キャリア別",
    description: "プロジェクト/スキル別にグループ化。技術力をアピールしたい方におすすめ",
  },
];

const wizardSteps = [
  { label: "フォーマット" },
  { label: "実績選択" },
  { label: "AI生成" },
  { label: "プレビュー" },
  { label: "保存" },
];

export default function ShokumukeirekishoGeneratePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  // Step 1: Format
  const [format, setFormat] = useState<"reverse_chronological" | "chronological" | "career_based">("reverse_chronological");

  // Step 2: Achievement selection
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Step 3: AI generation
  const [targetCompany, setTargetCompany] = useState("");
  const [targetPosition, setTargetPosition] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 4: Preview & edit
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [content, setContent] = useState<ShokumukeirekishoContent | null>(null);

  // Step 5: Save
  const [saving, setSaving] = useState(false);

  const fetchAchievements = useCallback(async () => {
    const res = await fetch("/api/achievements");
    if (res.ok) {
      const data = await res.json();
      setAchievements(data);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  function toggleAchievement(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function selectAll() {
    setSelectedIds(new Set(achievements.map((a) => a.id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          achievementIds: Array.from(selectedIds),
          targetCompany: targetCompany || undefined,
          targetPosition: targetPosition || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setDocumentId(data.id);
        setContent(data.content as ShokumukeirekishoContent);
        setStep(3);
      } else {
        setError(data.error || "生成に失敗しました");
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(status: "draft" | "finalized") {
    if (!documentId || !content) return;
    setSaving(true);

    await fetch(`/api/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, status }),
    });

    setSaving(false);
    router.push(`/documents/${documentId}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">職務経歴書生成</h1>
        <p className="text-muted-foreground">
          AIが蓄積された実績からプロフェッショナルな職務経歴書を生成します
        </p>
      </div>

      <WizardStepper currentStep={step} steps={wizardSteps} />

      {/* Step 1: Format Selection */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">フォーマットを選択</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {formatOptions.map((opt) => (
              <Card
                key={opt.value}
                className={`cursor-pointer transition-colors ${format === opt.value ? "border-primary" : ""}`}
                onClick={() => setFormat(opt.value)}
              >
                <CardHeader>
                  <CardTitle className="text-base">{opt.label}</CardTitle>
                  <CardDescription>{opt.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setStep(1)}>次へ</Button>
          </div>
        </div>
      )}

      {/* Step 2: Achievement Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              実績を選択 ({selectedIds.size}件選択中)
            </h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={selectAll}>
                全選択
              </Button>
              <Button size="sm" variant="outline" onClick={deselectAll}>
                全解除
              </Button>
            </div>
          </div>

          {achievements.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                実績がありません。先に実績を登録してください。
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`cursor-pointer transition-colors ${selectedIds.has(achievement.id) ? "border-primary" : ""}`}
                  onClick={() => toggleAchievement(achievement.id)}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedIds.has(achievement.id)}
                        onCheckedChange={() =>
                          toggleAchievement(achievement.id)
                        }
                        className="mt-1"
                      />
                      <div className="space-y-1 flex-1">
                        <p className="font-medium text-sm">
                          {achievement.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {achievement.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[achievement.category] ??
                              achievement.category}
                          </Badge>
                          {achievement.technologies?.map((tech) => (
                            <Badge
                              key={tech}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(0)}>
              戻る
            </Button>
            <Button
              onClick={() => setStep(2)}
              disabled={selectedIds.size === 0}
            >
              次へ
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: AI Generation */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">AI生成設定</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>応募先企業名（任意）</Label>
                <Input
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="応募先に合わせた内容を生成します"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>応募先ポジション（任意）</Label>
                <Input
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  placeholder="例: シニアフロントエンドエンジニア"
                  className="mt-1"
                />
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={generating}
              >
                {generating ? "AI生成中..." : "職務経歴書を生成"}
              </Button>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              戻る
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Preview & Edit */}
      {step === 3 && content && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">プレビュー・編集</h2>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">職務要約</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={content.summary}
                onChange={(e) =>
                  setContent({ ...content, summary: e.target.value })
                }
                rows={4}
              />
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
                  {[wh.period, wh.employmentType, wh.position]
                    .filter(Boolean)
                    .join(" | ")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {wh.projects.map((proj, j) => (
                  <div key={j} className="space-y-2 rounded-md border p-3">
                    <h4 className="font-medium text-sm">{proj.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {[proj.period, proj.role, proj.teamSize]
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
              <Textarea
                value={content.selfPR}
                onChange={(e) =>
                  setContent({ ...content, selfPR: e.target.value })
                }
                rows={4}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              再生成
            </Button>
            <Button onClick={() => setStep(4)}>次へ</Button>
          </div>
        </div>
      )}

      {/* Step 5: Save */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium">保存</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                職務経歴書の生成が完了しました。保存方法を選択してください。
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleSave("draft")}
                  disabled={saving}
                >
                  {saving ? "保存中..." : "下書きとして保存"}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleSave("finalized")}
                  disabled={saving}
                >
                  {saving ? "保存中..." : "確定して保存"}
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-start">
            <Button variant="outline" onClick={() => setStep(3)}>
              戻る
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
