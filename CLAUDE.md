# CLAUDE.md - shokureki

## プロジェクト概要

日々のGitHub活動をAIで実績化し、職務経歴書を自動生成するNext.jsアプリ。
詳細仕様は `.claude/spec.md` を参照。

## コマンド

```bash
pnpm dev           # 開発サーバー起動
pnpm build         # 本番ビルド
pnpm lint          # ESLint
pnpm format        # Prettier整形
pnpm format:check  # Prettier確認
pnpm type-check    # tsc --noEmit
pnpm test          # Vitest実行
pnpm test:watch    # Vitest監視モード
```

## DBスキーマ変更

スキーマは `src/db/schema.ts` に定義。変更後は `drizzle-kit push` で反映（マイグレーションファイル不要）。

```bash
npx drizzle-kit push
```

## 技術スタック

- **フレームワーク:** Next.js 16 (App Router) + React 19 + TypeScript
- **DB:** Drizzle ORM + Neon PostgreSQL
- **認証:** NextAuth v5 (GitHub OAuth) + Drizzle Adapter
- **AI:** Vercel AI SDK + OpenAI GPT-4o-mini
- **UI:** Tailwind CSS v4 + shadcn/ui (new-york) + Lucide icons
- **フォーム:** React Hook Form + Zod
- **PDF:** @react-pdf/renderer
- **GitHub API:** @octokit/rest
- **パッケージ管理:** pnpm

## アーキテクチャ

### データフロー（プライバシー重要）

```
GitHub API → メモリ上のみ（RawActivity） → AI処理 → DBに保存（一般化済みテキストのみ）
```

- 生のGitHub活動データはDBに保存しない
- AIが匿名化・一般化したテキストのみ永続化
- GitHubトークンはAES-256-GCMで暗号化して保存

### 3段パイプライン

1. `dailyDigests` - 日次の活動サマリー（AI生成）
2. `achievementCandidates` - AI生成の実績候補（ユーザーがレビュー）
3. `achievements` - 承認済み実績（職務経歴書の素材）

### ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── (authenticated)/    # 認証必須ページ群
│   ├── api/                # APIルート
│   └── login/              # ログインページ
├── components/
│   ├── ui/                 # shadcn/ui コンポーネント
│   ├── layout/             # サイドバー・認証ガード
│   └── [feature]/          # 機能別コンポーネント
├── db/                     # Drizzle スキーマ・接続
├── lib/                    # ユーティリティ（auth, crypto, validations）
├── services/
│   ├── ai/                 # AIプロンプト・OpenAI呼び出し
│   ├── collectors/         # GitHub活動収集
│   └── resume/             # 職務経歴書生成・PDFテンプレート
└── types/                  # 共通型定義
```

## コーディング規約

- 言語は日本語（UI、コメント、コミットメッセージ以外）
- UIテキスト・プレースホルダーは日本語
- パス `@/*` → `src/*`
- pre-commit hookで prettier + eslint が自動実行される
- ローディング状態は `Skeleton` コンポーネントを使用（スピナーではなく）
- セレクトボックスのフィルターは初期値を空にしてプレースホルダー表示

## 環境変数

```
DATABASE_URL          # Neon PostgreSQL接続文字列
AUTH_SECRET           # NextAuth セッション暗号化キー
NEXTAUTH_URL          # コールバックURL
AUTH_GITHUB_ID        # GitHub OAuth Client ID
AUTH_GITHUB_SECRET    # GitHub OAuth Client Secret
OPENAI_API_KEY        # OpenAI APIキー
ENCRYPTION_KEY        # GitHubトークン暗号化キー（32bytes hex）
```

## Git運用

- メインブランチ: `main`
- 機能ブランチ: `feat/xxx` で作業し、PRを作成してマージ
- コミットメッセージ: `feat:` / `fix:` / `refactor:` 等の prefix
- CI: push/PR時に format → lint → type-check → test → build が実行される
