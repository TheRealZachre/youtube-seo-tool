import { NextResponse } from "next/server";
import { getObjectBuffer, localMediaExists, openLocalMediaStream } from "@/lib/storage/media";
import { Readable } from "stream";

function contentTypeForKey(key: string): string {
  if (key.endsWith(".mp4")) return "video/mp4";
  if (key.endsWith(".webm")) return "video/webm";
  if (key.endsWith(".jpg") || key.endsWith(".jpeg")) return "image/jpeg";
  if (key.endsWith(".png")) return "image/png";
  if (key.endsWith(".json")) return "application/json";
  return "application/octet-stream";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });

  if (localMediaExists(key)) {
    const stream = openLocalMediaStream(key);
    if (!stream) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const webStream = Readable.toWeb(stream) as unknown as ReadableStream;
    return new NextResponse(webStream, {
      headers: {
        "content-type": contentTypeForKey(key),
        "cache-control": "private, max-age=3600",
      },
    });
  }

  const buf = await getObjectBuffer(key);
  if (!buf) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "content-type": contentTypeForKey(key),
      "cache-control": "private, max-age=3600",
    },
  });
}
