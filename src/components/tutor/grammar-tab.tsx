"use client";

import * as React from "react";
import { SpellCheck, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UsageStatus } from "@/lib/usage";

export function GrammarTab({ usage }: { usage: UsageStatus }) {
  const [text, setText] = React.useState(
    "Yesterday I go to the store and buyed some apples, but I didn't saw my friend."
  );
  const [result, setResult] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"GRAMMAR" | "ERROR_ANALYSIS">("GRAMMAR");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function runCheck(selectedMode: "GRAMMAR" | "ERROR_ANALYSIS") {
    if (!text.trim() || loading) return;
    setMode(selectedMode);
    setLoading(true);
    setError(null);

    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: selectedMode,
          message: text,
          timezone: tz,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка проверки");
      } else {
        setResult(data.reply);
      }
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl flex items-center gap-2">
            <SpellCheck className="h-5 w-5 text-[#6F5B42] dark:text-[#B5A892]" />
            Грамматика и правописание
          </CardTitle>
          <CardDescription>
            Введите предложение или абзац на английском — Gemini 3.5 Flash-Lite проверит ошибки и объяснит правила.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            placeholder="Введите текст на английском..."
          />

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => runCheck("GRAMMAR")}
              disabled={loading || usage.limitReached}
              className="bg-[#6F5B42] text-[#F4F3F0] hover:bg-[#5B4A35] dark:bg-[#B5A892] dark:text-[#15160A]"
            >
              {loading && mode === "GRAMMAR"
                ? "Проверяем..."
                : "Проверить грамматику (Free)"}
            </Button>

            <Button
              variant="outline"
              onClick={() => runCheck("ERROR_ANALYSIS")}
              disabled={loading || usage.plan !== "PRO"}
              title={
                usage.plan !== "PRO"
                  ? "Глубокий разбор ошибок доступен на тарифе Pro"
                  : undefined
              }
            >
              {usage.plan !== "PRO" ? (
                <Lock className="mr-2 h-3.5 w-3.5" />
              ) : (
                <Sparkles className="mr-2 h-3.5 w-3.5" />
              )}
              Глубокий разбор ошибок
              <Badge variant="secondary" className="ml-2 text-[10px]">
                Pro
              </Badge>
            </Button>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Результат разбора</CardTitle>
          <CardDescription>
            Исправленный вариант, пояснения правил и рекомендации
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="rounded-xl border border-border bg-secondary/30 p-4 text-sm whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Нажмите «Проверить грамматику», чтобы увидеть подробный ответ AI-репетитора.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
