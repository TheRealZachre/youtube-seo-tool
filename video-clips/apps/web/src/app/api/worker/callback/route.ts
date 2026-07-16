import { NextResponse } from "next/server";
import type { JobStatus } from "@video-clips/shared";
import { replaceClipsForProject, updateProjectStatus } from "@/lib/projects/store";
import { putObject } from "@/lib/storage/media";

export const runtime = "nodejs";
export const maxDuration = 60;

function assertSecret(request: Request): boolean {
  const secret = process.env.WORKER_WEBHOOK_SECRET ?? "dev-worker-secret";
  return request.headers.get("x-worker-secret") === secret;
}

export async function POST(request: Request) {
  if (!assertSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    type?: "status" | "clips" | "upload";
    projectId?: string;
    status?: JobStatus;
    progress?: string;
    error?: string;
    clips?: Array<{
      title: string;
      startMs: number;
      endMs: number;
      viralityScore: number;
      hook: string;
      reason: string;
      keywords?: string[];
      mediaKey: string;
      thumbKey?: string;
    }>;
    key?: string;
    contentType?: string;
    dataBase64?: string;
  };

  if (!body.projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  if (body.type === "upload" && body.key && body.dataBase64) {
    const buf = Buffer.from(body.dataBase64, "base64");
    await putObject(body.key, buf, body.contentType || "application/octet-stream");
    return NextResponse.json({ ok: true, key: body.key });
  }

  if (body.type === "status" && body.status) {
    await updateProjectStatus(body.projectId, {
      jobStatus: body.status,
      jobProgress: body.progress,
      jobError: body.error,
    });
    return NextResponse.json({ ok: true });
  }

  if (body.type === "clips" && body.clips) {
    await replaceClipsForProject(
      body.projectId,
      body.clips.map((c) => ({
        title: c.title,
        startMs: c.startMs,
        endMs: c.endMs,
        viralityScore: c.viralityScore,
        hook: c.hook,
        reason: c.reason,
        keywords: c.keywords ?? [],
        mediaKey: c.mediaKey,
        thumbKey: c.thumbKey,
      }))
    );
    await updateProjectStatus(body.projectId, {
      jobStatus: "done",
      jobProgress: `${body.clips.length} clips ready`,
      jobError: undefined,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown callback type" }, { status: 400 });
}
