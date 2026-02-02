import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { RawActivity } from "@/services/collectors/github";
import { buildDailySummaryPrompt } from "./prompts";

export interface AchievementCandidateResult {
  title: string;
  description: string;
  category: string;
  technologies: string[];
  significance: "high" | "medium" | "low";
}

export interface DailySummaryResult {
  dailySummary: string;
  achievementCandidates: AchievementCandidateResult[];
}

export async function summarizeActivities(
  activities: RawActivity[],
  manualNotes?: string
): Promise<DailySummaryResult> {
  if (activities.length === 0 && !manualNotes) {
    return {
      dailySummary: "今日の活動データがありません。",
      achievementCandidates: [],
    };
  }

  const prompt = buildDailySummaryPrompt(activities, manualNotes);

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt,
  });

  // Parse JSON from response (handle markdown code blocks)
  const jsonStr = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  const result = JSON.parse(jsonStr) as DailySummaryResult;

  return result;
}
