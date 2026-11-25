"use client";

import * as React from "react";
import { HelpCircle, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UsageStatus } from "@/lib/usage";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanationRu: string;
}

const QUIZ_TOPICS = [
  "Времена глаголов (Tenses)",
  "Правописание (Spelling)",
  "Артикли и предлоги",
  "Лексика и фразовые глаголы",
];

export function QuizTab({ usage }: { usage: UsageStatus }) {
  const [topic, setTopic] = React.useState(QUIZ_TOPICS[0]);
  const [questions, setQuestions] = React.useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function generateQuiz(selectedTopic = topic) {
    setLoading(true);
    setError(null);
    setAnswers({});
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch("/api/tutor/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic, timezone: tz }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка генерации квиза");
      } else {
        setQuestions(data.questions || []);
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    generateQuiz(QUIZ_TOPICS[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answeredCount = Object.keys(answers).length;
  const correctCount = questions.filter(
    (q) => answers[q.id] === q.correctIndex
  ).length;

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="font-heading text-xl flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#6F5B42] dark:text-[#B5A892]" />
              Квизы и задачи по уровню
            </CardTitle>
            <CardDescription>
              Интерактивные задания на грамматику, лексику и правописание
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {questions.length > 0 && (
              <Badge variant="outline">
                Верно: {correctCount} / {questions.length}
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => generateQuiz(topic)}
              disabled={loading || usage.limitReached}
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Новый квиз
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-3">
          {QUIZ_TOPICS.map((t) => (
            <Button
              key={t}
              size="sm"
              variant={topic === t ? "default" : "secondary"}
              className={
                topic === t
                  ? "bg-[#6F5B42] text-[#F4F3F0] dark:bg-[#B5A892] dark:text-[#15160A]"
                  : ""
              }
              onClick={() => {
                setTopic(t);
                generateQuiz(t);
              }}
              disabled={loading || usage.limitReached}
            >
              {t}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {questions.map((q, idx) => {
          const picked = answers[q.id];
          const isAnswered = picked !== undefined;

          return (
            <div key={q.id} className="space-y-3 rounded-xl border border-border p-4">
              <div className="font-semibold text-sm">
                {idx + 1}. {q.question}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctIndex;
                  const isSelected = picked === optIdx;
                  let btnClass = "justify-start text-left h-auto py-2.5 px-3";
                  if (isAnswered) {
                    if (isCorrect) {
                      btnClass += " border-emerald-500 bg-emerald-500/15 text-foreground";
                    } else if (isSelected) {
                      btnClass += " border-red-500 bg-red-500/15 text-foreground";
                    }
                  }

                  return (
                    <Button
                      key={optIdx}
                      variant="outline"
                      className={btnClass}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                      }
                      disabled={isAnswered}
                    >
                      <span className="flex items-center gap-2">
                        {isAnswered && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                        )}
                        <span>{opt}</span>
                      </span>
                    </Button>
                  );
                })}
              </div>

              {isAnswered && (
                <p className="text-xs text-muted-foreground bg-secondary/40 rounded-lg p-2.5">
                  {q.explanationRu}
                </p>
              )}
            </div>
          );
        })}

        {answeredCount === questions.length && questions.length > 0 && (
          <div className="rounded-xl bg-[#6F5B42]/10 dark:bg-[#B5A892]/10 p-4 text-sm font-medium">
            Квиз завершён! Результат: {correctCount} из {questions.length}. Нажмите «Новый квиз» для следующей серии задач.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
