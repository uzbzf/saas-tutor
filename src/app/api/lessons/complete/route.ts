import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LESSONS } from "@/lib/curriculum";
import { MAX_FREE_LESSONS, syncAndGetUserUsage } from "@/lib/usage";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id },
    select: { lessonSlug: true, score: true, completedAt: true },
  });

  return NextResponse.json({ progress });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonSlug, score = 100 } = await req.json();
  const lesson = LESSONS.find((l) => l.slug === lessonSlug);
  if (!lesson) {
    return NextResponse.json({ error: "Урок не найден" }, { status: 404 });
  }

  const usage = await syncAndGetUserUsage(user.id);
  if (!usage) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!lesson.isFree && usage.plan !== "PRO") {
    return NextResponse.json(
      { error: "Этот урок доступен только на тарифе Pro", requiresPro: true },
      { status: 403 }
    );
  }

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonSlug: { userId: user.id, lessonSlug } },
  });

  if (!existing && usage.plan === "FREE" && user.completedFreeLessons >= MAX_FREE_LESSONS) {
    return NextResponse.json(
      {
        error: "Вы прошли все 5 бесплатных уроков! Перейдите на Pro для безлимитного доступа.",
        requiresPro: true,
      },
      { status: 403 }
    );
  }

  await prisma.lessonProgress.upsert({
    where: { userId_lessonSlug: { userId: user.id, lessonSlug } },
    update: { score, completedAt: new Date() },
    create: {
      userId: user.id,
      lessonSlug,
      level: user.level,
      moduleType: "LESSON",
      score,
    },
  });

  if (!existing && lesson.isFree) {
    await prisma.user.update({
      where: { id: user.id },
      data: { completedFreeLessons: { increment: 1 } },
    });
  }

  const updatedUsage = await syncAndGetUserUsage(user.id);
  return NextResponse.json({ ok: true, usage: updatedUsage });
}
