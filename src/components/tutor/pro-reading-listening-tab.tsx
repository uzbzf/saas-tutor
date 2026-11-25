"use client";

import * as React from "react";
import { Headphones, BookOpenCheck, Volume2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProGateCard } from "@/components/tutor/pro-gate-card";
import type { UsageStatus } from "@/lib/usage";

interface ExerciseData {
  title: string;
  text: string;
  vocabulary: Array<{ word: string; translation: string }>;
  questions: Array<{
    question: string;
    options: string[];
    correctIndex: number;
  }>;
}

export function ProReadingListeningTab({ usage }: { usage: UsageStatus }) {
  const [kind, setKind] = React.useState<"READING" | "LISTENING">("READING");
  const [exercise, setExercise] = React.useState<ExerciseData | null>(null);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [loading, setLoading] = React.useState(false);

  async function loadExercise(nextKind: "READING" | "LISTENING") {
    setKind(nextKind);
    setLoading(true);
    setAnswers({});
    try {
      const res = await fetch("/api/tutor/reading-listening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: nextKind }),
      });
      if (res.ok) {
        const data = await res.json();
        setExercise(data.exercise);
      }
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (usage.plan === "PRO") {
      loadExercise("READING");
    }
  }, [usage.plan]);

  if (usage.plan !== "PRO") {
    return (
      <ProGateCard
        title="Reading & Listening практика"
        description="Тексты и аудиодиалоги, адаптированные под ваш уровень, со словарём и проверкой понимания."
      />
    );
  }

  function playAudio() {
    if (!exercise || typeof window === "undefined" || !("speechSynthesis" in window))
      return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(exercise.text);
    utter.lang = "en-US";
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  }

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle className="font-heading text-xl">
              Reading & Listening
            </CardTitle>
            <CardDescription>
              Упражнения на понимание текста и речи носителей
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={kind === "READING" ? "default" : "outline"}
              onClick={() => loadExercise("READING")}
              disabled={loading}
            >
              <BookOpenCheck className="mr-1.5 h-4 w-4" /> Reading
            </Button>
            <Button
              size="sm"
              variant={kind === "LISTENING" ? "default" : "outline"}
              onClick={() => loadExercise("LISTENING")}
              disabled={loading}
            >
              <Headphones className="mr-1.5 h-4 w-4" /> Listening
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => loadExercise(kind)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {exercise && (
          <>
            <div className="rounded-xl border border-border bg-secondary/30 p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-heading text-lg">{exercise.title}</h4>
                <Button size="sm" variant="outline" onClick={playAudio}>
                  <Volume2 className="mr-1.5 h-4 w-4" />
                  Озвучить текст
                </Button>
              </div>
              <p className="text-sm leading-relaxed">{exercise.text}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {exercise.vocabulary.map((v, i) => (
                <Badge key={i} variant="secondary" className="py-1 px-3 text-xs">
                  <strong>{v.word}</strong> — {v.translation}
                </Badge>
              ))}
            </div>

            <div className="space-y-4">
              {exercise.questions.map((q, qIdx) => {
                const picked = answers[qIdx];
                return (
                  <div key={qIdx} className="space-y-2 rounded-xl border border-border p-4">
                    <div className="text-sm font-semibold">{q.question}</div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, oIdx) => (
                        <Button
                          key={oIdx}
                          variant="outline"
                          className={`justify-start text-left h-auto py-2 ${
                            picked !== undefined && oIdx === q.correctIndex
                              ? "border-emerald-500 bg-emerald-500/15"
                              : picked === oIdx
                              ? "border-red-500 bg-red-500/15"
                              : ""
                          }`}
                          disabled={picked !== undefined}
                          onClick={() =>
                            setAnswers((prev) => ({ ...prev, [qIdx]: oIdx }))
                          }
                        >
                          {opt}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
