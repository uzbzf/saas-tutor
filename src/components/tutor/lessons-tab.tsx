"use client";

import * as React from "react";
import { BookOpen, CheckCircle2, Lock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LESSONS, type LessonItem } from "@/lib/curriculum";
import type { UsageStatus } from "@/lib/usage";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function LessonsTab({
  usage,
  completedSlugs,
  onLessonCompleted,
}: {
  usage: UsageStatus;
  completedSlugs: string[];
  onLessonCompleted: (slug: string, updatedUsage?: UsageStatus) => void;
}) {
  const [selected, setSelected] = React.useState<LessonItem>(LESSONS[0]);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [interactionId, setInteractionId] = React.useState<string | undefined>();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function selectLesson(lesson: LessonItem) {
    setSelected(lesson);
    setMessages([
      {
        role: "assistant",
        content: `Тема урока: ${lesson.titleEn} (${lesson.titleRu}).\n${lesson.promptHint}\n\nНапишите 1–2 предложения на английском, и мы начнём практику!`,
      },
    ]);
    setInteractionId(undefined);
    setError(null);
  }

  React.useEffect(() => {
    selectLesson(LESSONS[0]);
  }, []);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setLoading(true);
    setError(null);

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "LESSON",
          message: `Lesson: ${selected.titleEn}. Student says: ${userText}`,
          previousInteractionId: interactionId,
          timezone: tz,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка запроса к AI-репетитору");
      } else {
        setInteractionId(data.interactionId);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  async function markComplete() {
    const res = await fetch("/api/lessons/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonSlug: selected.slug, score: 100 }),
    });
    const data = await res.json();
    if (res.ok) {
      onLessonCompleted(selected.slug, data.usage);
    } else {
      setError(data.error || "Не удалось завершить урок");
    }
  }

  const isLocked = !selected.isFree && usage.plan !== "PRO";

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-3 lg:col-span-5">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg">Программа уроков</h3>
          {usage.plan === "FREE" && (
            <Badge variant="outline">
              Пройдено: {usage.completedFreeLessons} / {usage.freeLessonsLimit} бесплатно
            </Badge>
          )}
        </div>

        <div className="space-y-2.5">
          {LESSONS.map((lesson) => {
            const locked = !lesson.isFree && usage.plan !== "PRO";
            const done = completedSlugs.includes(lesson.slug);
            const active = selected.slug === lesson.slug;

            return (
              <button
                key={lesson.slug}
                type="button"
                onClick={() => selectLesson(lesson)}
                className={`w-full rounded-xl border p-3.5 text-left transition-all ${
                  active
                    ? "border-[#6F5B42] bg-[#6F5B42]/10 dark:border-[#B5A892] dark:bg-[#B5A892]/10"
                    : "border-border bg-card hover:bg-secondary/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {lesson.topic}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {done && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {locked ? (
                      <Badge variant="secondary" className="text-[10px]">
                        <Lock className="mr-1 h-2.5 w-2.5" /> Pro
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">
                        Free
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-1 font-semibold text-sm">{lesson.titleRu}</div>
                <div className="text-xs text-muted-foreground">{lesson.titleEn}</div>
              </button>
            );
          })}
        </div>
      </div>

      <Card className="lg:col-span-7 flex flex-col">
        <CardHeader className="border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="font-heading text-xl flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#6F5B42] dark:text-[#B5A892]" />
                {selected.titleRu}
              </CardTitle>
              <CardDescription className="mt-1">
                {selected.descriptionRu}
              </CardDescription>
            </div>
            {!isLocked && (
              <Button
                size="sm"
                variant="outline"
                onClick={markComplete}
                disabled={completedSlugs.includes(selected.slug)}
              >
                {completedSlugs.includes(selected.slug)
                  ? "Урок пройден"
                  : "Завершить урок"}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-4 pt-4">
          {isLocked ? (
            <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <Lock className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="font-semibold">Этот урок доступен на тарифе Pro</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                На бесплатном тарифе доступно 5 базовых уроков. Перейдите на Pro для полной программы.
              </p>
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "ml-auto max-w-[85%] bg-[#6F5B42] text-[#F4F3F0] dark:bg-[#B5A892] dark:text-[#15160A]"
                        : "mr-auto max-w-[90%] border border-border bg-secondary/40"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-xs font-medium text-destructive">{error}</p>
              )}

              <form onSubmit={sendMessage} className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Напишите ответ на английском..."
                  className="min-h-[60px] resize-none"
                  disabled={loading || usage.limitReached}
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim() || usage.limitReached}
                  className="self-end bg-[#6F5B42] text-[#F4F3F0] hover:bg-[#5B4A35] dark:bg-[#B5A892] dark:text-[#15160A]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
