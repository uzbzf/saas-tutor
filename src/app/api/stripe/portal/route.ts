import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getStripeClient } from "@/lib/stripe";

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripeClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!stripe || !user.stripeCustomerId) {
    return NextResponse.json(
      { error: "Портал управления подпиской недоступен" },
      { status: 400 }
    );
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/dashboard`,
  });

  return NextResponse.json({ url: portal.url });
}
