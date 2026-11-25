"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, LogOut, Crown } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavbarProps {
  user?: {
    name: string;
    plan: string;
  } | null;
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6F5B42] text-[#F4F3F0] dark:bg-[#B5A892] dark:text-[#15160A]">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-heading text-xl tracking-tight">LEXIS AI</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Главная
          </Link>
          <Link
            href="/dashboard"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Кабинет репетитора
          </Link>
          <Link
            href="/pricing"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Тарифы
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {user ? (
            <>
              <Badge
                variant={user.plan === "PRO" ? "default" : "secondary"}
                className={
                  user.plan === "PRO"
                    ? "bg-[#6F5B42] text-[#F4F3F0] dark:bg-[#B5A892] dark:text-[#15160A]"
                    : ""
                }
              >
                {user.plan === "PRO" && <Crown className="mr-1 h-3 w-3" />}
                {user.plan}
              </Badge>
              <Link
                href="/dashboard"
                className={buttonVariants({
                  size: "sm",
                  variant: "outline",
                  className: "hidden sm:inline-flex",
                })}
              >
                {user.name}
              </Link>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleLogout}
                title="Выйти"
                aria-label="Выйти"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className={buttonVariants({
                size: "sm",
                className:
                  "bg-[#6F5B42] text-[#F4F3F0] hover:bg-[#5B4A35] dark:bg-[#B5A892] dark:text-[#15160A] dark:hover:bg-[#A0927A]",
              })}
            >
              Начать
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
