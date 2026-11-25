import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { normalizeTimezone } from "@/lib/usage";

export async function POST(req: Request) {
  try {
    const { email, password, timezone } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "Введите email и пароль" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!user || !(await verifyPassword(String(password), user.passwordHash))) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    if (timezone) {
      await prisma.user.update({
        where: { id: user.id },
        data: { timezone: normalizeTimezone(timezone) },
      });
    }

    await setSessionCookie(user.id);
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        level: user.level,
        plan: user.plan,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Ошибка входа" }, { status: 500 });
  }
}
