# Shokureki

業務ツール（GitHub等）から日々の活動を自動収集し、AIが実績候補を生成。蓄積した実績から職務経歴書を自動生成するWebアプリケーション。

**[English README](../README.md)**

## コンセプト

「記録を意識しない」 — 業務終わりにワンクリックで活動を収集。AIが生データを職務経歴書に使える実績に変換。転職活動時にはボタン一つで職務経歴書が完成。

```
日常サイクル（無意識）
  普通に仕事する → 業務終わりにワンクリック → 実績が勝手に溜まっていく

転職活動サイクル
  蓄積された実績を選択 → AI が経歴書生成 → PDF出力
```

## 機能

- **ワンクリック活動収集** — GitHub の PR・コミット・レビュー・Issue を自動取得
- **AI 実績抽出** — GPT-4o-mini が活動を分析し、職務経歴書に記載できる形式で実績を生成
- **プライバシー重視** — GitHub の生データは保存しない。AI が一般化した実績候補のみ DB に保存
- **実績管理** — プロジェクト・カテゴリ・技術スタック別に整理・フィルタ
- **プロフィール管理** — 学歴・資格・スキル（カテゴリ別グループ表示）
- **職務経歴管理** — 勤務先・雇用形態・在籍中フラグ対応
- **職務経歴書生成ウィザード** — 5ステップ: フォーマット選択 → 実績選択 → AI生成 → プレビュー/編集 → 保存
- **PDF出力** — サーバーサイド PDF レンダリング（Noto Sans JP 日本語フォント対応）
- **手動エントリー** — 議事録や Slack メッセージをペーストして AI が実績化

## 技術スタック

| レイヤー       | 技術                                                 |
| -------------- | ---------------------------------------------------- |
| フレームワーク | Next.js 16 (App Router)                              |
| 言語           | TypeScript                                           |
| DB             | PostgreSQL ([Neon](https://neon.tech)) + Drizzle ORM |
| UI             | Tailwind CSS 4 + shadcn/ui                           |
| フォーム       | React Hook Form + Zod                                |
| AI             | Vercel AI SDK + OpenAI GPT-4o-mini                   |
| PDF            | @react-pdf/renderer                                  |
| GitHub連携     | @octokit/rest                                        |
| 認証           | Auth.js (GitHub OAuth)                               |
| ホスティング   | Vercel                                               |

## セットアップ

### 必要なもの

- Node.js 18+
- pnpm
- [Neon](https://neon.tech) アカウント（無料枠）
- [GitHub OAuth App](https://github.com/settings/developers)
- [OpenAI API キー](https://platform.openai.com/api-keys)

### 手順

1. **リポジトリをクローンして依存関係をインストール**

```bash
git clone https://github.com/smartvain/shokureki.git
cd shokureki
pnpm install
```

2. **`.env.local` を作成**

```bash
cp .env.example .env.local
```

各値を設定:

```env
DATABASE_URL=postgresql://...          # Neon 接続文字列
AUTH_SECRET=...                        # openssl rand -base64 32 で生成
NEXTAUTH_URL=http://localhost:3000
AUTH_GITHUB_ID=...                     # GitHub OAuth App の Client ID
AUTH_GITHUB_SECRET=...                 # GitHub OAuth App の Client Secret
OPENAI_API_KEY=sk-...                  # OpenAI API キー
ENCRYPTION_KEY=...                     # openssl rand -hex 32 で生成
```

> GitHub OAuth App の callback URL: `http://localhost:3000/api/auth/callback/github`

3. **DB スキーマを反映**

```bash
pnpm drizzle-kit push
```

4. **dev サーバーを起動**

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開く。

## 使い方

### 1. 初期設定

GitHub アカウントでログイン後、**設定**画面で GitHub の[Personal Access Token](https://github.com/settings/tokens)を入力して GitHub 連携を有効化します。

### 2. 基本情報の登録

活動収集の前に、以下の情報を登録しておきます:

- **プロフィール** — 基本情報（氏名・連絡先）、学歴、資格、スキル
- **職務経歴** — 勤務先・役職・在籍期間・業務内容
- **プロジェクト** — 担当プロジェクト（企業名・役割・チーム規模・技術スタック）

### 3. 日常: 活動を収集する

**ダッシュボード**で**「活動を収集」**をクリック。GitHub 上の直近の活動（PR・コミット・レビュー・Issue）を取得し、AI が一般化された実績候補を生成します。GitHub の生データは保存されません。

**手動エントリー**から議事録や Slack メッセージをペーストして AI に実績化させることもできます。

### 4. 実績を管理する

**実績**ページで AI が生成したエントリーを確認・編集・整理できます:

- プロジェクトへの紐付け
- カテゴリの設定（開発・レビュー・設計など）
- 技術タグの付与
- カテゴリ・期間・プロジェクトでフィルタ

### 5. 職務経歴書を生成する

**書類**→**「経歴書を生成」**で 5 ステップのウィザードを開始:

1. **フォーマット選択** — 逆編年体・編年体・キャリア別
2. **実績選択** — 経歴書に含める実績を選択
3. **AI 生成** — 応募先企業・ポジションの指定（任意）でカスタマイズ
4. **プレビュー・編集** — 生成内容の確認・調整
5. **保存** — 下書き保存 or 確定

### 6. PDF 出力

保存した書類を開き、**「PDF 出力」**をクリックすると日本語フォント対応の職務経歴書 PDF がダウンロードされます。

## プロジェクト構成

```
src/
├── app/
│   ├── (authenticated)/     # 認証必須ページ
│   │   ├── page.tsx         # ダッシュボード
│   │   ├── achievements/    # 実績管理
│   │   ├── projects/        # プロジェクト管理
│   │   ├── profile/         # プロフィール（基本情報・学歴・資格・スキル）
│   │   ├── work-history/    # 職務経歴
│   │   ├── documents/       # 書類一覧・生成ウィザード・詳細
│   │   └── settings/        # GitHub接続設定
│   ├── api/                 # API ルート
│   └── login/               # ログインページ
├── components/              # React コンポーネント
│   ├── ui/                  # shadcn/ui コンポーネント
│   ├── achievements/        # 実績フォームダイアログ
│   ├── projects/            # プロジェクトフォームダイアログ
│   ├── profile/             # 学歴・資格・スキルダイアログ
│   ├── work-history/        # 職務経歴フォームダイアログ
│   └── documents/           # ウィザードステッパー
├── db/                      # Drizzle スキーマ・設定
├── lib/                     # ユーティリティ（認証・暗号化・バリデーション）
├── services/                # ビジネスロジック
│   ├── ai/                  # 活動要約プロンプト
│   ├── collectors/          # GitHub データ収集
│   └── resume/              # 職務経歴書生成・PDF テンプレート
└── types/                   # TypeScript 型定義
```

## データフロー

```
[GitHub API] → [メモリ上の生データ] → [AI 処理]        → [一般化済み実績のみ DB 保存]
                (DB に保存しない)      (社名等を一般化)
```

## ライセンス

MIT
