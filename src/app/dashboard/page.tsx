import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncAndGetUserUsage } from "@/lib/usage";
import { Navbar } from "@/components/navbar";
import { DashboardClient } from "@/components/dashboard-client";

async function DashboardContent() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  const usage = await syncAndGetUserUsage(user.id);
  if (!usage) {
    redirect("/login");
  }

  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id },
    select: { lessonSlug: true },
  });

  return (
    <>
      <Navbar user={user} />
      <main className="flex-1">
        <DashboardClient
          userName={user.name}
          initialLevel={user.level}
          initialUsage={usage}
          initialCompletedSlugs={progress.map((p) => p.lessonSlug)}
        />
      </main>
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
            Загрузка кабинета репетитора...
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}
