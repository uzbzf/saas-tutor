import { describe, it, expect } from "vitest";
import {
  computeUsageStatus,
  getSecondsUntilMidnight,
  shouldResetDailyUsage,
  MAX_FREE_SECONDS_PER_DAY,
  MAX_FREE_LESSONS,
} from "../usage";

describe("Free & Pro quota and midnight reset", () => {
  it("enforces 10-minute daily cap for FREE users on the same day", () => {
    const now = new Date("2026-11-25T14:00:00Z");
    const status = computeUsageStatus({
      plan: "FREE",
      usedSecondsToday: 420,
      lastUsageReset: new Date("2026-11-25T08:00:00Z"),
      timezone: "UTC",
      completedFreeLessons: 2,
      now,
    });

    expect(status.remainingSeconds).toBe(180);
    expect(status.limitReached).toBe(false);
    expect(status.canStartNewLesson).toBe(true);
  });

  it("marks limitReached when FREE user hits 600 seconds", () => {
    const now = new Date("2026-11-25T14:00:00Z");
    const status = computeUsageStatus({
      plan: "FREE",
      usedSecondsToday: MAX_FREE_SECONDS_PER_DAY,
      lastUsageReset: new Date("2026-11-25T08:00:00Z"),
      timezone: "UTC",
      completedFreeLessons: MAX_FREE_LESSONS,
      now,
    });

    expect(status.remainingSeconds).toBe(0);
    expect(status.limitReached).toBe(true);
    expect(status.canStartNewLesson).toBe(false);
  });

  it("resets FREE user quota at midnight in user timezone", () => {
    const lastReset = new Date("2026-11-25T20:30:00Z"); // 23:30 in Europe/Moscow (+3)
    const afterMidnight = new Date("2026-11-25T21:05:00Z"); // 00:05 Nov 26 in Europe/Moscow

    expect(
      shouldResetDailyUsage(lastReset, afterMidnight, "Europe/Moscow")
    ).toBe(true);

    const status = computeUsageStatus({
      plan: "FREE",
      usedSecondsToday: 600,
      lastUsageReset: lastReset,
      timezone: "Europe/Moscow",
      completedFreeLessons: 3,
      now: afterMidnight,
    });

    expect(status.usedSecondsToday).toBe(0);
    expect(status.remainingSeconds).toBe(600);
    expect(status.limitReached).toBe(false);
  });

  it("grants unlimited time and lessons for PRO users", () => {
    const now = new Date("2026-11-25T14:00:00Z");
    const status = computeUsageStatus({
      plan: "PRO",
      usedSecondsToday: 5000,
      lastUsageReset: now,
      timezone: "UTC",
      completedFreeLessons: 5,
      now,
    });

    expect(status.remainingSeconds).toBeNull();
    expect(status.limitReached).toBe(false);
    expect(status.canStartNewLesson).toBe(true);
  });

  it("computes seconds until midnight accurately", () => {
    const almostMidnight = new Date("2026-11-25T23:59:00Z");
    expect(getSecondsUntilMidnight(almostMidnight, "UTC")).toBe(60);
  });
});
