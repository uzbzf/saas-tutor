"use client";

import * as React from "react";
import { Mic, MicOff, Volume2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProGateCard } from "@/components/tutor/pro-gate-card";
import type { UsageStatus } from "@/lib/usage";

const SAMPLE_PHRASES = [
  "Could you tell me how to get to the central station?",
  "I've been working on this project for the last three months.",
  "Although the weather was unpredictable, we thoroughly enjoyed our trip.",
];

export function ProSpeakingTab({ usage }: { usage: UsageStatus }) {
  const [targetPhrase, setTargetPhrase] = React.useState(SAMPLE_PHRASES[0]);
  const [transcript, setTranscript] = React.useState("");
  const [listening, setListening] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  if (usage.plan !== "PRO") {
    return (
      <ProGateCard
        title="Speaking и проверка произношения"
        description="Тренируйте разговорную речь с микрофоном, получайте фонетический разбор (IPA) и оценку произношения от AI."
      />
    );
  }

  function speakSample() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(targetPhrase);
    utter.lang = "en-US";
    utter.rate = 0.92;
    window.speechSynthesis.speak(utter);
  }

  function startRecognition() {
    if (typeof window === "undefined") return;
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown })
        .webkitSpeechRecognition;

    if (!SpeechRec) {
      setError(
        "Распознавание речи не поддерживается в этом браузере. Вы можете ввести произнесённую фразу вручную."
      );
      return;
    }

    const recognition = new SpeechRec() as {
      lang: string;
      interimResults: boolean;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onerror: () => void;
      onend: () => void;
      start: () => void;
    };

    recognition.lang = "en-US";
    recognition.interimResults = false;
    setListening(true);
    setError(null);

    recognition.onresult = (event) => {
      const text = event.results[0]?.[0]?.transcript ?? "";
      setTranscript(text);
    };
    recognition.onerror = () => {
      setListening(false);
      setError("Не удалось записать голос. Проверьте доступ к микрофону.");
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  }

  async function evaluatePronunciation() {
    if (!transcript.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "SPEAKING",
          message: `Target sentence: "${targetPhrase}". Student spoken transcript: "${transcript}". Evaluate pronunciation, missing/misheard words, stress tips with IPA, and give a score 0-100.`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка оценки");
      } else {
        setFeedback(data.reply);
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            Speaking & Произношение
          </CardTitle>
          <CardDescription>
            Прослушайте эталон, произнесите фразу в микрофон и получите разбор от AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PHRASES.map((p, idx) => (
              <Button
                key={idx}
                size="sm"
                variant={targetPhrase === p ? "default" : "outline"}
                onClick={() => setTargetPhrase(p)}
              >
                Фраза {idx + 1}
              </Button>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-secondary/40 p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Произнесите вслух:
            </div>
            <p className="font-semibold text-base">{targetPhrase}</p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 px-2"
              onClick={speakSample}
            >
              <Volume2 className="mr-1.5 h-4 w-4" />
              Прослушать эталон
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={listening ? "destructive" : "outline"}
              onClick={startRecognition}
              disabled={listening}
            >
              {listening ? (
                <>
                  <MicOff className="mr-2 h-4 w-4" /> Слушаю...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" /> Записать голос
                </>
              )}
            </Button>

            <Button
              onClick={evaluatePronunciation}
              disabled={!transcript.trim() || loading}
              className="bg-[#6F5B42] text-[#F4F3F0] hover:bg-[#5B4A35] dark:bg-[#B5A892] dark:text-[#15160A]"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {loading ? "Анализируем..." : "Оценить произношение"}
            </Button>
          </div>

          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Распознанная речь появится здесь (или введите вручную)..."
            rows={3}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            Фонетический разбор
          </CardTitle>
          <CardDescription>
            Оценка точности, ударения, IPA-транскрипция и советы
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedback ? (
            <div className="rounded-xl border border-border bg-secondary/30 p-4 text-sm whitespace-pre-wrap leading-relaxed">
              {feedback}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Запишите или введите фразу и нажмите «Оценить произношение».
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
