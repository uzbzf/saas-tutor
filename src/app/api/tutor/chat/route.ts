import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { syncAndGetUserUsage } from "@/lib/usage";
import { runTutorInteraction } from "@/lib/gemini";

const PRO_MODES = new Set(["SPEAKING", "ERROR_ANALYSIS", "READING", "LISTENING"]);

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { mode = "LESSON", message, previousInteractionId, timezone } =
    await req.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Пустой запрос" }, { status: 400 });
  }

  const usage = await syncAndGetUserUsage(user.id, timezone);
  if (!usage) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }

  if (PRO_MODES.has(mode) && usage.plan !== "PRO") {
    return NextResponse.json(
      {
        error: "Эта функция доступна только на тарифе Pro",
        requiresPro: true,
      },
      { status: 403 }
    );
  }

  if (usage.limitReached) {
    return NextResponse.json(
      {
        error:
          "Дневной лимит (10 минут) исчерпан. Лимит обновится в полночь или перейдите на Pro.",
        limitReached: true,
        usage,
      },
      { status: 429 }
    );
  }

  const result = await runTutorInteraction({
    level: user.level,
    mode,
    input: message,
    previousInteractionId,
  });

  return NextResponse.json({
    reply: result.text,
    interactionId: result.interactionId,
    isDemoFallback: result.isDemoFallback ?? false,
    usage,
  });
}
