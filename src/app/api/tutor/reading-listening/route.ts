import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { syncAndGetUserUsage } from "@/lib/usage";
import { generateStructuredJSON } from "@/lib/gemini";

interface ReadingListeningPayload {
  title: string;
  text: string;
  vocabulary: Array<{ word: string; translation: string }>;
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
  }>;
}

const FALLBACK_CONTENT: ReadingListeningPayload = {
  title: "The Rise of Remote Collaboration",
  text: "Over the past decade, digital tools have reshaped how teams communicate across borders. While remote work offers flexibility and access to global talent, it also requires deliberate habits: clear written updates, respectful async boundaries, and regular voice check-ins to maintain trust.",
  vocabulary: [
    { word: "reshape", translation: "перестраивать, менять форму" },
    { word: "deliberate", translation: "осознанный, намеренный" },
    { word: "boundaries", translation: "границы" },
  ],
  questions: [
    {
      question: "What is one key requirement for successful remote work mentioned in the text?",
      options: [
        "Working exclusively at night",
        "Clear written updates and regular check-ins",
        "Avoiding all video calls",
        "Hiring only local employees",
      ],
      correctIndex: 1,
    },
  ],
};

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { kind = "READING", topic = "Modern Life", timezone } = await req.json();
  const usage = await syncAndGetUserUsage(user.id, timezone);

  if (!usage || usage.plan !== "PRO") {
    return NextResponse.json(
      { error: "Модуль Reading и Listening доступен только в Pro", requiresPro: true },
      { status: 403 }
    );
  }

  const mode = kind === "LISTENING" ? "LISTENING" : "READING";
  const { data, isDemoFallback } =
    await generateStructuredJSON<ReadingListeningPayload>({
      level: user.level,
      mode,
      prompt: `Generate a ${mode} practice exercise on topic "${topic}" for level ${user.level}.
Return JSON strictly matching:
{
  "title": "Short English title",
  "text": "3-5 sentence English passage or dialogue",
  "vocabulary": [{"word": "term", "translation": "перевод на русском"}],
  "questions": [{"question": "Question in English", "options": ["A", "B", "C", "D"], "correctIndex": 0}]
}`,
      fallback: FALLBACK_CONTENT,
    });

  return NextResponse.json({
    exercise: data,
    isDemoFallback: isDemoFallback ?? false,
  });
}
