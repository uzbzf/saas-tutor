import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { PricingClient } from "@/components/pricing-client";

async function PricingContent() {
  const user = await getSessionUser();

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1">
        <PricingClient isLoggedIn={Boolean(user)} currentPlan={user?.plan} />
      </main>
    </>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="p-12 text-center text-sm">Загрузка тарифов...</div>}>
        <PricingContent />
      </Suspense>
    </div>
  );
}
