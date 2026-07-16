import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { putObject } from "@/lib/storage/media";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!key || !key.startsWith(`uploads/${session.userId}/`)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await putObject(key, buffer, file.type || "video/mp4");
  return NextResponse.json({ ok: true, key });
}
