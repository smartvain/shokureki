"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workHistoryFormSchema, type WorkHistoryFormValues } from "@/lib/validations/work-history";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkHistoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workHistory?: {
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
  };
  onSuccess: () => void;
}

const employmentTypes = [
  "正社員",
  "契約社員",
  "派遣社員",
  "業務委託",
  "パート・アルバイト",
  "インターン",
];

export function WorkHistoryFormDialog({
  open,
  onOpenChange,
  workHistory,
  onSuccess,
}: WorkHistoryFormDialogProps) {
  const isEditing = !!workHistory;

  const form = useForm<WorkHistoryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(workHistoryFormSchema) as any,
    defaultValues: {
      companyName: workHistory?.companyName ?? "",
      companyDescription: workHistory?.companyDescription ?? "",
      employmentType: workHistory?.employmentType ?? "",
      position: workHistory?.position ?? "",
      department: workHistory?.department ?? "",
      startDate: workHistory?.startDate ?? "",
      endDate: workHistory?.endDate ?? "",
      isCurrent: workHistory?.isCurrent ?? false,
      responsibilities: workHistory?.responsibilities ?? "",
    },
  });

  const isCurrent = form.watch("isCurrent");

  async function onSubmit(values: WorkHistoryFormValues) {
    const url = isEditing ? `/api/work-history/${workHistory.id}` : "/api/work-history";
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
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "職務経歴を編集" : "職務経歴を追加"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>会社名 *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>会社概要</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="事業内容、従業員数など" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>雇用形態</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="選択してください" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>役職</FormLabel>
                    <FormControl>
                      <Input placeholder="例: リードエンジニア" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>部署</FormLabel>
                    <FormControl>
                      <Input placeholder="例: 開発部" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>開始年月 *</FormLabel>
                    <FormControl>
                      <Input placeholder="2022-04" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>終了年月</FormLabel>
                    <FormControl>
                      <Input placeholder="2024-03" disabled={isCurrent} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isCurrent"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) form.setValue("endDate", "");
                      }}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">現在在籍中</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="responsibilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>業務内容</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="担当した業務の概要..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                キャンセル
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "保存中..." : isEditing ? "更新" : "追加"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
