"use client";

import * as React from "react";
import { Clock, Infinity as InfinityIcon, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { UsageStatus } from "@/lib/usage";

function formatMMSS(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatHHMM(totalSeconds: number) {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  return `${hrs}ч ${String(mins).padStart(2, "0")}м`;
}

export function UsageTimer({
  usage,
  onUsageUpdate,
}: {
  usage: UsageStatus;
  onUsageUpdate: (u: UsageStatus) => void;
}) {
  const [secondsLeft, setSecondsLeft] = React.useState<number>(
    usage.remainingSeconds ?? 600
  );
  const [untilReset, setUntilReset] = React.useState<number>(
    usage.secondsUntilReset
  );

  React.useEffect(() => {
    setSecondsLeft(usage.remainingSeconds ?? 600);
    setUntilReset(usage.secondsUntilReset);
  }, [usage.remainingSeconds, usage.secondsUntilReset]);

  React.useEffect(() => {
    if (usage.plan === "PRO") return;

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tickInterval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
      setUntilReset((prev) => Math.max(0, prev - 1));
    }, 1000);

    const syncInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/usage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seconds: 15, timezone: tz }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.usage) onUsageUpdate(data.usage);
        }
      } catch {
        // Ignore transient network errors
      }
    }, 15000);

    return () => {
      clearInterval(tickInterval);
      clearInterval(syncInterval);
    };
  }, [usage.plan, onUsageUpdate]);

  if (usage.plan === "PRO") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5">
        <InfinityIcon className="h-5 w-5 text-[#6F5B42] dark:text-[#B5A892]" />
        <div className="text-xs">
          <div className="font-semibold">Безлимитная практика</div>
          <div className="text-muted-foreground">Тариф Pro активен</div>
        </div>
      </div>
    );
  }

  const pct = Math.round(((600 - secondsLeft) / 600) * 100);

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 min-w-[240px]">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="flex items-center gap-1.5 font-semibold">
          <Clock className="h-3.5 w-3.5 text-[#6F5B42] dark:text-[#B5A892]" />
          Осталось сегодня: {formatMMSS(secondsLeft)}
        </span>
        <Badge variant="outline" className="text-[10px]">
          <RotateCcw className="mr-1 h-2.5 w-2.5" />
          сброс через {formatHHMM(untilReset)}
        </Badge>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}
