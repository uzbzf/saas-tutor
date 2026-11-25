import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { normalizeTimezone } from "@/lib/usage";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const plan = body.plan === "PRO" ? "PRO" : "FREE";
    const tz = normalizeTimezone(body.timezone);
    const email = plan === "PRO" ? "demo-pro@lexis.ai" : "demo-free@lexis.ai";

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: plan === "PRO" ? "Demo Pro Ученик" : "Demo Free Ученик",
          passwordHash: await hashPassword("demo-password-123"),
          level: "INTERMEDIATE",
          plan,
          timezone: tz,
          subscriptionStatus: plan === "PRO" ? "active" : null,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { plan, timezone: tz },
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
    console.error("Demo login error:", error);
    return NextResponse.json({ error: "Ошибка демо-входа" }, { status: 500 });
  }
}
