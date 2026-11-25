"use client";

import * as React from "react";
import { PROFICIENCY_LEVELS } from "@/lib/curriculum";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LevelSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (level: string) => void;
}) {
  const [saving, setSaving] = React.useState(false);

  async function handleValueChange(next: string | null) {
    if (!next) return;
    setSaving(true);
    try {
      const res = await fetch("/api/usage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: next }),
      });
      if (res.ok) {
        onChange(next);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select value={value} onValueChange={handleValueChange} disabled={saving}>
      <SelectTrigger className="w-[220px] bg-card border-border">
        <SelectValue placeholder="Выберите уровень" />
      </SelectTrigger>
      <SelectContent>
        {PROFICIENCY_LEVELS.map((lvl) => (
          <SelectItem key={lvl.id} value={lvl.id}>
            {lvl.labelRu} ({lvl.cefr})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
