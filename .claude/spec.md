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
| PDF | @react-pdf/renderer | Noto Sans JP対応、Vercelサーバーレス互換 |
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

### DB設計判断の理由

#### 全体方針: プライバシー重視の3段階パイプライン

GitHubの生データ（PRタイトル、コミットメッセージ等）はクラウドDBに保存しない方針。このため、データフローを「収集（メモリ上）→ AI処理 → 一般化済みデータのみDB保存」の3段階に設計。

#### テーブル分割の理由

**`dailyDigests` → `achievementCandidates` → `achievements` の3段階構造**
- `dailyDigests`: 「いつ収集したか」を日単位で管理。1日1レコード（userId+dateのユニーク制約）で重複収集を防止。
- `achievementCandidates`: AIが生成した実績候補。ユーザーが承認/却下するワークフローがあるため、確定実績とは別テーブルで管理。候補はダイジェストにカスケード削除で紐づく使い捨てデータ。
- `achievements`: ユーザーが承認した確定実績。長期保存対象。`candidateId`はnullable（手動作成の実績にも対応するため）。

**`profiles` 配下に `educations` / `certifications` / `skills` / `workHistories` をぶら下げる構造**
- 職務経歴書のセクション構成（個人情報・学歴・資格・スキル・職歴）にそのまま対応。
- `profiles.userId` にUNIQUE制約を設定し、1ユーザー1プロフィールを保証。
- 子テーブルは全てcascade deleteで、プロフィール削除時に一括クリーンアップ。

**`generatedDocuments` が `profiles` ではなく `userId` 直下**
- 書類はプロフィールとは異なるライフサイクルを持つ（プロフィール更新と書類更新は独立）。
- 複数書類を応募先企業・ポジション別に管理する必要があり、プロフィールに依存させると不自然。

**`serviceConnections` の暗号化設計**
- GitHubトークンを含む接続設定をJSON全体でAES-256-GCM暗号化してDB保存。
- 暗号化キーはVercel環境変数で管理し、DB漏洩時もトークンが平文で露出しない。
- `service`カラムで複数サービス（github/jira/linear）を1テーブルで管理し、将来の拡張に対応。

#### リレーション設計の理由

| リレーション | 削除時の挙動 | 理由 |
|-------------|-------------|------|
| `achievements.projectId` → `projects` | `SET NULL` | プロジェクトを削除しても実績は残すべき |
| `achievements.candidateId` → `achievementCandidates` | デフォルト（制約なし） | 候補が削除されても確定実績には影響しない |
| `educations.profileId` → `profiles` | `CASCADE` | プロフィール削除時に子データも一括削除 |
| `dailyDigests.userId` → `users` | `CASCADE` | ユーザー削除時に関連データを全て削除 |
| `accounts`/`sessions` → `users` | `CASCADE` | NextAuth管理のため、ユーザー削除で自動クリーンアップ |

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
  - next-auth, @react-pdf/renderer, date-fns
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

### Step 5: 実績管理 ✅
- 候補の承認→achievements確定フロー（Step 4 で実装済み）
- プロジェクト管理（CRUD + 実績数カウント付き一覧）
  - API: `GET/POST /api/projects`, `PATCH/DELETE /api/projects/[id]`
  - ページ: `/projects` — カード一覧・Dialog作成/編集・AlertDialog削除確認
- 実績管理（CRUD + カテゴリ/期間/プロジェクトフィルタ）
  - API: `GET/POST /api/achievements`, `PATCH/DELETE /api/achievements/[id]`
  - ページ: `/achievements` — フィルタバー・カード一覧・Dialog作成/編集・AlertDialog削除確認
  - technologies はカンマ区切りテキスト入力 → split で配列化
- Zod バリデーション: `src/lib/validations/achievement.ts`, `project.ts`
- フォームコンポーネント: `ProjectFormDialog`, `AchievementFormDialog`

### Step 6: プロフィール・職務経歴管理 ✅
- プロフィール（upsert パターン）
  - API: `GET/PUT /api/profile`
  - ページ: `/profile` — Tabs コンポーネント（基本情報・学歴・資格・スキル）
  - 基本情報: 姓名、フリガナ、生年月日、性別、メール、電話、郵便番号、住所、自己紹介、職務要約
- 学歴（CRUD）
  - API: `GET/POST/DELETE /api/profile/educations`
  - フィールド: 学校名、学部、学位、入学年月、卒業年月、状態（卒業/在学中/中退/卒業見込）
- 資格（CRUD）
  - API: `GET/POST/DELETE /api/profile/certifications`
  - フィールド: 資格名、発行機関、取得日
- スキル（CRUD + カテゴリ別グループ表示）
  - API: `GET/POST/DELETE /api/profile/skills`
  - フィールド: カテゴリ（言語/FW/ツール/DB/インフラ/その他）、名前、レベル、経験年数
- 職務経歴（CRUD）
  - API: `GET/POST /api/work-history`, `PATCH/DELETE /api/work-history/[id]`
  - ページ: `/work-history` — カード一覧・Dialog作成/編集・AlertDialog削除確認
  - isCurrent は Switch コンポーネント（ON で endDate 無効化）
  - employmentType: 正社員/契約社員/派遣社員/業務委託/パート・アルバイト/インターン
- 共通ヘルパー: `getOrCreateProfileId()` — プロフィール自動作成
- Zod バリデーション: `src/lib/validations/profile.ts`, `work-history.ts`
- フォームコンポーネント: `EducationFormDialog`, `CertificationFormDialog`, `SkillFormDialog`, `WorkHistoryFormDialog`

### Step 7: 職務経歴書生成・PDF出力 ✅
- PDF 生成方式: `@react-pdf/renderer`（Noto Sans JP フォント登録で日本語対応）
  - Puppeteer はバイナリサイズ（~50MB）が Vercel 制限に抵触するため不採用
  - `renderToBuffer()` でサーバーサイド PDF 生成（~5MB、バイナリ不要）
- AI 職務経歴書生成サービス
  - `src/services/resume/prompts.ts` — フォーマット別プロンプト（逆編年体/編年体/キャリア別）
  - `src/services/resume/generator.ts` — GPT-4o-mini で構造化 JSON（ShokumukeirekishoContent）生成
  - 応募先企業/ポジション指定時はそれに合わせた強調
- PDF テンプレート: `src/services/resume/templates/shokumukeirekisho-pdf.tsx`
  - A4、Noto Sans JP、セクション: 職務要約 → スキル → 職務経歴 → 自己PR
- API:
  - `GET /api/documents` — 書類一覧
  - `GET/PATCH/DELETE /api/documents/[id]` — 書類 CRUD
  - `POST /api/documents/generate` — AI 職務経歴書生成
  - `POST /api/documents/[id]/pdf` — PDF 生成・ダウンロード
- ページ:
  - `/documents` — 書類一覧（フォーマット/ステータス Badge、PDF 出力、削除）
  - `/documents/generate/shokumukeirekisho` — 5ステップ生成ウィザード
    1. フォーマット選択（逆編年体推奨/編年体/キャリア別）
    2. 実績選択（Checkbox + 全選択/全解除 + カテゴリフィルタ）
    3. AI生成（応募先企業/ポジション入力 → ローディング）
    4. プレビュー・編集（構造化プレビュー + セクション別インライン編集）
    5. 保存（下書き保存 or 確定保存）
  - `/documents/[id]` — 書類詳細（コンテンツ表示・PDF 出力・確定・削除）
- ダッシュボード Stats カードに実績数・書類数を反映
- Zod バリデーション: `src/lib/validations/document.ts`
- 型定義: `src/types/document.ts`（ShokumukeirekishoContent インターフェース）
- コンポーネント: `WizardStepper`

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
| `src/services/ai/prompts.ts` | プロンプトテンプレート（活動収集用） |
| `src/services/resume/prompts.ts` | 職務経歴書生成プロンプト |
| `src/services/resume/generator.ts` | AI職務経歴書生成（構造化JSON出力） |
| `src/services/resume/templates/shokumukeirekisho-pdf.tsx` | PDFテンプレート（@react-pdf/renderer） |
| `src/lib/crypto.ts` | トークン暗号化・復号 |
| `src/lib/auth-helpers.ts` | 認証ヘルパー（getAuthenticatedUserId, getOrCreateProfileId） |
| `src/lib/validations/` | Zodバリデーションスキーマ（achievement, project, profile, work-history, document） |
| `src/types/document.ts` | ShokumukeirekishoContent 型定義 |
| `src/app/(authenticated)/page.tsx` | ダッシュボード（収集・レビューUI・Stats） |
| `src/app/api/collect/route.ts` | 活動収集API |
| `src/app/api/projects/` | プロジェクトCRUD API |
| `src/app/api/achievements/` | 実績CRUD API（フィルタ対応） |
| `src/app/api/profile/` | プロフィール・学歴・資格・スキル API |
| `src/app/api/work-history/` | 職務経歴CRUD API |
| `src/app/api/documents/` | 書類一覧・CRUD・AI生成・PDF出力 API |
| `public/fonts/NotoSansJP-Regular.ttf` | PDF用日本語フォント |

---

## 検証方法
1. Vercelにデプロイ → ブラウザからアクセス → GitHub OAuthログイン確認
2. GitHubトークン設定 → リポジトリ選択 → 接続テスト成功を確認
3. 「収集」ボタン → GitHub活動取得 → AI実績候補が生成されることを確認
4. 候補承認 → achievements確定 → 一覧に表示を確認
5. 職務経歴書生成 → PDF出力 → 日本語表示・レイアウト確認
6. 手動メモのみでの収集→AI処理フローが動作することを確認
7. DB内に生のGitHubデータが保存されていないことを確認
