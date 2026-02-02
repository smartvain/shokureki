"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { achievementFormSchema, type AchievementFormValues } from "@/lib/validations/achievement";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Project {
  id: string;
  name: string;
}

interface AchievementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement?: {
    id: string;
    title: string;
    description: string;
    category: string;
    technologies: string[] | null;
    period: string | null;
    projectId: string | null;
  };
  projects: Project[];
  onSuccess: () => void;
}

const categoryOptions = [
  { value: "development", label: "開発" },
  { value: "review", label: "レビュー" },
  { value: "bugfix", label: "バグ修正" },
  { value: "design", label: "設計" },
  { value: "documentation", label: "ドキュメント" },
  { value: "communication", label: "コミュニケーション" },
  { value: "leadership", label: "リーダーシップ" },
];

export function AchievementFormDialog({
  open,
  onOpenChange,
  achievement,
  projects,
  onSuccess,
}: AchievementFormDialogProps) {
  const isEditing = !!achievement;

  const form = useForm<AchievementFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(achievementFormSchema) as any,
    defaultValues: {
      title: achievement?.title ?? "",
      description: achievement?.description ?? "",
      category: (achievement?.category as AchievementFormValues["category"]) ?? "development",
      technologies: achievement?.technologies?.join(", ") ?? "",
      period: achievement?.period ?? "",
      projectId: achievement?.projectId ?? null,
    },
  });

  async function onSubmit(values: AchievementFormValues) {
    const url = isEditing ? `/api/achievements/${achievement.id}` : "/api/achievements";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      onOpenChange(false);
      form.reset();
      onSuccess();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "実績を編集" : "実績を作成"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>タイトル *</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 認証基盤の設計・実装" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>説明 *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="職務経歴書に記載する形式で記述..." rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>カテゴリ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>期間</FormLabel>
                    <FormControl>
                      <Input placeholder="2024-01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="technologies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>技術スタック</FormLabel>
                  <FormControl>
                    <Input placeholder="React, TypeScript, Next.js（カンマ区切り）" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>プロジェクト</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === "none" ? null : v)}
                    defaultValue={field.value ?? "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="未選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">未選択</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "保存中..." : isEditing ? "更新" : "作成"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
