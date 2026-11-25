import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getStripeClient } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const stripe = getStripeClient();
  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!stripe || !priceId) {
    return NextResponse.json(
      {
        error:
          "Stripe не настроен: добавьте STRIPE_SECRET_KEY и STRIPE_PRO_PRICE_ID в .env.local",
        stripeNotConfigured: true,
      },
      { status: 503 }
    );
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/pricing?canceled=true`,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: session.url });
}
