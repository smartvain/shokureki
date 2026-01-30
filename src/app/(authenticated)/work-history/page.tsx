"use client";

import { useState, useEffect } from "react";
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
import { WorkHistoryFormDialog } from "@/components/work-history/work-history-form-dialog";

interface WorkHistory {
  id: string;
  companyName: string;
  companyDescription: string | null;
  employmentType: string | null;
  position: string | null;
  department: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean | null;
  responsibilities: string | null;
}

export default function WorkHistoryPage() {
  const [histories, setHistories] = useState<WorkHistory[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WorkHistory | null>(null);

  async function fetchHistories() {
    const res = await fetch("/api/work-history");
    if (res.ok) setHistories(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistories();
  }, []);

  function handleEdit(wh: WorkHistory) {
    setEditing(wh);
    setDialogOpen(true);
  }

  function handleCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/work-history/${id}`, { method: "DELETE" });
    fetchHistories();
  }

  function formatPeriod(start: string, end: string | null, isCurrent: boolean | null) {
    if (isCurrent) return `${start} ～ 現在`;
    return end ? `${start} ～ ${end}` : start;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">職務経歴</h1>
          <p className="text-muted-foreground">これまでの勤務先・職務経歴を管理します</p>
        </div>
        <Button onClick={handleCreate}>新規作成</Button>
      </div>

      {histories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            職務経歴がまだありません。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {histories.map((wh) => (
            <Card key={wh.id}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-medium">{wh.companyName}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>{formatPeriod(wh.startDate, wh.endDate, wh.isCurrent)}</span>
                      {wh.employmentType && (
                        <Badge variant="outline">{wh.employmentType}</Badge>
                      )}
                    </div>
                  </div>
                  {wh.isCurrent && <Badge>在籍中</Badge>}
                </div>

                {(wh.position || wh.department) && (
                  <div className="text-sm">
                    {[wh.position, wh.department].filter(Boolean).join(" / ")}
                  </div>
                )}

                {wh.companyDescription && (
                  <p className="text-sm text-muted-foreground">{wh.companyDescription}</p>
                )}

                {wh.responsibilities && (
                  <p className="text-sm whitespace-pre-wrap">{wh.responsibilities}</p>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(wh)}>
                    編集
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">削除</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>職務経歴を削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          この操作は取り消せません。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(wh.id)}>
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

      <WorkHistoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workHistory={editing ?? undefined}
        onSuccess={fetchHistories}
      />
    </div>
  );
}
