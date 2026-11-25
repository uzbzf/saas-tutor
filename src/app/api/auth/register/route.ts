import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { normalizeTimezone } from "@/lib/usage";

export async function POST(req: Request) {
  try {
    const { email, password, name, level, timezone } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Заполните имя, email и пароль" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    const allowedLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
    const safeLevel = allowedLevels.includes(level) ? level : "BEGINNER";

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: String(name).trim(),
        passwordHash: await hashPassword(String(password)),
        level: safeLevel,
        plan: "FREE",
        timezone: normalizeTimezone(timezone),
      },
    });

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
    console.error("Register error:", error);
    return NextResponse.json({ error: "Ошибка регистрации" }, { status: 500 });
  }
}
