import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser, listClipsForProject } from "@/lib/projects/store";
import { createDownloadUrl } from "@/lib/storage/media";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const project = await getProjectForUser(id, session.userId);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const clips = await listClipsForProject(project.id);
  const mediaUrls: Record<string, string> = {};
  for (const clip of clips) {
    if (clip.mediaKey) mediaUrls[clip.mediaKey] = await createDownloadUrl(clip.mediaKey);
  }

  return NextResponse.json({ project, clips, mediaUrls });
}
