import OpenAI from "openai";
import type { ClipCandidate, ClipPrefs, TranscriptSegment } from "@video-clips/shared";

function buildTranscriptForPrompt(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => {
      const start = (s.startMs / 1000).toFixed(1);
      const end = (s.endMs / 1000).toFixed(1);
      return `[${start}-${end}] ${s.text}`;
    })
    .join("\n");
}

export async function scoreHighlights(
  segments: TranscriptSegment[],
  prefs: ClipPrefs
): Promise<ClipCandidate[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required for scoring");

  const openai = new OpenAI({ apiKey });
  const transcript = buildTranscriptForPrompt(segments);
  const durationSec = Math.max(...segments.map((s) => s.endMs), 0) / 1000;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert short-form video editor. Given a timestamped transcript, pick the best self-contained clip windows for TikTok / YouTube Shorts / Reels.

Rules:
- Return JSON: {"clips":[{"startSec":number,"endSec":number,"title":string,"viralityScore":0-99,"hook":string,"reason":string,"keywords":string[]}]}
- Prefer ${prefs.minDurationSec}-${prefs.maxDurationSec} second clips (hard bounds ±5s ok).
- Return up to ${prefs.maxClips} clips, ranked best-first.
- Score using: hook (first 3s), flow (coherent arc + ending), value (useful/emotional), trend (shareability).
- Clips must not heavily overlap; stay within 0..${durationSec.toFixed(1)} seconds.
- Titles are punchy, under 60 chars. Keywords are 1-3 words to highlight in captions.`,
      },
      {
        role: "user",
        content: `Transcript:\n${transcript.slice(0, 100_000)}`,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content || "{}";
  let parsed: {
    clips?: Array<{
      startSec: number;
      endSec: number;
      title: string;
      viralityScore: number;
      hook: string;
      reason: string;
      keywords?: string[];
    }>;
  };
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Model returned invalid JSON for clip scoring");
  }

  const clips = (parsed.clips ?? [])
    .map((c) => {
      let startMs = Math.max(0, Math.round(Number(c.startSec) * 1000));
      let endMs = Math.round(Number(c.endSec) * 1000);
      const minMs = prefs.minDurationSec * 1000;
      const maxMs = prefs.maxDurationSec * 1000;
      if (endMs - startMs < minMs * 0.7) endMs = startMs + minMs;
      if (endMs - startMs > maxMs * 1.2) endMs = startMs + maxMs;
      return {
        startMs,
        endMs,
        title: String(c.title || "Clip").slice(0, 80),
        viralityScore: Math.max(0, Math.min(99, Math.round(Number(c.viralityScore) || 0))),
        hook: String(c.hook || "").slice(0, 160),
        reason: String(c.reason || "").slice(0, 400),
        keywords: (c.keywords || []).map(String).slice(0, 5),
      } satisfies ClipCandidate;
    })
    .filter((c) => c.endMs > c.startMs)
    .sort((a, b) => b.viralityScore - a.viralityScore)
    .slice(0, prefs.maxClips);

  if (!clips.length) {
    throw new Error("No clip candidates returned from scoring model");
  }
  return clips;
}

/** Deterministic fallback when API unavailable — used only in DEMO_MODE */
export function demoScoreHighlights(segments: TranscriptSegment[], prefs: ClipPrefs): ClipCandidate[] {
  const totalMs = Math.max(...segments.map((s) => s.endMs), prefs.minDurationSec * 1000);
  const window = Math.min(prefs.maxDurationSec, Math.max(prefs.minDurationSec, 45)) * 1000;
  const clips: ClipCandidate[] = [];
  const count = Math.min(prefs.maxClips, Math.max(1, Math.floor(totalMs / (window * 0.8))));
  for (let i = 0; i < count; i++) {
    const startMs = Math.min(totalMs - window, Math.floor((i * totalMs) / count));
    const endMs = Math.min(totalMs, startMs + window);
    const text = segments
      .filter((s) => s.startMs < endMs && s.endMs > startMs)
      .map((s) => s.text)
      .join(" ")
      .slice(0, 120);
    clips.push({
      startMs: Math.max(0, startMs),
      endMs,
      title: `Highlight ${i + 1}`,
      viralityScore: Math.max(40, 92 - i * 7),
      hook: text.split(/[.!?]/)[0]?.slice(0, 80) || "Strong opening beat",
      reason: "Demo ranking — set OPENAI_API_KEY for real virality scoring.",
      keywords: text.split(/\s+/).filter(Boolean).slice(0, 2),
    });
  }
  return clips;
}
