"use client";

import * as React from "react";
import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UsageTimer } from "@/components/usage-timer";
import { LevelSelector } from "@/components/level-selector";
import { LessonsTab } from "@/components/tutor/lessons-tab";
import { GrammarTab } from "@/components/tutor/grammar-tab";
import { QuizTab } from "@/components/tutor/quiz-tab";
import { ProSpeakingTab } from "@/components/tutor/pro-speaking-tab";
import { ProReadingListeningTab } from "@/components/tutor/pro-reading-listening-tab";
import { getLevelInfo } from "@/lib/curriculum";
import type { UsageStatus } from "@/lib/usage";

export function DashboardClient({
  userName,
  initialLevel,
  initialUsage,
  initialCompletedSlugs,
}: {
  userName: string;
  initialLevel: string;
  initialUsage: UsageStatus;
  initialCompletedSlugs: string[];
}) {
  const [level, setLevel] = React.useState(initialLevel);
  const [usage, setUsage] = React.useState<UsageStatus>(initialUsage);
  const [completedSlugs, setCompletedSlugs] = React.useState<string[]>(
    initialCompletedSlugs
  );

  const levelInfo = getLevelInfo(level);

  function handleLessonCompleted(slug: string, updatedUsage?: UsageStatus) {
    setCompletedSlugs((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    if (updatedUsage) setUsage(updatedUsage);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="font-heading text-2xl sm:text-3xl">
              Привет, {userName}
            </h1>
            <Badge
              variant={usage.plan === "PRO" ? "default" : "secondary"}
              className={
                usage.plan === "PRO"
                  ? "bg-[#6F5B42] text-[#F4F3F0] dark:bg-[#B5A892] dark:text-[#15160A]"
                  : ""
              }
            >
              {usage.plan === "PRO" && <Crown className="mr-1 h-3 w-3" />}
              {usage.plan}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Этап: <strong>{levelInfo.labelRu}</strong> ({levelInfo.cefr}) —{" "}
            {levelInfo.focus}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LevelSelector value={level} onChange={setLevel} />
          <UsageTimer usage={usage} onUsageUpdate={setUsage} />
          {usage.plan === "FREE" && (
            <Link
              href="/pricing"
              className={buttonVariants({
                size: "sm",
                className:
                  "bg-[#6F5B42] text-[#F4F3F0] hover:bg-[#5B4A35] dark:bg-[#B5A892] dark:text-[#15160A]",
              })}
            >
              <Crown className="mr-1.5 h-3.5 w-3.5" />
              Pro
            </Link>
          )}
        </div>
      </div>

      {usage.limitReached && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm flex flex-wrap items-center justify-between gap-3">
          <span>
            Дневной лимит (10 минут) на бесплатном тарифе исчерпан. Он обновится автоматически в полночь.
          </span>
          <Link href="/pricing" className={buttonVariants({ size: "sm" })}>
            Снять лимит с Pro
          </Link>
        </div>
      )}

      {/* Main Tutor Tabs */}
      <Tabs defaultValue="lessons" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1.5 bg-secondary/50 p-1.5 rounded-xl">
          <TabsTrigger value="lessons">Уроки (5 базовых)</TabsTrigger>
          <TabsTrigger value="grammar">Грамматика и Правописание</TabsTrigger>
          <TabsTrigger value="quiz">Квизы и Задачи</TabsTrigger>
          <TabsTrigger value="speaking" className="flex items-center gap-1.5">
            {usage.plan !== "PRO" && <Lock className="h-3 w-3" />}
            Speaking & Произношение
          </TabsTrigger>
          <TabsTrigger value="reading" className="flex items-center gap-1.5">
            {usage.plan !== "PRO" && <Lock className="h-3 w-3" />}
            Reading & Listening
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <LessonsTab
            usage={usage}
            completedSlugs={completedSlugs}
            onLessonCompleted={handleLessonCompleted}
          />
        </TabsContent>

        <TabsContent value="grammar">
          <GrammarTab usage={usage} />
        </TabsContent>

        <TabsContent value="quiz">
          <QuizTab usage={usage} />
        </TabsContent>

        <TabsContent value="speaking">
          <ProSpeakingTab usage={usage} />
        </TabsContent>

        <TabsContent value="reading">
          <ProReadingListeningTab usage={usage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
