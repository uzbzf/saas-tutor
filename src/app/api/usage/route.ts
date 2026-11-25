import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordPracticeSeconds, syncAndGetUserUsage } from "@/lib/usage";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const tz = searchParams.get("tz") ?? undefined;
  const usage = await syncAndGetUserUsage(user.id, tz);
  return NextResponse.json({ user, usage });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const seconds = Number(body.seconds ?? 10);
  const tz = typeof body.timezone === "string" ? body.timezone : undefined;

  const usage = await recordPracticeSeconds(user.id, seconds, tz);
  return NextResponse.json({ usage });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { level } = await req.json();
  const allowedLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
  if (!allowedLevels.includes(level)) {
    return NextResponse.json({ error: "Неверный уровень" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { level },
    select: { id: true, level: true },
  });
  return NextResponse.json({ user: updated });
}
