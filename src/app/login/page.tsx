"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Crown } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROFICIENCY_LEVELS } from "@/lib/curriculum";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [level, setLevel] = React.useState("BEGINNER");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleAuth(mode: "login" | "register", e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "login"
            ? { email, password, timezone: tz }
            : { email, password, name, level, timezone: tz }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка авторизации");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemo(plan: "FREE" | "PRO") {
    setLoading(true);
    setError(null);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, timezone: tz }),
      });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Не удалось выполнить демо-вход");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-2xl">
                Добро пожаловать в LEXIS AI
              </CardTitle>
              <CardDescription>
                Войдите или создайте аккаунт, чтобы начать практику
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Вход</TabsTrigger>
                  <TabsTrigger value="register">Регистрация</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form
                    onSubmit={(e) => handleAuth("login", e)}
                    className="space-y-3"
                  >
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#6F5B42] text-[#F4F3F0] hover:bg-[#5B4A35] dark:bg-[#B5A892] dark:text-[#15160A]"
                    >
                      Войти
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form
                    onSubmit={(e) => handleAuth("register", e)}
                    className="space-y-3"
                  >
                    <Input
                      placeholder="Ваше имя"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Select value={level} onValueChange={(v) => v && setLevel(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Уровень английского" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROFICIENCY_LEVELS.map((lvl) => (
                          <SelectItem key={lvl.id} value={lvl.id}>
                            {lvl.labelRu} ({lvl.cefr})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#6F5B42] text-[#F4F3F0] hover:bg-[#5B4A35] dark:bg-[#B5A892] dark:text-[#15160A]"
                    >
                      Создать аккаунт (Free)
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {error && (
                <p className="mt-3 text-xs text-destructive text-center">
                  {error}
                </p>
              )}

              <div className="mt-6 border-t border-border pt-4 space-y-2">
                <p className="text-xs text-center text-muted-foreground">
                  Быстрый демо-доступ для тестирования тарифов:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemo("FREE")}
                    disabled={loading}
                  >
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Demo Free
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemo("PRO")}
                    disabled={loading}
                  >
                    <Crown className="mr-1.5 h-3.5 w-3.5" />
                    Demo Pro
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
