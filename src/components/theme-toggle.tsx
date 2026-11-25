"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" aria-label="Переключить тему">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Включить светлую тему" : "Включить темную тему"}
      title={isDark ? "Светлая тема" : "Темная тема"}
      className="border-border bg-card hover:bg-secondary"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-[#B5A892]" />
      ) : (
        <Moon className="h-4 w-4 text-[#6F5B42]" />
      )}
    </Button>
  );
}
