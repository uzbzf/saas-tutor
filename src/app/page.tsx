import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  Crown,
  Headphones,
  Mic,
  Sparkles,
  SpellCheck,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { PROFICIENCY_LEVELS } from "@/lib/curriculum";
import { Navbar } from "@/components/navbar";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function HomeNavbar() {
  const user = await getSessionUser();
  return <Navbar user={user} />;
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<Navbar user={null} />}>
        <HomeNavbar />
      </Suspense>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="max-w-3xl space-y-6">
              <Badge className="bg-[#B5A892]/30 text-[#15160A] dark:bg-[#6F5B42]/40 dark:text-[#D2D2D1] border-[#BEBBB4]">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                На базе Gemini 3.5 Flash-Lite
              </Badge>

              <h1 className="font-heading text-4xl leading-tight sm:text-6xl">
                Персональный AI-репетитор английского языка
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Практикуйтесь каждый день в удобном темпе: от первых фраз до свободного владения. Уроки, квизы, грамматика, проверка произношения, Speaking, Reading и Listening в одном пространстве.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/login"
                  className={buttonVariants({
                    size: "lg",
                    className:
                      "bg-[#6F5B42] text-[#F4F3F0] hover:bg-[#5B4A35] dark:bg-[#B5A892] dark:text-[#15160A] dark:hover:bg-[#A0927A]",
                  })}
                >
                  Начать бесплатно
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className={buttonVariants({ size: "lg", variant: "outline" })}
                >
                  Сравнить тарифы
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Proficiency Levels */}
        <section className="border-b border-border py-16 sm:py-20 bg-secondary/25">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10">
            <div className="max-w-2xl space-y-2">
              <h2 className="font-heading text-2xl sm:text-4xl">
                4 этапа изучения языка
              </h2>
              <p className="text-muted-foreground">
                AI-репетитор мгновенно адаптирует сложность лексики, диалогов и объяснений под ваш текущий уровень.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PROFICIENCY_LEVELS.map((lvl, index) => (
                <Card key={lvl.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Этап {index + 1}</Badge>
                      <span className="text-xs font-semibold text-[#6F5B42] dark:text-[#B5A892]">
                        {lvl.cefr}
                      </span>
                    </div>
                    <CardTitle className="font-heading text-xl pt-2">
                      {lvl.labelRu}
                    </CardTitle>
                    <CardDescription>{lvl.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Фокус: {lvl.focus}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="border-b border-border py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <Clock className="h-6 w-6 text-[#6F5B42] dark:text-[#B5A892]" />
                  <CardTitle className="font-heading text-lg">
                    10 минут в день бесплатно
                  </CardTitle>
                  <CardDescription>
                    Ежедневная практика обновляется ровно в полночь. 5 базовых уроков, квизы и задачи.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <SpellCheck className="h-6 w-6 text-[#6F5B42] dark:text-[#B5A892]" />
                  <CardTitle className="font-heading text-lg">
                    Грамматика и правописание
                  </CardTitle>
                  <CardDescription>
                    Мгновенная проверка предложений с понятным разбором правил на русском языке.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Mic className="h-6 w-6 text-[#6F5B42] dark:text-[#B5A892]" />
                  <CardTitle className="font-heading text-lg">
                    Pro: Speaking & Listening
                  </CardTitle>
                  <CardDescription>
                    Проверка произношения, чтение, аудирование и глубокий разбор ошибок без ограничений по времени.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Tariffs */}
        <section className="py-16 sm:py-20 bg-secondary/20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-10">
            <div className="text-center space-y-2">
              <h2 className="font-heading text-2xl sm:text-4xl">Тарифы</h2>
              <p className="text-muted-foreground">
                Начните бесплатно и перейдите на Pro в любой момент через Stripe
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Free</CardTitle>
                  <CardDescription>Для регулярного старта каждый день</CardDescription>
                  <div className="font-heading text-3xl pt-3">$0</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                      10 минут практики в день (сброс в полночь)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                      5 бесплатных уроков на базовые темы
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                      Квизы и интерактивные задачи
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                      Проверка грамматики и правописания
                    </li>
                  </ul>
                  <Link
                    href="/login"
                    className={buttonVariants({ variant: "outline", className: "w-full" })}
                  >
                    Попробовать Free
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
                      Безлимит
                    </Badge>
                  </div>
                  <CardDescription>Полное погружение в язык без ограничений</CardDescription>
                  <div className="font-heading text-3xl pt-3">$19 / мес</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5 text-sm">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                      Неограниченное время использования
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                      Проверка произношения (IPA и оценка)
                    </li>
                    <li className="flex items-center gap-2">
                      <Headphones className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                      Speaking, Reading и Listening модули
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#6F5B42] dark:text-[#B5A892]" />
                      Глубокий разбор ошибок и все уроки
                    </li>
                  </ul>
                  <Link
                    href="/pricing"
                    className={buttonVariants({
                      className:
                        "w-full bg-[#6F5B42] text-[#F4F3F0] hover:bg-[#5B4A35] dark:bg-[#B5A892] dark:text-[#15160A]",
                    })}
                  >
                    Оформить Pro через Stripe
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        LEXIS AI • Персональный AI-репетитор английского языка
      </footer>
    </div>
  );
}
