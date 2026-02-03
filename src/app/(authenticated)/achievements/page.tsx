"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { AchievementFormDialog } from "@/components/achievements/achievement-form-dialog";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[] | null;
  period: string | null;
  projectId: string | null;
  projectName: string | null;
  sortOrder: number;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

function formatPeriod(period: string): string {
  // "2025-11-13" → "2025年11月13日", "2025-11" → "2025年11月"
  const parts = period.split("-");
  if (parts.length === 3) {
    return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`;
  }
  if (parts.length === 2) {
    return `${parts[0]}年${parseInt(parts[1])}月`;
  }
  return period;
}

function groupByPeriod(
  achievements: Achievement[]
): { period: string; label: string; items: Achievement[] }[] {
  const groups = new Map<string, Achievement[]>();
  for (const a of achievements) {
    const key = a.period || "none";
    const existing = groups.get(key);
    if (existing) {
      existing.push(a);
    } else {
      groups.set(key, [a]);
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => (a === "none" ? 1 : b === "none" ? -1 : b.localeCompare(a)))
    .map(([key, items]) => ({
      period: key,
      label: key === "none" ? "日付なし" : formatPeriod(key),
      items,
    }));
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

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterProjectId, setFilterProjectId] = useState<string>("");

  async function fetchAchievements() {
    const params = new URLSearchParams();
    if (filterCategory) params.set("category", filterCategory);
    if (filterPeriod) params.set("period", filterPeriod);
    if (filterProjectId) params.set("projectId", filterProjectId);

    const res = await fetch(`/api/achievements?${params}`);
    if (res.ok) setAchievements(await res.json());
    setLoading(false);
  }

  async function fetchProjects() {
    const res = await fetch("/api/projects");
    if (res.ok) {
      const data = await res.json();
      setProjects(data.map((p: Project) => ({ id: p.id, name: p.name })));
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, filterPeriod, filterProjectId]);

  function handleEdit(achievement: Achievement) {
    setEditingAchievement(achievement);
    setDialogOpen(true);
  }

  function handleCreate() {
    setEditingAchievement(null);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/achievements/${id}`, { method: "DELETE" });
    fetchAchievements();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">実績一覧</h1>
          <p className="text-muted-foreground">確定済みの実績を管理します</p>
        </div>
        <Button onClick={handleCreate}>新規作成</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={filterCategory || undefined}
          onValueChange={(v) => setFilterCategory(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="カテゴリ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="期間 (YYYY-MM)"
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="w-[140px]"
        />

        <Select
          value={filterProjectId || undefined}
          onValueChange={(v) => setFilterProjectId(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="プロジェクト" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Achievement List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            実績がまだありません。ダッシュボードで活動を収集し、候補を承認してください。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupByPeriod(achievements).map((group) => (
            <div key={group.period} className="space-y-3">
              <h2 className="text-lg font-semibold">{group.label}</h2>
              <div className="space-y-3">
                {group.items.map((achievement) => (
                  <Card key={achievement.id}>
                    <CardContent className="space-y-3 pt-6">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h3 className="font-medium">{achievement.title}</h3>
                          <p className="text-muted-foreground text-sm">{achievement.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline">
                          {categoryLabels[achievement.category] ?? achievement.category}
                        </Badge>
                        {achievement.projectName && (
                          <Badge variant="secondary">{achievement.projectName}</Badge>
                        )}
                        {achievement.technologies?.map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(achievement)}>
                          編集
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              削除
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>実績を削除しますか？</AlertDialogTitle>
                              <AlertDialogDescription>
                                この操作は取り消せません。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>キャンセル</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(achievement.id)}>
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
            </div>
          ))}
        </div>
      )}

      <AchievementFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        achievement={editingAchievement ?? undefined}
        projects={projects}
        onSuccess={fetchAchievements}
      />
    </div>
  );
}
