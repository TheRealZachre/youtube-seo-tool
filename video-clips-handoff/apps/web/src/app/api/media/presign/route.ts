import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createUploadUrl } from "@/lib/storage/media";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    fileName?: string;
    contentType?: string;
    size?: number;
  };

  if (!body.fileName) {
    return NextResponse.json({ error: "fileName required" }, { status: 400 });
  }

  const maxBytes = 2 * 1024 * 1024 * 1024;
  if (body.size && body.size > maxBytes) {
    return NextResponse.json({ error: "File too large (max 2GB)" }, { status: 400 });
  }

  const ext = body.fileName.includes(".") ? body.fileName.split(".").pop() : "mp4";
  const key = `uploads/${session.userId}/${randomUUID()}.${ext}`;
  const result = await createUploadUrl(key, body.contentType || "video/mp4");
  return NextResponse.json(result);
}
