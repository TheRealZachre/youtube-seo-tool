import { NextResponse } from "next/server";
import { parseDriveFileId, parseYouTubeId, type SourceType } from "@video-clips/shared";
import { getSession } from "@/lib/auth/session";
import { createProject, listProjectsForUser, updateProjectStatus } from "@/lib/projects/store";
import { enqueueClipJob } from "@/lib/jobs/enqueue";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projects = await listProjectsForUser(session.userId);
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      title?: string;
      sourceType?: SourceType;
      sourceUrl?: string;
      sourceKey?: string;
      sourceFileName?: string;
      prefs?: {
        minDurationSec?: number;
        maxDurationSec?: number;
        maxClips?: number;
      };
    };

    const sourceType = body.sourceType;
    if (!sourceType || !["youtube", "drive", "upload"].includes(sourceType)) {
      return NextResponse.json({ error: "Invalid sourceType" }, { status: 400 });
    }

    if (sourceType === "youtube") {
      if (!body.sourceUrl || !parseYouTubeId(body.sourceUrl)) {
        return NextResponse.json({ error: "Valid YouTube URL required" }, { status: 400 });
      }
    }
    if (sourceType === "drive") {
      if (!body.sourceUrl || !parseDriveFileId(body.sourceUrl)) {
        return NextResponse.json({ error: "Valid Google Drive URL required" }, { status: 400 });
      }
    }
    if (sourceType === "upload" && !body.sourceKey) {
      return NextResponse.json({ error: "Upload key required" }, { status: 400 });
    }

    const title =
      body.title?.trim() ||
      body.sourceFileName ||
      (sourceType === "youtube"
        ? `YouTube ${parseYouTubeId(body.sourceUrl!) }`
        : sourceType === "drive"
          ? `Drive ${parseDriveFileId(body.sourceUrl!)}`
          : "Uploaded video");

    const project = await createProject({
      userId: session.userId,
      title,
      sourceType,
      sourceUrl: body.sourceUrl,
      sourceKey: body.sourceKey,
      sourceFileName: body.sourceFileName,
      prefs: body.prefs,
    });

    try {
      await enqueueClipJob(project);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to enqueue job";
      await updateProjectStatus(project.id, { jobStatus: "failed", jobError: message });
      return NextResponse.json({ error: message, project }, { status: 502 });
    }

    return NextResponse.json({ project });
  } catch (err) {
    console.error("[projects POST]", err);
    return NextResponse.json({ error: "Could not create project" }, { status: 500 });
  }
}
