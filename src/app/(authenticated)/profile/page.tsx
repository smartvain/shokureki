"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileFormSchema, type ProfileFormValues } from "@/lib/validations/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EducationFormDialog } from "@/components/profile/education-form-dialog";
import { CertificationFormDialog } from "@/components/profile/certification-form-dialog";
import { SkillFormDialog } from "@/components/profile/skill-form-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Education {
  id: string;
  schoolName: string;
  faculty: string | null;
  degree: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
}

interface Certification {
  id: string;
  name: string;
  issuingOrganization: string | null;
  acquiredDate: string | null;
}

interface Skill {
  id: string;
  category: string;
  name: string;
  level: string | null;
  yearsOfExperience: number | null;
}

const statusLabels: Record<string, string> = {
  graduated: "卒業",
  enrolled: "在学中",
  withdrawn: "中退",
  expected: "卒業見込",
};

const levelLabels: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "上級",
  expert: "エキスパート",
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [educations, setEducations] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [skillsList, setSkillsList] = useState<Skill[]>([]);
  const [eduDialogOpen, setEduDialogOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);

  const form = useForm<ProfileFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileFormSchema) as any,
    defaultValues: {
      lastName: "",
      firstName: "",
      lastNameKana: "",
      firstNameKana: "",
      birthDate: "",
      gender: "",
      email: "",
      phone: "",
      postalCode: "",
      address: "",
      selfIntroduction: "",
      summary: "",
    },
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        form.reset({
          lastName: data.lastName || "",
          firstName: data.firstName || "",
          lastNameKana: data.lastNameKana || "",
          firstNameKana: data.firstNameKana || "",
          birthDate: data.birthDate || "",
          gender: data.gender || "",
          email: data.email || "",
          phone: data.phone || "",
          postalCode: data.postalCode || "",
          address: data.address || "",
          selfIntroduction: data.selfIntroduction || "",
          summary: data.summary || "",
        });
      })
      .finally(() => setLoading(false));
  }, [form]);

  async function fetchEducations() {
    const res = await fetch("/api/profile/educations");
    if (res.ok) setEducations(await res.json());
  }

  async function fetchCertifications() {
    const res = await fetch("/api/profile/certifications");
    if (res.ok) setCertifications(await res.json());
  }

  async function fetchSkills() {
    const res = await fetch("/api/profile/skills");
    if (res.ok) setSkillsList(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEducations();
    fetchCertifications();
    fetchSkills();
  }, []);

  async function onSubmitProfile(values: ProfileFormValues) {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        toast.success("プロフィールを保存しました");
      } else {
        toast.error("保存に失敗しました");
      }
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(endpoint: string, id: string, refresh: () => void) {
    await fetch(endpoint, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refresh();
  }

  // Group skills by category
  const groupedSkills = skillsList.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">プロフィール</h1>
          <p className="text-muted-foreground">個人情報・学歴・資格・スキルを管理します</p>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">プロフィール</h1>
        <p className="text-muted-foreground">個人情報・学歴・資格・スキルを管理します</p>
      </div>

      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">基本情報</TabsTrigger>
          <TabsTrigger value="education">学歴</TabsTrigger>
          <TabsTrigger value="certification">資格</TabsTrigger>
          <TabsTrigger value="skills">スキル</TabsTrigger>
        </TabsList>

        {/* Basic Info */}
        <TabsContent value="basic">
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>姓 *</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>名 *</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="lastNameKana" render={({ field }) => (
                      <FormItem>
                        <FormLabel>せい</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="firstNameKana" render={({ field }) => (
                      <FormItem>
                        <FormLabel>めい</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="birthDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>生年月日</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="gender" render={({ field }) => (
                      <FormItem>
                        <FormLabel>性別</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">男性</SelectItem>
                            <SelectItem value="female">女性</SelectItem>
                            <SelectItem value="other">その他</SelectItem>
                            <SelectItem value="prefer_not_to_say">未回答</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>メールアドレス</FormLabel>
                        <FormControl><Input type="email" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>電話番号</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="postalCode" render={({ field }) => (
                      <FormItem>
                        <FormLabel>郵便番号</FormLabel>
                        <FormControl><Input placeholder="123-4567" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>住所</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="summary" render={({ field }) => (
                    <FormItem>
                      <FormLabel>職務要約</FormLabel>
                      <FormControl><Textarea rows={3} placeholder="経歴の概要..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="selfIntroduction" render={({ field }) => (
                    <FormItem>
                      <FormLabel>自己紹介</FormLabel>
                      <FormControl><Textarea rows={3} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={saving}>
                    {saving ? "保存中..." : "保存"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Education */}
        <TabsContent value="education">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>学歴</CardTitle>
              <Button size="sm" onClick={() => setEduDialogOpen(true)}>追加</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {educations.length === 0 ? (
                <p className="text-sm text-muted-foreground">学歴がまだ登録されていません。</p>
              ) : (
                educations.map((edu) => (
                  <div key={edu.id} className="flex items-start justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">{edu.schoolName}</p>
                      <p className="text-sm text-muted-foreground">
                        {[edu.faculty, edu.degree].filter(Boolean).join(" / ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {[edu.startDate, edu.endDate].filter(Boolean).join(" ～ ")}
                        {edu.status && ` (${statusLabels[edu.status] || edu.status})`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteItem("/api/profile/educations", edu.id, fetchEducations)}
                    >
                      削除
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <EducationFormDialog open={eduDialogOpen} onOpenChange={setEduDialogOpen} onSuccess={fetchEducations} />
        </TabsContent>

        {/* Certifications */}
        <TabsContent value="certification">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>資格</CardTitle>
              <Button size="sm" onClick={() => setCertDialogOpen(true)}>追加</Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {certifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">資格がまだ登録されていません。</p>
              ) : (
                certifications.map((cert) => (
                  <div key={cert.id} className="flex items-start justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">{cert.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {[cert.issuingOrganization, cert.acquiredDate].filter(Boolean).join(" / ")}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteItem("/api/profile/certifications", cert.id, fetchCertifications)}
                    >
                      削除
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <CertificationFormDialog open={certDialogOpen} onOpenChange={setCertDialogOpen} onSuccess={fetchCertifications} />
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>スキル</CardTitle>
              <Button size="sm" onClick={() => setSkillDialogOpen(true)}>追加</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {skillsList.length === 0 ? (
                <p className="text-sm text-muted-foreground">スキルがまだ登録されていません。</p>
              ) : (
                Object.entries(groupedSkills).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium mb-2">{category}</h4>
                    <div className="space-y-2">
                      {items.map((skill) => (
                        <div key={skill.id} className="flex items-center justify-between rounded-md border p-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{skill.name}</span>
                            {skill.level && (
                              <Badge variant="secondary" className="text-xs">
                                {levelLabels[skill.level] || skill.level}
                              </Badge>
                            )}
                            {skill.yearsOfExperience != null && (
                              <span className="text-xs text-muted-foreground">
                                {skill.yearsOfExperience}年
                              </span>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteItem("/api/profile/skills", skill.id, fetchSkills)}
                          >
                            削除
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <SkillFormDialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen} onSuccess={fetchSkills} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
