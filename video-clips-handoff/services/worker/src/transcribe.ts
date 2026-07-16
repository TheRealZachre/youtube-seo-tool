import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import OpenAI, { toFile } from "openai";
import type { TranscriptSegment, TranscriptWord } from "@video-clips/shared";

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
      else reject(new Error(`${cmd} failed (${code}): ${stderr.slice(-1500)}`));
    });
  });
}

async function extractAudio(videoPath: string, audioPath: string): Promise<void> {
  const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
  await run(ffmpeg, [
    "-y",
    "-i",
    videoPath,
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-b:a",
    "64k",
    audioPath,
  ]);
}

export async function transcribeVideo(videoPath: string, workDir: string): Promise<TranscriptSegment[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required for transcription");
  }

  const audioPath = path.join(workDir, "audio.mp3");
  await extractAudio(videoPath, audioPath);

  const openai = new OpenAI({ apiKey });
  const file = await toFile(await fs.readFile(audioPath), "audio.mp3");

  const result = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
    response_format: "verbose_json",
    timestamp_granularities: ["word", "segment"],
  });

  const raw = result as unknown as {
    segments?: Array<{ start: number; end: number; text: string }>;
    words?: Array<{ word: string; start: number; end: number }>;
    text?: string;
  };

  const words: TranscriptWord[] = (raw.words ?? []).map((w) => ({
    word: w.word,
    startMs: Math.round(w.start * 1000),
    endMs: Math.round(w.end * 1000),
  }));

  if (raw.segments?.length) {
    return raw.segments.map((seg) => {
      const startMs = Math.round(seg.start * 1000);
      const endMs = Math.round(seg.end * 1000);
      return {
        text: seg.text.trim(),
        startMs,
        endMs,
        words: words.filter((w) => w.startMs >= startMs && w.endMs <= endMs + 50),
      };
    });
  }

  // Fallback single segment
  return [
    {
      text: (raw.text || "").trim(),
      startMs: 0,
      endMs: words.at(-1)?.endMs ?? 0,
      words,
    },
  ];
}
