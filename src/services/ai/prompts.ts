import type { RawActivity } from "@/services/collectors/github";

export function buildDailySummaryPrompt(activities: RawActivity[], manualNotes?: string) {
  const activityList = activities
    .map((a) => {
      let line = `- [${a.activityType}] ${a.title}`;
      if (a.body) {
        line += `\n  詳細: ${a.body.slice(0, 300)}`;
      }
      if (a.metadata.repo) {
        line += `\n  リポジトリ: ${a.metadata.repo}`;
      }
      return line;
    })
    .join("\n\n");

  const manualSection = manualNotes
    ? `\n\n## 手動メモ\n${manualNotes}`
    : "";

  return `あなたは職務経歴書作成のアシスタントです。
エンジニアの1日の活動データを分析し、職務経歴書に記載できる実績候補を抽出してください。

## 重要ルール
1. **匿名化**: 会社固有のプロジェクト名、コードネーム、社内用語は一般的な表現に置き換えてください
   - 例: "Project Phoenix" → "社内基幹システム刷新プロジェクト"
   - 例: "JIRA-1234" → 削除
   - 例: "hogehoge-service" → "マイクロサービス"
2. **構造**: 「何を」「どのように」「どんな成果/インパクト」の構造で記述
3. **技術キーワード**: プログラミング言語、フレームワーク名は具体的に残す
4. **除外**: typo修正、README更新等の些末な活動は除外
5. **統合**: 関連する活動は1つの実績にまとめる
6. **言語**: 日本語で出力

## 活動データ
${activityList}${manualSection}

## 出力形式
以下のJSON形式で出力してください:
{
  "dailySummary": "今日の活動の概要（3-5行の日本語テキスト）",
  "achievementCandidates": [
    {
      "title": "実績の短いタイトル（20文字以内）",
      "description": "職務経歴書に記載できる形式の実績文（2-3文）",
      "category": "development | review | bugfix | design | documentation | communication | leadership",
      "technologies": ["React", "TypeScript"],
      "significance": "high | medium | low"
    }
  ]
}

活動がない場合や実績にならない些末な内容のみの場合は、achievementCandidatesを空配列にしてください。`;
}
