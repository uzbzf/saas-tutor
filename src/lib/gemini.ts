import { GoogleGenAI } from "@google/genai";
import { getLevelInfo } from "@/lib/curriculum";

export const GEMINI_MODEL = "gemini-3.5-flash-lite";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export function buildLevelSystemPrompt(level: string, mode: string): string {
  const info = getLevelInfo(level);

  const levelGuidance: Record<string, string> = {
    BEGINNER:
      "Use simple A1-A2 English vocabulary and short sentences. Provide clear explanations and translations in Russian so the student feels comfortable.",
    INTERMEDIATE:
      "Use natural B1-B2 English. Give explanations in Russian when clarifying tricky grammar or mistakes, but encourage English dialogue.",
    ADVANCED:
      "Use rich C1 English with idioms, collocations, and nuanced grammar. Keep feedback mostly in English with concise Russian notes only for subtle rules.",
    EXPERT:
      "Use C2 native-level English. Focus on rhetorical polish, register, subtle lexical precision, and stylistic nuance.",
  };

  const modeGuidance: Record<string, string> = {
    LESSON:
      "Act as an encouraging personal English tutor guiding the user through the lesson topic. Ask one engaging question at a time and gently correct mistakes.",
    GRAMMAR:
      "Check the user's English text for grammar and spelling mistakes. First show the corrected version, then explain each mistake clearly in Russian, and give 1 short practice task.",
    QUIZ:
      "Generate level-appropriate English quiz questions and tasks.",
    SPEAKING:
      "Evaluate the user's spoken English transcript. Assess fluency, natural phrasing, pronunciation/stress tips (with IPA for tricky words), and give a score out of 100.",
    ERROR_ANALYSIS:
      "Perform a deep, structured error breakdown (Разбор ошибок) covering: 1) Grammar, 2) Vocabulary & Collocations, 3) Spelling/Punctuation, 4) Style & Naturalness, plus a polished native-sounding rewrite.",
    READING:
      "Generate a short, engaging English reading passage matched to the student's level with 3 comprehension questions and key vocabulary with Russian translations.",
    LISTENING:
      "Generate a natural English dialogue or monologue for listening practice, followed by 3 comprehension questions.",
  };

  return `You are LEXIS AI, a personal English language tutor.
Student level: ${info.labelRu} (${info.cefr}).
Level instructions: ${levelGuidance[info.id] ?? levelGuidance.BEGINNER}
Mode: ${mode}.
Task instructions: ${modeGuidance[mode] ?? modeGuidance.LESSON}
Keep responses concise, structured, and encouraging.`;
}

export async function runTutorInteraction(params: {
  level: string;
  mode: string;
  input: string;
  previousInteractionId?: string;
}): Promise<{ text: string; interactionId?: string; isDemoFallback?: boolean }> {
  const client = getGeminiClient();
  const systemInstruction = buildLevelSystemPrompt(params.level, params.mode);

  if (!client) {
    return {
      isDemoFallback: true,
      text: `[Демо-режим: добавьте GEMINI_API_KEY в .env.local для живых ответов ${GEMINI_MODEL}]\n\nУровень: ${getLevelInfo(params.level).labelRu} (${getLevelInfo(params.level).cefr})\n\nПример разбора вашего запроса:\n• Отличная попытка! Старайтесь обращать внимание на порядок слов и артикли (a / the).\n• Попробуйте переформулировать мысль с использованием вводной фразы: "In my opinion, ..."`,
    };
  }

  const interaction = await client.interactions.create({
    model: GEMINI_MODEL,
    system_instruction: systemInstruction,
    input: params.input,
    ...(params.previousInteractionId
      ? { previous_interaction_id: params.previousInteractionId }
      : {}),
  });

  return {
    text: interaction.output_text ?? "Не удалось получить ответ от репетитора.",
    interactionId: interaction.id,
  };
}

export async function generateStructuredJSON<T>(params: {
  level: string;
  mode: string;
  prompt: string;
  fallback: T;
}): Promise<{ data: T; isDemoFallback?: boolean }> {
  const client = getGeminiClient();
  if (!client) {
    return { data: params.fallback, isDemoFallback: true };
  }

  const systemInstruction =
    buildLevelSystemPrompt(params.level, params.mode) +
    "\nCRITICAL: Respond ONLY with valid JSON. Do not wrap in markdown code fences.";

  const interaction = await client.interactions.create({
    model: GEMINI_MODEL,
    system_instruction: systemInstruction,
    input: params.prompt,
  });

  const raw = (interaction.output_text ?? "").trim();
  try {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");
    return { data: JSON.parse(cleaned) as T };
  } catch {
    return { data: params.fallback };
  }
}
