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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] =
    useState<Achievement | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [filterProjectId, setFilterProjectId] = useState<string>("all");

  async function fetchAchievements() {
    const params = new URLSearchParams();
    if (filterCategory && filterCategory !== "all")
      params.set("category", filterCategory);
    if (filterPeriod) params.set("period", filterPeriod);
    if (filterProjectId && filterProjectId !== "all")
      params.set("projectId", filterProjectId);

    const res = await fetch(`/api/achievements?${params}`);
    if (res.ok) setAchievements(await res.json());
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
        <Select value={filterCategory} onValueChange={setFilterCategory}>
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

        <Select value={filterProjectId} onValueChange={setFilterProjectId}>
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
      {achievements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            実績がまだありません。ダッシュボードで活動を収集し、候補を承認してください。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <Card key={achievement.id}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <h3 className="font-medium">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline">
                    {categoryLabels[achievement.category] ??
                      achievement.category}
                  </Badge>
                  {achievement.period && (
                    <Badge variant="secondary">{achievement.period}</Badge>
                  )}
                  {achievement.projectName && (
                    <Badge variant="secondary">
                      {achievement.projectName}
                    </Badge>
                  )}
                  {achievement.technologies?.map((tech) => (
                    <Badge key={tech} variant="secondary" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(achievement)}
                  >
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
                        <AlertDialogTitle>
                          実績を削除しますか？
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          この操作は取り消せません。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(achievement.id)}
                        >
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
