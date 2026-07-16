import type { ProjectRecord, WorkerJobPayload } from "@video-clips/shared";

export async function enqueueClipJob(project: ProjectRecord): Promise<void> {
  const workerUrl = process.env.WORKER_URL;
  const secret = process.env.WORKER_WEBHOOK_SECRET ?? "dev-worker-secret";
  const appUrl = process.env.APP_URL ?? "http://localhost:3010";

  if (!workerUrl) {
    console.warn("[enqueue] WORKER_URL unset — job stays queued until a worker polls");
    return;
  }

  const payload: WorkerJobPayload = {
    projectId: project.id,
    sourceType: project.sourceType,
    sourceUrl: project.sourceUrl,
    sourceKey: project.sourceKey,
    prefs: project.prefs,
    callbackUrl: `${appUrl.replace(/\/$/, "")}/api/worker/callback`,
    mediaBaseUrl: `${appUrl.replace(/\/$/, "")}/api/media`,
  };

  const res = await fetch(`${workerUrl.replace(/\/$/, "")}/jobs`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-worker-secret": secret,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Worker rejected job: ${res.status} ${text}`);
  }
}
