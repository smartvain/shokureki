"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Shokureki</CardTitle>
          <CardDescription>業務実績を自動収集し、職務経歴書を生成するアプリ</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => signIn("github", { callbackUrl: "/" })}>
            GitHubでログイン
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
