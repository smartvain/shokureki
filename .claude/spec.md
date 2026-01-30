# 職務経歴書・履歴書管理アプリ「shokureki」実装計画

## 概要
業務ツール（GitHub等）から日々の活動を自動収集し、AIが実績候補を生成。蓄積した実績から職務経歴書を自動生成するWebアプリケーション。

**コンセプト:** 「記録を意識しない」→ 業務終わりにワンクリックで活動を収集 → AIが実績化

**デプロイ先:** Vercel + Neon (PostgreSQL)
**開発:** 個人GitHub管理 / 利用: 社用PC(Mac)からブラウザアクセス

---

## ユーザージャーニー

### ジャーニー1: 初期セットアップ

```
[Vercel URLにアクセス] → [ログイン（認証）]
              │
              ▼
  [GitHubトークン設定 → 対象リポジトリ選択]
              │
              ▼
  [プロフィール入力（氏名・連絡先）]
              │
              ▼
  [職務経歴を登録（企業・期間・役職）]
              │
              ▼
  [セットアップ完了 → ダッシュボードへ]
```

**タッチポイント:** `/settings` → `/profile` → `/work-history/new`

---

### ジャーニー2: 日常の活動収集（毎日〜週数回・ワンクリック）

```
[業務終了時にアプリを開く]
              │
              ▼
  [「今日の活動を収集」ボタン]
              │
   ┌──────────┼──────────────┐
   ▼          ▼              ▼
[GitHub]  [Jira(将来)]   [手動メモ]
 PR,commit   完了チケット    議事録ペースト等
   │          │              │
   └──────────┼──────────────┘
              ▼
  [AI が活動データを分析（生データは保存しない）]
              │
              ▼
  [実績候補を提示]
  「認証フローの設計・実装を主導し、
   OAuth2.0/PKCEを採用して本番リリース」
              │
   ┌──────────┼──────────┐
   ▼          ▼          ▼
[そのまま  [編集して   [スキップ]
 保存]      保存]
```

**核心:** 生のGitHubデータ（PRタイトル等）はクラウドDBに保存しない。AIが処理した実績候補のみ保存。社内固有情報はAIが一般化した状態で保存される。

**タッチポイント:** `/` → 収集ボタン → レビューUI（同一ページ内）

---

### ジャーニー3: 実績の振り返り・整理（月1回程度）

```
[実績一覧を開く] → [蓄積された実績を確認（自動収集で溜まっている）]
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
   [説明文を加筆]   [プロジェクトに   [重要度を調整]
                     紐づけ]
           └───────────────┼───────────────┘
                           ▼
                [AI でブラッシュアップ]
```

**タッチポイント:** `/achievements`

---

### ジャーニー4: 職務経歴書の生成（転職活動開始時）

```
[書類生成] → [フォーマット選択] → [含める実績を選択]
                                       │
                                       ▼
                            [応募先企業入力（任意）]
                                       │
                                       ▼
                            [AI が職務経歴書を生成]
                                       │
                                       ▼
                            [編集 → プレビュー → PDF出力]
```

**タッチポイント:** `/documents/generate/shokumukeirekisho` → `/documents/[id]` → PDF

---

### 全体サイクル

```
┌─────────────────────────────────────────────────────────┐
│                  日常サイクル（無意識）                     │
│  ┌─────────┐    ┌──────────────┐    ┌───────────────┐   │
│  │普通に    │───▶│業務終わりに  │───▶│実績が勝手に   │   │
│  │仕事する  │    │ワンクリック  │    │溜まっていく   │   │
│  └─────────┘    └──────────────┘    └───────────────┘   │
└───────────────────────────┬─────────────────────────────┘
                            │ 転職を決意
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 転職活動サイクル                           │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│  │蓄積された│───▶│AI が     │───▶│PDF提出   │           │
│  │実績を選択│    │経歴書生成│    │          │           │
│  └──────────┘    └──────────┘    └──────────┘           │
└─────────────────────────────────────────────────────────┘
```

---

## 技術スタック

| レイヤー | 技術 | 理由 |
|---------|------|------|
| フレームワーク | Next.js (App Router) | Vercel最適、Server Components |
| 言語 | TypeScript | 型安全性 |
| DB | PostgreSQL (Neon) + Drizzle ORM | Vercelサーバーレス対応、無料枠あり |
| UI | Tailwind CSS + shadcn/ui | 高速開発 |
| フォーム | React Hook Form + Zod | バリデーション共有 |
| AI | Vercel AI SDK + OpenAI GPT-4o-mini | 日本語品質、コスト効率 |
| PDF | Puppeteer(@sparticuz/chromium) | サーバーレスPDF生成 |
| GitHub連携 | @octokit/rest | GitHub REST API |
| 認証 | NextAuth.js (GitHub OAuth) | 個人アカウント認証 |
| 日付 | date-fns | 日本語ロケール対応 |
| ホスティング | Vercel | Next.js最適、無料枠 |

---

## データフロー（プライバシー重視）

```
[GitHub API] ──fetch──▶ [メモリ上の生データ]
                              │ （DBに保存しない）
                              ▼
                        [AI 処理]
                        ・社内固有名を一般化
                        ・実績候補文を生成
                              │
                              ▼
                    [achievementCandidates]
                    （一般化済みの実績候補のみDB保存）
                              │ ユーザー承認
                              ▼
                      [achievements]
                      （確定した実績）
```

**保存されるデータ:** AI生成の実績候補テキスト（一般化済み）、プロフィール、職務経歴
**保存されないデータ:** GitHub生データ(PRタイトル、コミットメッセージ等)、APIトークン

---

## データモデル

### テーブル構成

```
serviceConnections (外部サービス接続設定: トークンは暗号化)

dailyDigests (日次ダイジェスト)
       │
       ▼
achievementCandidates (AI生成の実績候補)
       │ ユーザーが承認
       ▼
achievements (確定した実績) ──── projects (プロジェクト)

profiles (個人情報) ─┬─< educations (学歴)
                     ├─< certifications (免許・資格)
                     ├─< skills (スキル)
                     ├─< workHistories (職務経歴)
                     └─< generatedDocuments (生成書類)

users (認証ユーザー: NextAuth管理)
```

### 主要テーブル

**serviceConnections** - 外部サービス接続
- service: "github" | "jira" | "linear"
- encryptedConfig: 暗号化されたJSON（トークン、対象リポジトリ等）
- status: "active" | "inactive" | "error"

**dailyDigests** - 日次ダイジェスト
- date: YYYY-MM-DD（1日1レコード）
- summaryText: AI生成の日次サマリー（一般化済み）
- status: "collecting" | "summarizing" | "ready" | "reviewed"

**achievementCandidates** - AI生成の実績候補
- digestId: 日次ダイジェストへのFK
- title, description（職務経歴書記載形式・一般化済み）
- category: "development" | "review" | "bugfix" | "design" 等
- technologies: JSON配列
- significance: "high" | "medium" | "low"
- status: "pending" | "accepted" | "rejected" | "edited"

**achievements** - 確定した実績
- candidateId: 元の候補へのFK（手動作成はnull）
- title, description, category, technologies
- projectId: プロジェクトへのFK

---

## 活動収集の仕組み

### 収集方式: オンデマンド（ワンクリック）

ユーザーが「収集」ボタンを押した時にGitHub APIを叩き、結果をメモリ上でAI処理。

### GitHub収集データ（MVP）

| データ | API | メモリ上で処理 → AI要約 |
|--------|-----|----------------------|
| マージしたPR | `GET /repos/{owner}/{repo}/pulls` | タイトル・説明 → 実績化 |
| レビューしたPR | `GET /repos/{owner}/{repo}/pulls/{n}/reviews` | レビュー件数 → 実績化 |
| コミット | `GET /repos/{owner}/{repo}/commits` | 補完情報として使用 |
| クローズしたIssue | `GET /repos/{owner}/{repo}/issues` | バグ修正等 → 実績化 |

### AI要約プロンプト（概要）

```
あなたは職務経歴書作成のアシスタントです。
エンジニアの1日の活動データを分析し、職務経歴書に記載できる実績候補を抽出してください。

重要ルール:
- 会社固有のプロジェクト名、コードネーム、社内用語は一般的な表現に置き換える
  例: "Project Phoenix" → "社内基幹システム刷新プロジェクト"
  例: "JIRA-1234" → 削除
- 「何を」「どのように」「どんな成果」の構造で記述
- 技術キーワード（言語、フレームワーク名）は具体的に残す
- 些末な活動（typo修正等）は除外
- 関連する活動はまとめて1つの実績に

出力: JSON（dailySummary + achievementCandidates配列）
```

### 手動エントリー（フォールバック）

テキストエリアに議事録やSlackメッセージをペースト → AIが一般化して実績候補に変換。

### セキュリティ

- GitHubトークンはAES-256-GCMで暗号化してDB保存
- 暗号化キーはVercel環境変数で管理
- 認証: NextAuth.js (GitHub OAuth) で本人のみアクセス可能

---

## ページ構成

| パス | 機能 |
|------|------|
| `/` | ダッシュボード（収集ボタン・サマリー・実績候補レビュー） |
| `/achievements` | 確定済み実績一覧（フィルタ・検索・編集） |
| `/projects` | プロジェクト管理（実績のグルーピング） |
| `/profile` | プロフィール編集（個人情報・学歴・資格・スキル） |
| `/work-history` | 職務経歴一覧・編集 |
| `/documents` | 生成書類一覧 |
| `/documents/generate/shokumukeirekisho` | 職務経歴書生成ウィザード |
| `/documents/[id]` | 書類編集・プレビュー |
| `/settings` | 外部サービス接続設定 |
| `/api/auth/*` | NextAuth認証エンドポイント |

---

## MVP機能スコープ

**Phase 1 (MVP):**
- 認証（GitHub OAuth）
- GitHub連携（PR・コミット・レビュー・Issue収集）
- 手動エントリー
- ワンクリック収集 → AI処理 → 実績候補（生データ非保存）
- 実績候補のレビュー・承認UI
- 確定済み実績の管理
- プロフィール・職務経歴管理
- 職務経歴書のAI生成
- PDF出力
- Vercelデプロイ

**Phase 2:**
- Jira/Linear連携
- 週次ダイジェスト
- 実績の重複検出
- 履歴書生成・PDF出力
- 書類バージョン管理

**Phase 3:**
- ローカルLLM対応（Ollama）
- データエクスポート（JSON）
- ダークモード

---

## 実装ステップ

### Step 1: プロジェクト初期化
- `create-next-app` でプロジェクト作成
- 依存関係インストール
  - drizzle-orm, @neondatabase/serverless, zod, react-hook-form
  - shadcn/ui, @octokit/rest, ai, @ai-sdk/openai
  - next-auth, @sparticuz/chromium, puppeteer-core, date-fns
- Neon DB作成・接続設定
- Drizzle スキーマ定義・マイグレーション
- `.env.local`（DATABASE_URL, NEXTAUTH_SECRET, GITHUB_ID/SECRET, OPENAI_API_KEY, ENCRYPTION_KEY）
- git init → 個人GitHubにpush

### Step 2: 認証・レイアウト
- NextAuth.js設定（GitHub OAuthプロバイダー）
- ログイン/ログアウトフロー
- サイドバーナビゲーション（Noto Sans JP）
- 認証ガード（全ページ保護）

### Step 3: 設定画面・GitHub接続
- 設定画面UI（GitHubトークン入力、リポジトリ選択）
- トークン暗号化・DB保存
- GitHub接続テスト機能
- serviceConnectionsのCRUD

### Step 4: 活動収集・AI処理（コア）
- GitHubコレクターサービス（@octokit/rest）
- 収集API（POST /api/collect）→ メモリ上で生データ取得
- AI要約API（POST /api/summarize）→ 一般化済み実績候補のみDB保存
- ダッシュボードUI（収集ボタン・進捗・実績候補レビュー）
- 手動エントリーUI

### Step 5: 実績管理
- 候補の承認→achievements確定フロー
- 実績一覧・編集・フィルタ
- プロジェクト管理（実績のグルーピング）

### Step 6: プロフィール・職務経歴管理
- プロフィールCRUD（個人情報・学歴・資格・スキル）
- 職務経歴CRUD（企業・期間・役職）

### Step 7: 職務経歴書生成・PDF出力
- 生成ウィザードUI（フォーマット選択→実績選択→AI生成→編集→PDF）
- 職務経歴書生成プロンプト
- Puppeteer PDF生成（@sparticuz/chromium でサーバーレス対応）

### Step 8: デプロイ・仕上げ
- Vercelデプロイ設定
- 本番環境変数設定
- エラーハンドリング・ローディング状態
- トースト通知（日本語）

---

## 主要ファイル

| ファイル | 役割 |
|---------|------|
| `src/db/schema.ts` | 全テーブル定義（Drizzle + Neon） |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth認証 |
| `src/services/collectors/github.ts` | GitHub活動収集 |
| `src/services/ai/openai.ts` | AI要約・実績生成（一般化処理含む） |
| `src/services/ai/prompts.ts` | プロンプトテンプレート |
| `src/services/resume/generator.ts` | 職務経歴書生成・PDF出力 |
| `src/lib/crypto.ts` | トークン暗号化・復号 |
| `src/app/page.tsx` | ダッシュボード（収集・レビューUI） |
| `src/app/api/collect/route.ts` | 活動収集API |
| `src/app/api/summarize/route.ts` | AI要約API |

---

## 検証方法
1. Vercelにデプロイ → ブラウザからアクセス → GitHub OAuthログイン確認
2. GitHubトークン設定 → リポジトリ選択 → 接続テスト成功を確認
3. 「収集」ボタン → GitHub活動取得 → AI実績候補が生成されることを確認
4. 候補承認 → achievements確定 → 一覧に表示を確認
5. 職務経歴書生成 → PDF出力 → 日本語表示・レイアウト確認
6. 手動メモのみでの収集→AI処理フローが動作することを確認
7. DB内に生のGitHubデータが保存されていないことを確認
