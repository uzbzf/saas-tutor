"use client";

import * as React from "react";
import { Crown, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProGateCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);

  async function handleUpgrade() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setMessage(data.error || "Не удалось открыть оплату Stripe");
      }
    } catch {
      setMessage("Ошибка соединения со Stripe");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-2 border-dashed border-[#6F5B42]/50 dark:border-[#B5A892]/50 bg-card">
      <CardHeader>
        <div className="flex items-center gap-2 text-[#6F5B42] dark:text-[#B5A892]">
          <Lock className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Доступно в тарифе Pro
          </span>
        </div>
        <CardTitle className="font-heading text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="grid gap-2 text-sm sm:grid-cols-2">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
            Проверка произношения и Speaking
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
            Reading & Listening практика
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
            Детальный разбор ошибок от AI
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
            Безлимитное время без сброса в полночь
          </li>
        </ul>

        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="bg-[#6F5B42] text-[#F4F3F0] hover:bg-[#5B4A35] dark:bg-[#B5A892] dark:text-[#15160A] dark:hover:bg-[#A0927A]"
        >
          <Crown className="mr-2 h-4 w-4" />
          {loading ? "Переход к Stripe..." : "Перейти на Pro через Stripe"}
        </Button>

        {message && (
          <p className="text-xs text-muted-foreground">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}
