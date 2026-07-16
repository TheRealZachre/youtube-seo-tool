import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser, listClipsForProject, updateProjectStatus } from "@/lib/projects/store";
import { enqueueClipJob } from "@/lib/jobs/enqueue";
import { createDownloadUrl } from "@/lib/storage/media";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const project = await getProjectForUser(id, session.userId);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated =
    (await updateProjectStatus(project.id, {
      jobStatus: "queued",
      jobError: undefined,
      jobProgress: "Retrying…",
    })) ?? project;

  try {
    await enqueueClipJob(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to enqueue";
    await updateProjectStatus(project.id, { jobStatus: "failed", jobError: message });
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const clips = await listClipsForProject(project.id);
  const mediaUrls: Record<string, string> = {};
  for (const clip of clips) {
    if (clip.mediaKey) mediaUrls[clip.mediaKey] = await createDownloadUrl(clip.mediaKey);
  }

  const fresh = (await getProjectForUser(id, session.userId))!;
  return NextResponse.json({ project: fresh, clips, mediaUrls });
}
