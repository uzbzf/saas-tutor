import { NextResponse } from "next/server";
import { uploadObject, getPresignedDownloadUrl, listObjects, deleteObject, BUCKET_NAME } from "@/lib/storage";

export async function GET() {
  try {
    const testKey = `test/ping-${Date.now()}.txt`;
    const testContent = `Neon Object Storage test at ${new Date().toISOString()}`;

    // 1. Upload
    await uploadObject(testKey, testContent, "text/plain");

    // 2. Generate presigned URL
    const presignedUrl = await getPresignedDownloadUrl(testKey, 60);

    // 3. List
    const objects = await listObjects("test/");

    // 4. Clean up
    await deleteObject(testKey);

    return NextResponse.json({
      status: "ok",
      bucket: BUCKET_NAME,
      testedKey: testKey,
      presignedUrl,
      objectCountInPrefix: objects.length,
      verified: true,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Storage test error:", err);
    return NextResponse.json(
      { status: "error", message: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Файл не предоставлен" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const key = `audio-practice/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    await uploadObject(key, buffer, file.type || "audio/webm");
    const downloadUrl = await getPresignedDownloadUrl(key, 86400); // 24 hours

    return NextResponse.json({
      ok: true,
      key,
      downloadUrl,
      size: buffer.length,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
