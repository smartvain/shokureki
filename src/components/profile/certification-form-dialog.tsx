"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { certificationFormSchema, type CertificationFormValues } from "@/lib/validations/profile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CertificationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CertificationFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: CertificationFormDialogProps) {
  const form = useForm<CertificationFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(certificationFormSchema) as any,
    defaultValues: {
      name: "",
      issuingOrganization: "",
      acquiredDate: "",
    },
  });

  async function onSubmit(values: CertificationFormValues) {
    const res = await fetch("/api/profile/certifications", {
      method: "POST",
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
          <DialogTitle>資格を追加</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>資格名 *</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 基本情報技術者" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="issuingOrganization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>発行機関</FormLabel>
                  <FormControl>
                    <Input placeholder="例: IPA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acquiredDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>取得日</FormLabel>
                  <FormControl>
                    <Input placeholder="2023-06" {...field} />
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
                {form.formState.isSubmitting ? "保存中..." : "追加"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
