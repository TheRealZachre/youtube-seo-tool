import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import type { ClipCandidate, TranscriptSegment } from "@video-clips/shared";

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} failed (${code}): ${stderr.slice(-2000)}`));
    });
  });
}

function escapeAss(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\{/g, "\\{").replace(/\}/g, "\\}").replace(/\n/g, " ");
}

function msToAss(ms: number): string {
  const total = Math.max(0, ms) / 1000;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  const cs = Math.floor((total % 1) * 100);
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${cs
    .toString()
    .padStart(2, "0")}`;
}

function buildAss(
  segments: TranscriptSegment[],
  clip: ClipCandidate,
  relative: boolean
): string {
  const keywords = new Set((clip.keywords || []).map((k) => k.toLowerCase()));
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,64,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,0,2,40,40,160,1
Style: Highlight,Arial,64,&H0000E6FF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,0,2,40,40,160,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const words = segments.flatMap((s) => s.words || []);
  const lines: string[] = [];

  if (words.length) {
    const relevant = words.filter((w) => w.startMs >= clip.startMs - 50 && w.endMs <= clip.endMs + 50);
    // Group into ~4-word caption chunks
    for (let i = 0; i < relevant.length; i += 4) {
      const chunk = relevant.slice(i, i + 4);
      if (!chunk.length) continue;
      const start = relative ? chunk[0].startMs - clip.startMs : chunk[0].startMs;
      const end = relative ? chunk[chunk.length - 1].endMs - clip.startMs : chunk[chunk.length - 1].endMs;
      const text = chunk
        .map((w) => {
          const clean = w.word.trim();
          const hit = [...keywords].some((k) => clean.toLowerCase().includes(k));
          return hit ? `{\\rHighlight}${escapeAss(clean)}{\\r}` : escapeAss(clean);
        })
        .join(" ");
      lines.push(`Dialogue: 0,${msToAss(start)},${msToAss(Math.max(start + 200, end))},Default,,0,0,0,,${text}`);
    }
  } else {
    const relevantSegs = segments.filter((s) => s.endMs > clip.startMs && s.startMs < clip.endMs);
    for (const seg of relevantSegs) {
      const start = relative ? Math.max(0, seg.startMs - clip.startMs) : seg.startMs;
      const end = relative ? Math.max(start + 500, seg.endMs - clip.startMs) : seg.endMs;
      lines.push(
        `Dialogue: 0,${msToAss(start)},${msToAss(end)},Default,,0,0,0,,${escapeAss(seg.text)}`
      );
    }
  }

  return header + lines.join("\n") + "\n";
}

export async function renderClip(opts: {
  sourcePath: string;
  clip: ClipCandidate;
  segments: TranscriptSegment[];
  outDir: string;
  index: number;
}): Promise<{ mediaPath: string; thumbPath: string }> {
  const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
  const startSec = (opts.clip.startMs / 1000).toFixed(3);
  const durationSec = ((opts.clip.endMs - opts.clip.startMs) / 1000).toFixed(3);
  const assPath = path.join(opts.outDir, `clip-${opts.index}.ass`);
  const mediaPath = path.join(opts.outDir, `clip-${opts.index}.mp4`);
  const thumbPath = path.join(opts.outDir, `clip-${opts.index}.jpg`);

  await fs.writeFile(assPath, buildAss(opts.segments, opts.clip, true), "utf-8");

  // Center-crop to 9:16 1080x1920 and burn captions
  const vf = [
    "scale=1080:1920:force_original_aspect_ratio=increase",
    "crop=1080:1920",
    `ass=${assPath.replace(/\\/g, "/").replace(/:/g, "\\:")}`,
  ].join(",");

  await run(ffmpeg, [
    "-y",
    "-ss",
    startSec,
    "-i",
    opts.sourcePath,
    "-t",
    durationSec,
    "-vf",
    vf,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    mediaPath,
  ]);

  await run(ffmpeg, [
    "-y",
    "-ss",
    "0.5",
    "-i",
    mediaPath,
    "-frames:v",
    "1",
    "-q:v",
    "3",
    thumbPath,
  ]);

  return { mediaPath, thumbPath };
}
