interface ResumePromptInput {
  format: "reverse_chronological" | "chronological" | "career_based";
  profile: {
    lastName: string;
    firstName: string;
    summary?: string | null;
    selfIntroduction?: string | null;
  };
  workHistories: {
    companyName: string;
    companyDescription?: string | null;
    employmentType?: string | null;
    position?: string | null;
    department?: string | null;
    startDate: string;
    endDate?: string | null;
    isCurrent?: boolean | null;
    responsibilities?: string | null;
  }[];
  achievements: {
    title: string;
    description: string;
    category: string;
    technologies: string[] | null;
    period?: string | null;
    projectName?: string | null;
  }[];
  skills: {
    category: string;
    name: string;
    level?: string | null;
    yearsOfExperience?: number | null;
  }[];
  targetCompany?: string;
  targetPosition?: string;
}

function formatLabel(format: string): string {
  switch (format) {
    case "reverse_chronological":
      return "逆編年体";
    case "chronological":
      return "編年体";
    case "career_based":
      return "キャリア";
    default:
      return "逆編年体";
  }
}

export function buildResumePrompt(input: ResumePromptInput): string {
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  return `あなたは日本の職務経歴書作成の専門家です。
以下のデータを基に、${formatLabel(input.format)}形式の職務経歴書コンテンツを生成してください。

## 重要ルール
1. 日本の転職市場で通用するフォーマットに従う
2. 具体的な数値（チーム規模、期間等）を含める
3. 「何を」「どのように」「どんな成果」の構造で実績を記述
4. 技術スタック名は正確に記載
5. 匿名化済みのデータなのでそのまま使用してよい
6. 職務経歴の各社について、提供された実績データから適切なプロジェクトにまとめる
${input.targetCompany ? `7. 応募先: ${input.targetCompany}${input.targetPosition ? ` (${input.targetPosition})` : ""} に合わせた強調ポイントを選択` : ""}

## プロフィールデータ
氏名: ${input.profile.lastName} ${input.profile.firstName}
${input.profile.summary ? `職務要約: ${input.profile.summary}` : ""}
${input.profile.selfIntroduction ? `自己紹介: ${input.profile.selfIntroduction}` : ""}

## 職務経歴データ
${JSON.stringify(input.workHistories, null, 2)}

## 実績データ
${JSON.stringify(input.achievements, null, 2)}

## スキルデータ
${JSON.stringify(input.skills, null, 2)}

## 出力形式
以下のJSON形式で出力してください。各フィールドは日本語で記述してください:
{
  "title": "職務経歴書",
  "date": "${dateStr}",
  "name": "${input.profile.lastName} ${input.profile.firstName}",
  "summary": "職務要約（3-5行で経歴の概要を記述）",
  "skills": [
    { "category": "カテゴリ名", "items": ["スキル名1", "スキル名2"] }
  ],
  "workHistories": [
    {
      "companyName": "会社名",
      "period": "YYYY年MM月 ～ YYYY年MM月",
      "employmentType": "雇用形態",
      "position": "役職",
      "department": "部署",
      "companyDescription": "会社概要（1文）",
      "projects": [
        {
          "name": "プロジェクト名",
          "period": "YYYY年MM月 ～ YYYY年MM月",
          "role": "担当役割",
          "teamSize": "チーム規模",
          "description": "プロジェクト概要",
          "achievements": ["実績1（具体的に）", "実績2"],
          "technologies": ["技術1", "技術2"]
        }
      ]
    }
  ],
  "selfPR": "自己PR（3-5行）"
}

JSONのみ出力してください。マークダウンのコードブロックは不要です。`;
}

export type { ResumePromptInput };
