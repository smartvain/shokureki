# Shokureki

A web application that automatically collects daily work activities from GitHub, generates achievement summaries using AI, and produces professional Japanese resumes (職務経歴書).

**[日本語版 README](./docs/README.ja.md)**

## Concept

"Record without thinking" — One click at the end of each workday to collect activities. AI turns raw data into polished achievements. When it's time to job hunt, your resume writes itself.

```
Daily Cycle (unconscious)
  Work normally → One click at end of day → Achievements accumulate automatically

Job Search Cycle
  Select achievements → AI generates resume → Export PDF
```

## Features

- **One-click Activity Collection** — Fetches GitHub PRs, commits, reviews, and issues automatically
- **AI Achievement Extraction** — GPT-4o-mini analyzes activities and generates resume-ready descriptions
- **Privacy-First** — Raw GitHub data is never stored; only AI-processed, generalized summaries are saved
- **Achievement Management** — Organize achievements by project, category, and technology
- **Profile Management** — Education, certifications, skills with category grouping
- **Work History** — Employment records with current job tracking
- **Resume Generation Wizard** — 5-step wizard: format selection → achievement picking → AI generation → preview/edit → save
- **PDF Export** — Server-side PDF rendering with Japanese font support (Noto Sans JP)
- **Manual Entry** — Paste meeting notes or Slack messages for AI to process

## Tech Stack

| Layer     | Technology                                           |
| --------- | ---------------------------------------------------- |
| Framework | Next.js 16 (App Router)                              |
| Language  | TypeScript                                           |
| Database  | PostgreSQL ([Neon](https://neon.tech)) + Drizzle ORM |
| UI        | Tailwind CSS 4 + shadcn/ui                           |
| Forms     | React Hook Form + Zod                                |
| AI        | Vercel AI SDK + OpenAI GPT-4o-mini                   |
| PDF       | @react-pdf/renderer                                  |
| GitHub    | @octokit/rest                                        |
| Auth      | Auth.js (GitHub OAuth)                               |
| Hosting   | Vercel                                               |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- [Neon](https://neon.tech) account (free tier)
- [GitHub OAuth App](https://github.com/settings/developers)
- [OpenAI API key](https://platform.openai.com/api-keys)

### Setup

1. **Clone and install dependencies**

```bash
git clone https://github.com/smartvain/shokureki.git
cd shokureki
pnpm install
```

2. **Create `.env.local`**

```bash
cp .env.example .env.local
```

Fill in the values:

```env
DATABASE_URL=postgresql://...          # Neon connection string
AUTH_SECRET=...                        # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
AUTH_GITHUB_ID=...                     # GitHub OAuth App Client ID
AUTH_GITHUB_SECRET=...                 # GitHub OAuth App Client Secret
OPENAI_API_KEY=sk-...                  # OpenAI API key
ENCRYPTION_KEY=...                     # openssl rand -hex 32
```

> GitHub OAuth App callback URL: `http://localhost:3000/api/auth/callback/github`

3. **Push database schema**

```bash
pnpm drizzle-kit push
```

4. **Start dev server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

### 1. Initial Setup

After logging in with GitHub, go to **Settings** and connect your GitHub account by entering a [Personal Access Token](https://github.com/settings/tokens). This allows the app to fetch your work activities.

### 2. Register Your Background

Set up your base information before collecting activities:

- **Profile** — Enter basic info (name, contact), education, certifications, and skills
- **Work History** — Add your employment records (company, position, period, responsibilities)
- **Projects** — Register projects you've worked on (company, role, team size, tech stack)

### 3. Daily: Collect Activities

On the **Dashboard**, click **"Collect Activities"**. The app fetches your recent GitHub activities (PRs, commits, reviews, issues) and sends them to AI. The AI generates generalized achievement summaries — raw GitHub data is never stored.

You can also use **Manual Entry** to paste meeting notes or Slack messages for AI processing.

### 4. Manage Achievements

Go to **Achievements** to review, edit, or organize AI-generated entries. You can:

- Link achievements to projects
- Assign categories (development, review, design, etc.)
- Add technology tags
- Filter by category, period, or project

### 5. Generate Resume

Go to **Documents** → **"Generate Resume"** to start the 5-step wizard:

1. **Format** — Choose chronological (reverse), chronological, or career-based
2. **Achievements** — Select which achievements to include
3. **AI Generation** — Optionally specify a target company/position for tailored output
4. **Preview & Edit** — Review and adjust the generated content
5. **Save** — Save as draft or finalize

### 6. Export PDF

Open a saved document and click **"Export PDF"** to download a formatted Japanese resume (職務経歴書) with proper typography.

## Project Structure

```
src/
├── app/
│   ├── (authenticated)/     # Protected pages
│   │   ├── page.tsx         # Dashboard
│   │   ├── achievements/    # Achievement management
│   │   ├── projects/        # Project management
│   │   ├── profile/         # Profile (basic info, education, certs, skills)
│   │   ├── work-history/    # Work history
│   │   ├── documents/       # Document list, generation wizard, detail
│   │   └── settings/        # GitHub connection settings
│   ├── api/                 # API routes
│   └── login/               # Login page
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── achievements/        # Achievement form dialog
│   ├── projects/            # Project form dialog
│   ├── profile/             # Education, certification, skill dialogs
│   ├── work-history/        # Work history form dialog
│   └── documents/           # Wizard stepper
├── db/                      # Drizzle schema & config
├── lib/                     # Utilities (auth, crypto, validations)
├── services/                # Business logic
│   ├── ai/                  # Activity summarization prompts
│   ├── collectors/          # GitHub data collection
│   └── resume/              # Resume generation & PDF templates
└── types/                   # TypeScript type definitions
```

## Data Flow

```
[GitHub API] → [In-memory raw data] → [AI Processing] → [Generalized achievements in DB]
                (never stored)         (company names     (only AI-processed
                                        anonymized)        summaries saved)
```

## License

MIT
