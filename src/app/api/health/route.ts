import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uploadObject, getPresignedDownloadUrl, deleteObject, BUCKET_NAME } from "@/lib/storage";

export async function GET() {
  const results: {
    postgres: { ok: boolean; timestamp?: string; userCount?: number; latencyMs?: number; error?: string };
    objectStorage: { ok: boolean; bucket?: string; presignedUrlSample?: string; latencyMs?: number; error?: string };
  } = {
    postgres: { ok: false },
    objectStorage: { ok: false },
  };

  // Test Neon Postgres via Prisma
  const pgStart = Date.now();
  try {
    const [dbNowResult, userCount] = await Promise.all([
      prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`,
      prisma.user.count(),
    ]);
    results.postgres = {
      ok: true,
      timestamp: dbNowResult[0]?.now?.toISOString(),
      userCount,
      latencyMs: Date.now() - pgStart,
    };
  } catch (err: unknown) {
    results.postgres = {
      ok: false,
      error: (err as Error).message,
      latencyMs: Date.now() - pgStart,
    };
  }

  // Test Neon Object Storage via S3 client
  const s3Start = Date.now();
  try {
    const probeKey = `health/probe-${Date.now()}.txt`;
    await uploadObject(probeKey, "neon-storage-health-check", "text/plain");
    const sampleUrl = await getPresignedDownloadUrl(probeKey, 120);
    await deleteObject(probeKey);

    results.objectStorage = {
      ok: true,
      bucket: BUCKET_NAME,
      presignedUrlSample: sampleUrl,
      latencyMs: Date.now() - s3Start,
    };
  } catch (err: unknown) {
    results.objectStorage = {
      ok: false,
      error: (err as Error).message,
      latencyMs: Date.now() - s3Start,
    };
  }

  const allOk = results.postgres.ok && results.objectStorage.ok;
  return NextResponse.json(
    {
      status: allOk ? "healthy" : "degraded",
      services: results,
      branch: process.env.NEON_BRANCH || "production",
      branchId: process.env.NEON_BRANCH_ID,
    },
    { status: allOk ? 200 : 503 }
  );
}
