"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface RepoInfo {
  fullName: string;
  selected: boolean;
}

interface ConnectionStatus {
  connected: boolean;
  username?: string;
  repos: RepoInfo[];
}

export default function SettingsPage() {
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    const res = await fetch("/api/settings/github");
    if (res.ok) {
      const data = await res.json();
      setStatus(data);
    }
  }

  async function handleSaveToken() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "GitHubトークンを保存しました" });
        setToken("");
        setStatus(data);
      } else {
        setMessage({ type: "error", text: data.error || "保存に失敗しました" });
      }
    } catch {
      setMessage({ type: "error", text: "通信エラーが発生しました" });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/github/test", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `接続成功: ${data.username}` });
        await fetchStatus();
      } else {
        setMessage({ type: "error", text: data.error || "接続テストに失敗しました" });
      }
    } catch {
      setMessage({ type: "error", text: "通信エラーが発生しました" });
    } finally {
      setTesting(false);
    }
  }

  async function handleToggleRepo(repoFullName: string) {
    const res = await fetch("/api/settings/github/repos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoFullName }),
    });
    if (res.ok) {
      await fetchStatus();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">設定</h1>
        <p className="text-muted-foreground">外部サービスの接続設定</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>GitHub連携</CardTitle>
          <CardDescription>
            Personal Access Tokenを設定して、GitHubの活動を収集できるようにします。
            トークンには repo スコープが必要です。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.connected && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">接続済み</Badge>
              <span className="text-sm text-muted-foreground">
                {status.username}
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="github-token">Personal Access Token</Label>
            <div className="flex gap-2">
              <Input
                id="github-token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <Button onClick={handleSaveToken} disabled={!token || saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>

          {status?.connected && (
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? "テスト中..." : "接続テスト"}
            </Button>
          )}

          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
              {message.text}
            </p>
          )}
        </CardContent>
      </Card>

      {status?.connected && status.repos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>対象リポジトリ</CardTitle>
            <CardDescription>
              活動を収集するリポジトリを選択してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {status.repos.map((repo) => (
                <div
                  key={repo.fullName}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <span className="text-sm font-medium">{repo.fullName}</span>
                  <Button
                    variant={repo.selected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleRepo(repo.fullName)}
                  >
                    {repo.selected ? "選択済み" : "選択"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
