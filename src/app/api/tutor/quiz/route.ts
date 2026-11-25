import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { syncAndGetUserUsage } from "@/lib/usage";
import { generateStructuredJSON } from "@/lib/gemini";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanationRu: string;
}

const FALLBACK_QUIZ: Record<string, QuizQuestion[]> = {
  BEGINNER: [
    {
      id: "q1",
      question: "Choose the correct sentence:",
      options: [
        "She go to school every day.",
        "She goes to school every day.",
        "She going to school every day.",
        "She is go to school every day.",
      ],
      correctIndex: 1,
      explanationRu: "В Present Simple с местоимением she/he/it к глаголу добавляется окончание -es/-s.",
    },
    {
      id: "q2",
      question: "Select the correct spelling:",
      options: ["acommodation", "accommodation", "accomodation", "acomodation"],
      correctIndex: 1,
      explanationRu: "Правильное написание: accommodation (две 'c' и две 'm').",
    },
    {
      id: "q3",
      question: "Fill in the blank: 'I ___ a cup of coffee yesterday.'",
      options: ["drink", "drank", "drunk", "drinking"],
      correctIndex: 1,
      explanationRu: "Слово yesterday указывает на Past Simple — вторая форма глагола drink это drank.",
    },
  ],
  INTERMEDIATE: [
    {
      id: "q1",
      question: "If I ___ more time, I would learn another language.",
      options: ["have", "had", "will have", "would have"],
      correctIndex: 1,
      explanationRu: "Второе условное наклонение (Second Conditional): If + Past Simple, ... would + V1.",
    },
    {
      id: "q2",
      question: "Choose the correct phrasal verb: 'We had to ___ the meeting until Friday.'",
      options: ["put off", "put on", "put out", "put up"],
      correctIndex: 0,
      explanationRu: "Put off означает «отложить» событие на более поздний срок.",
    },
    {
      id: "q3",
      question: "Select the correctly spelled word:",
      options: ["definately", "definitly", "definitely", "definetely"],
      correctIndex: 2,
      explanationRu: "Правильное написание: definitely (от корня finite).",
    },
  ],
  ADVANCED: [
    {
      id: "q1",
      question: "Rarely ___ such a compelling argument.",
      options: ["I have heard", "have I heard", "I heard", "did I heard"],
      correctIndex: 1,
      explanationRu: "После отрицательных наречий в начале предложения (Rarely) используется инверсия: have I heard.",
    },
    {
      id: "q2",
      question: "The committee's decision was ___ by the lack of empirical evidence.",
      options: ["undermined", "underlined", "undertaken", "understated"],
      correctIndex: 0,
      explanationRu: "Undermine означает «подорвать» или ослабить обоснованность решения.",
    },
  ],
  EXPERT: [
    {
      id: "q1",
      question: "His ___ prose often alienated casual readers while delighting literary critics.",
      options: ["pellucid", "abstruse", "ephemeral", "gregarious"],
      correctIndex: 1,
      explanationRu: "Abstruse означает «трудный для понимания, замысловатый».",
    },
    {
      id: "q2",
      question: "Had it not been for her swift intervention, the negotiations ___.",
      options: [
        "would collapse",
        "would have collapsed",
        "had collapsed",
        "will have collapsed",
      ],
      correctIndex: 1,
      explanationRu: "Инвертированный Third Conditional: Had it not been..., ... would have + V3.",
    },
  ],
};

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { topic = "Грамматика и правописание", timezone } = await req.json();
  const usage = await syncAndGetUserUsage(user.id, timezone);
  if (usage?.limitReached) {
    return NextResponse.json(
      { error: "Дневной лимит (10 минут) исчерпан.", limitReached: true },
      { status: 429 }
    );
  }

  const fallback = FALLBACK_QUIZ[user.level] ?? FALLBACK_QUIZ.BEGINNER;

  const { data, isDemoFallback } = await generateStructuredJSON<{
    questions: QuizQuestion[];
  }>({
    level: user.level,
    mode: "QUIZ",
    prompt: `Create 3 multiple-choice English quiz questions on topic "${topic}" for level ${user.level}.
Return JSON strictly matching:
{
  "questions": [
    {
      "id": "q1",
      "question": "English question text",
      "options": ["opt1", "opt2", "opt3", "opt4"],
      "correctIndex": 0,
      "explanationRu": "Краткое объяснение на русском"
    }
  ]
}`,
    fallback: { questions: fallback },
  });

  return NextResponse.json({
    questions: data.questions ?? fallback,
    isDemoFallback: isDemoFallback ?? false,
  });
}
