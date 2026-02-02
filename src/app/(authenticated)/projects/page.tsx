"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";

interface Project {
  id: string;
  name: string;
  company: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  role: string | null;
  teamSize: string | null;
  achievementCount: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  async function fetchProjects() {
    const res = await fetch("/api/projects");
    if (res.ok) setProjects(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, []);

  function handleEdit(project: Project) {
    setEditingProject(project);
    setDialogOpen(true);
  }

  function handleCreate() {
    setEditingProject(null);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
  }

  function formatPeriod(start: string | null, end: string | null) {
    if (!start) return "";
    return end ? `${start} ～ ${end}` : `${start} ～ 現在`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">プロジェクト</h1>
          <p className="text-muted-foreground">実績をグループ化するプロジェクトを管理します</p>
        </div>
        <Button onClick={handleCreate}>新規作成</Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-12 text-center">
            プロジェクトがまだありません。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-sm">
                      {project.company && <span>{project.company}</span>}
                      {project.startDate && (
                        <span>{formatPeriod(project.startDate, project.endDate)}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">実績 {project.achievementCount}件</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {(project.role || project.teamSize) && (
                  <div className="flex gap-4 text-sm">
                    {project.role && (
                      <span>
                        <span className="text-muted-foreground">役割:</span> {project.role}
                      </span>
                    )}
                    {project.teamSize && (
                      <span>
                        <span className="text-muted-foreground">規模:</span> {project.teamSize}
                      </span>
                    )}
                  </div>
                )}
                {project.description && (
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {project.description}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(project)}>
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
                        <AlertDialogTitle>プロジェクトを削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          紐づいている実績のプロジェクト参照は解除されます。実績自体は削除されません。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(project.id)}>
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

      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editingProject ?? undefined}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
