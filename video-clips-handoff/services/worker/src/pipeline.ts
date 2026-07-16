import fs from "fs/promises";
import os from "os";
import path from "path";
import type { WorkerJobPayload } from "@video-clips/shared";
import { fetchProjectMeta, reportClips, reportStatus, uploadMedia } from "./callback.js";
import { ingestSource } from "./ingest.js";
import { transcribeVideo } from "./transcribe.js";
import { demoScoreHighlights, scoreHighlights } from "./score.js";
import { renderClip } from "./render.js";

export async function processJob(payload: WorkerJobPayload): Promise<void> {
  const appUrl = process.env.APP_URL || payload.mediaBaseUrl?.replace(/\/api\/media$/, "") || "http://localhost:3010";
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), "vcf-clips-"));

  try {
    await reportStatus(payload.callbackUrl, payload.projectId, "downloading", "Fetching source video…");

    const meta = await fetchProjectMeta(appUrl, payload.projectId).catch(() => null);
    const driveRefreshToken = meta?.driveRefreshToken;

    const sourcePath = await ingestSource({
      sourceType: payload.sourceType,
      sourceUrl: payload.sourceUrl,
      sourceKey: payload.sourceKey,
      appUrl,
      workDir,
      driveRefreshToken,
    });

    await reportStatus(payload.callbackUrl, payload.projectId, "transcribing", "Running Whisper transcription…");

    let segments;
    if (process.env.OPENAI_API_KEY) {
      segments = await transcribeVideo(sourcePath, workDir);
    } else if (process.env.DEMO_MODE === "1") {
      // Synthetic transcript for local smoke tests without OpenAI
      const { spawnSync } = await import("child_process");
      const probe = spawnSync(
        process.env.FFMPEG_PATH || "ffprobe",
        ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", sourcePath],
        { encoding: "utf-8" }
      );
      const durationSec = Math.max(30, Number(probe.stdout.trim()) || 90);
      segments = Array.from({ length: Math.ceil(durationSec / 10) }, (_, i) => ({
        text: `Demo segment ${i + 1} talking about a memorable moment and a useful tip.`,
        startMs: i * 10_000,
        endMs: Math.min(durationSec * 1000, (i + 1) * 10_000),
        words: [],
      }));
    } else {
      throw new Error("OPENAI_API_KEY is required (or set DEMO_MODE=1 for local smoke tests)");
    }

    await reportStatus(payload.callbackUrl, payload.projectId, "scoring", "Ranking viral moments…");
    const candidates =
      process.env.OPENAI_API_KEY && process.env.DEMO_MODE !== "1"
        ? await scoreHighlights(segments, payload.prefs)
        : demoScoreHighlights(segments, payload.prefs);

    await reportStatus(
      payload.callbackUrl,
      payload.projectId,
      "rendering",
      `Rendering ${candidates.length} vertical clips…`
    );

    const completed = [];
    for (let i = 0; i < candidates.length; i++) {
      const clip = candidates[i];
      await reportStatus(
        payload.callbackUrl,
        payload.projectId,
        "rendering",
        `Rendering clip ${i + 1}/${candidates.length}…`
      );
      const { mediaPath, thumbPath } = await renderClip({
        sourcePath,
        clip,
        segments,
        outDir: workDir,
        index: i,
      });

      const mediaKey = `clips/${payload.projectId}/clip-${i + 1}.mp4`;
      const thumbKey = `clips/${payload.projectId}/clip-${i + 1}.jpg`;
      await uploadMedia(payload.callbackUrl, payload.projectId, mediaKey, await fs.readFile(mediaPath), "video/mp4");
      await uploadMedia(payload.callbackUrl, payload.projectId, thumbKey, await fs.readFile(thumbPath), "image/jpeg");

      completed.push({
        title: clip.title,
        startMs: clip.startMs,
        endMs: clip.endMs,
        viralityScore: clip.viralityScore,
        hook: clip.hook,
        reason: clip.reason,
        keywords: clip.keywords || [],
        mediaKey,
        thumbKey,
      });
    }

    await reportClips(payload.callbackUrl, payload.projectId, completed);
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
