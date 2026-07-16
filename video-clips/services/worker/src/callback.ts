import type { JobStatus } from "@video-clips/shared";

const SECRET = process.env.WORKER_WEBHOOK_SECRET ?? "dev-worker-secret";

export async function reportStatus(
  callbackUrl: string,
  projectId: string,
  status: JobStatus,
  progress?: string,
  error?: string
): Promise<void> {
  await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-worker-secret": SECRET,
    },
    body: JSON.stringify({ type: "status", projectId, status, progress, error }),
  });
}

export async function uploadMedia(
  callbackUrl: string,
  projectId: string,
  key: string,
  data: Buffer,
  contentType: string
): Promise<void> {
  // Local shared media directory (dev): write directly, skip HTTP base64.
  const localRoot = process.env.LOCAL_MEDIA_ROOT;
  if (localRoot) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const full = path.join(localRoot, key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, data);
    return;
  }

  const dataBase64 = data.toString("base64");
  const res = await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-worker-secret": SECRET,
    },
    body: JSON.stringify({
      type: "upload",
      projectId,
      key,
      contentType,
      dataBase64,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upload callback failed: ${res.status} ${text}`);
  }
}

export async function reportClips(
  callbackUrl: string,
  projectId: string,
  clips: Array<{
    title: string;
    startMs: number;
    endMs: number;
    viralityScore: number;
    hook: string;
    reason: string;
    keywords: string[];
    mediaKey: string;
    thumbKey?: string;
  }>
): Promise<void> {
  const res = await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-worker-secret": SECRET,
    },
    body: JSON.stringify({ type: "clips", projectId, clips }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Clips callback failed: ${res.status} ${text}`);
  }
}

export async function fetchProjectMeta(appUrl: string, projectId: string) {
  const secret = process.env.WORKER_WEBHOOK_SECRET ?? "dev-worker-secret";
  const res = await fetch(
    `${appUrl.replace(/\/$/, "")}/api/media/worker?projectId=${encodeURIComponent(projectId)}`,
    { headers: { "x-worker-secret": secret } }
  );
  if (!res.ok) throw new Error(`Could not load project meta: ${res.status}`);
  return (await res.json()) as {
    project: {
      id: string;
      userId: string;
      sourceType: string;
      sourceUrl?: string;
      sourceKey?: string;
    };
    driveRefreshToken?: string;
  };
}

export async function downloadSourceKey(appUrl: string, key: string, destPath: string): Promise<void> {
  const secret = process.env.WORKER_WEBHOOK_SECRET ?? "dev-worker-secret";
  const res = await fetch(
    `${appUrl.replace(/\/$/, "")}/api/media/worker?key=${encodeURIComponent(key)}`,
    { headers: { "x-worker-secret": secret } }
  );
  if (!res.ok) throw new Error(`Could not download source key: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const fs = await import("fs/promises");
  await fs.writeFile(destPath, buf);
}
