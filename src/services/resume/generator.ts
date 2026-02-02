import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { buildResumePrompt, type ResumePromptInput } from "./prompts";
import type { ShokumukeirekishoContent } from "@/types/document";

export async function generateResume(input: ResumePromptInput): Promise<ShokumukeirekishoContent> {
  const prompt = buildResumePrompt(input);

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt,
  });

  const jsonStr = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return JSON.parse(jsonStr) as ShokumukeirekishoContent;
}
