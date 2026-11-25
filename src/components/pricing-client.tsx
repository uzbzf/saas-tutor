"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PricingClient({
  isLoggedIn,
  currentPlan,
}: {
  isLoggedIn: boolean;
  currentPlan?: string;
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Ошибка Stripe Checkout");
      }
    } catch {
      setError("Ошибка соединения");
    } finally {
      setLoading(false);
    }
  }

  async function openPortal() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Портал недоступен для демо-аккаунта");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="font-heading text-3xl sm:text-5xl">Тарифные планы</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Выберите формат обучения. Бесплатный тариф обновляется каждый день в полночь.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-2xl">Free</CardTitle>
              {currentPlan === "FREE" && <Badge variant="secondary">Текущий</Badge>}
            </div>
            <CardDescription>Базовая ежедневная практика</CardDescription>
            <div className="font-heading text-4xl pt-3">$0</div>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                10 минут практики в день (сброс в 00:00)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                5 бесплатных уроков по базовым темам
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                Квизы и задачи по вашему уровню
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                Проверка грамматики и правописания
              </li>
            </ul>
            <Link
              href={isLoggedIn ? "/dashboard" : "/login"}
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              {isLoggedIn ? "Перейти в кабинет" : "Начать бесплатно"}
            </Link>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between border-2 border-[#6F5B42] dark:border-[#B5A892]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-2xl flex items-center gap-2">
                <Crown className="h-5 w-5 text-[#6F5B42] dark:text-[#B5A892]" />
                Pro
              </CardTitle>
              <Badge className="bg-[#6F5B42] text-[#F4F3F0] dark:bg-[#B5A892] dark:text-[#15160A]">
                {currentPlan === "PRO" ? "Активен" : "Популярный"}
              </Badge>
            </div>
            <CardDescription>Полный безлимитный AI-репетитор</CardDescription>
            <div className="font-heading text-4xl pt-3">$19 / мес</div>
          </CardHeader>
          <CardContent className="space-y-5">
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                Неограниченное время использования
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                Проверка произношения (микрофон + IPA)
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                Speaking, Reading и Listening тренажёры
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                Глубокий разбор ошибок и все уроки
              </li>
            </ul>

            {!isLoggedIn ? (
              <Link
                href="/login"
                className={buttonVariants({
                  className:
                    "w-full bg-[#6F5B42] text-[#F4F3F0] hover:bg-[#5B4A35] dark:bg-[#B5A892] dark:text-[#15160A]",
                })}
              >
                Войти и оплатить через Stripe
              </Link>
            ) : currentPlan === "PRO" ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={openPortal}
                disabled={loading}
              >
                Управлять подпиской в Stripe
              </Button>
            ) : (
              <Button
                className="w-full bg-[#6F5B42] text-[#F4F3F0] hover:bg-[#5B4A35] dark:bg-[#B5A892] dark:text-[#15160A]"
                onClick={startCheckout}
                disabled={loading}
              >
                {loading ? "Создание сессии Stripe..." : "Оформить Pro через Stripe"}
              </Button>
            )}

            {error && (
              <p className="text-xs text-muted-foreground text-center">{error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
