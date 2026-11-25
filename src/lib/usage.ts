import { prisma } from "@/lib/prisma";

export const MAX_FREE_SECONDS_PER_DAY = 600; // 10 minutes
export const MAX_FREE_LESSONS = 5;

export type PlanTier = "FREE" | "PRO";
export type ProficiencyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export function normalizeTimezone(tz?: string | null): string {
  if (!tz) return "UTC";
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

export function getCalendarDateInTimezone(date: Date, timezone: string): string {
  const safeTz = normalizeTimezone(timezone);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: safeTz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function shouldResetDailyUsage(
  lastReset: Date,
  now: Date,
  timezone: string
): boolean {
  const lastDay = getCalendarDateInTimezone(lastReset, timezone);
  const currentDay = getCalendarDateInTimezone(now, timezone);
  return lastDay !== currentDay;
}

export function getSecondsUntilMidnight(now: Date, timezone: string): number {
  const safeTz = normalizeTimezone(timezone);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: safeTz,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(now);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const second = Number(parts.find((p) => p.type === "second")?.value ?? "0");

  const elapsedToday = hour * 3600 + minute * 60 + second;
  return Math.max(0, 86400 - elapsedToday);
}

export interface UsageStatus {
  plan: PlanTier;
  usedSecondsToday: number;
  remainingSeconds: number | null; // null for PRO (unlimited)
  limitReached: boolean;
  secondsUntilReset: number;
  completedFreeLessons: number;
  freeLessonsLimit: number;
  canStartNewLesson: boolean;
}

export function computeUsageStatus(params: {
  plan: string;
  usedSecondsToday: number;
  lastUsageReset: Date;
  timezone: string;
  completedFreeLessons: number;
  now?: Date;
}): UsageStatus {
  const now = params.now ?? new Date();
  const isPro = params.plan === "PRO";
  const resetNeeded = shouldResetDailyUsage(
    params.lastUsageReset,
    now,
    params.timezone
  );
  const effectiveUsed = resetNeeded ? 0 : params.usedSecondsToday;
  const remainingSeconds = isPro
    ? null
    : Math.max(0, MAX_FREE_SECONDS_PER_DAY - effectiveUsed);

  return {
    plan: isPro ? "PRO" : "FREE",
    usedSecondsToday: effectiveUsed,
    remainingSeconds,
    limitReached: !isPro && (remainingSeconds ?? 0) <= 0,
    secondsUntilReset: getSecondsUntilMidnight(now, params.timezone),
    completedFreeLessons: params.completedFreeLessons,
    freeLessonsLimit: MAX_FREE_LESSONS,
    canStartNewLesson: isPro || params.completedFreeLessons < MAX_FREE_LESSONS,
  };
}

export async function syncAndGetUserUsage(
  userId: string,
  clientTimezone?: string
): Promise<UsageStatus | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const now = new Date();
  const tz = normalizeTimezone(clientTimezone || user.timezone);
  const needsReset = shouldResetDailyUsage(user.lastUsageReset, now, tz);

  if (needsReset || (clientTimezone && tz !== user.timezone)) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        timezone: tz,
        ...(needsReset
          ? { usedSecondsToday: 0, lastUsageReset: now }
          : {}),
      },
    });
    return computeUsageStatus({
      plan: updated.plan,
      usedSecondsToday: updated.usedSecondsToday,
      lastUsageReset: updated.lastUsageReset,
      timezone: updated.timezone,
      completedFreeLessons: updated.completedFreeLessons,
      now,
    });
  }

  return computeUsageStatus({
    plan: user.plan,
    usedSecondsToday: user.usedSecondsToday,
    lastUsageReset: user.lastUsageReset,
    timezone: user.timezone,
    completedFreeLessons: user.completedFreeLessons,
    now,
  });
}

export async function recordPracticeSeconds(
  userId: string,
  secondsToAdd: number,
  clientTimezone?: string
): Promise<UsageStatus | null> {
  const status = await syncAndGetUserUsage(userId, clientTimezone);
  if (!status) return null;

  if (status.plan === "PRO") {
    return status;
  }

  const clampedAdd = Math.max(0, Math.min(secondsToAdd, 60));
  const nextUsed = Math.min(
    MAX_FREE_SECONDS_PER_DAY,
    status.usedSecondsToday + clampedAdd
  );

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { usedSecondsToday: nextUsed },
  });

  return computeUsageStatus({
    plan: updated.plan,
    usedSecondsToday: updated.usedSecondsToday,
    lastUsageReset: updated.lastUsageReset,
    timezone: updated.timezone,
    completedFreeLessons: updated.completedFreeLessons,
  });
}
