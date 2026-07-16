import { NextResponse } from "next/server";
import { getObjectBuffer, localMediaExists, openLocalMediaStream } from "@/lib/storage/media";
import { getGoogleRefreshToken } from "@/lib/auth/users";
import { getProject } from "@/lib/projects/store";
import { Readable } from "stream";

function assertSecret(request: Request): boolean {
  const secret = process.env.WORKER_WEBHOOK_SECRET ?? "dev-worker-secret";
  return request.headers.get("x-worker-secret") === secret;
}

export async function GET(request: Request) {
  if (!assertSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const projectId = url.searchParams.get("projectId");
  const googleUserId = url.searchParams.get("googleUserId");

  if (key) {
    if (localMediaExists(key)) {
      const stream = openLocalMediaStream(key);
      if (!stream) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return new NextResponse(Readable.toWeb(stream) as unknown as ReadableStream, {
        headers: { "content-type": "application/octet-stream" },
      });
    }
    const buf = await getObjectBuffer(key);
    if (!buf) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return new NextResponse(new Uint8Array(buf), {
      headers: { "content-type": "application/octet-stream" },
    });
  }

  if (projectId) {
    const project = await getProject(projectId);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
    let driveRefreshToken: string | undefined;
    if (project.sourceType === "drive") {
      driveRefreshToken = await getGoogleRefreshToken(project.userId);
    }
    return NextResponse.json({ project, driveRefreshToken });
  }

  if (googleUserId) {
    const token = await getGoogleRefreshToken(googleUserId);
    return NextResponse.json({ refreshToken: token ?? null });
  }

  return NextResponse.json({ error: "key or projectId required" }, { status: 400 });
}
