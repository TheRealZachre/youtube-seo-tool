import { notFound, redirect } from "next/navigation";
import { ProjectLiveView } from "@/components/project-live-view";
import { getSession } from "@/lib/auth/session";
import { getProjectForUser, listClipsForProject } from "@/lib/projects/store";
import { createDownloadUrl } from "@/lib/storage/media";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const project = await getProjectForUser(id, session.userId);
  if (!project) notFound();

  const clips = await listClipsForProject(project.id);
  const mediaUrls: Record<string, string> = {};
  for (const clip of clips) {
    if (clip.mediaKey) mediaUrls[clip.mediaKey] = await createDownloadUrl(clip.mediaKey);
  }

  return <ProjectLiveView initial={{ project, clips, mediaUrls }} />;
}
