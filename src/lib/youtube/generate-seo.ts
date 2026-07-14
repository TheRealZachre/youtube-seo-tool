import { extractKeywords, extractPhrases } from "./keywords";
import { analyzeVideoSeo } from "./score-video";
import type {
  SeoPackage,
  VideoAnalyzeRequest,
  VideoAnalyzeResponse,
  YouTubeVideo,
} from "./types";

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function buildTitle(keywords: string[], topic?: string): string {
  const primary = keywords[0] ?? "insights";
  const secondary = keywords[1] ?? "guide";
  const base = topic?.trim()
    ? `${topic.trim()} | ${primary}`
    : `${primary}: ${secondary} explained`;

  if (base.length <= 70) return base;

  const shortened = `${primary}: ${secondary}`;
  return shortened.length <= 70 ? shortened : shortened.slice(0, 67) + "...";
}

function buildDescription(
  transcript: string,
  keywords: string[],
  topic?: string
): string {
  const opening = transcript.trim().slice(0, 180).replace(/\s+/g, " ");
  const keywordLine = keywords.slice(0, 5).join(", ");
  const subject = topic?.trim() ?? keywords[0] ?? "this topic";

  return [
    `${opening}${opening.length >= 180 ? "..." : ""}`,
    "",
    `In this video, we break down ${subject} — covering ${keywordLine}.`,
    "",
    "🔔 Subscribe for more updates from BeOne Medicines",
    "🔗 Learn more: https://beonemedicines.com",
    "",
    `#${keywords[0] ?? "oncology"} #${keywords[1] ?? "patients"} #BeOneMedicines`,
  ].join("\n");
}

function buildChapterMarkers(
  transcript: string,
  durationSeconds = 600
): { time: string; title: string }[] {
  const sentences = transcript
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (sentences.length < 3) {
    return [{ time: "0:00", title: "Introduction" }];
  }

  const chunkSize = Math.ceil(sentences.length / 5);
  const markers: { time: string; title: string }[] = [];

  for (let i = 0; i < 5; i++) {
    const sentence = sentences[i * chunkSize];
    if (!sentence) break;
    const title =
      sentence.split(" ").slice(0, 6).join(" ") +
      (sentence.split(" ").length > 6 ? "..." : "");
    const time = formatTimestamp((durationSeconds / 5) * i);
    markers.push({ time, title });
  }

  return markers;
}

export function generateSeoPackage(
  transcript: string,
  options: {
    topic?: string;
    durationSeconds?: number;
    fileName?: string;
  } = {}
): SeoPackage {
  const keywords = extractKeywords(transcript, 15);
  const phrases = extractPhrases(transcript, 6);
  const title = buildTitle(keywords, options.topic ?? options.fileName);
  const description = buildDescription(transcript, keywords, options.topic);
  const tags = [...new Set([...phrases, ...keywords])].slice(0, 15);

  const chapterMarkers = buildChapterMarkers(
    transcript,
    options.durationSeconds ?? 600
  );

  const chapterBlock = chapterMarkers
    .map((m) => `${m.time} ${m.title}`)
    .join("\n");

  return {
    title,
    titleCharCount: title.length,
    description: `${description}\n\nChapters:\n${chapterBlock}`,
    tags,
    thumbnailOverlays: [
      keywords[0]?.toUpperCase() ?? "WATCH",
      "KEY INSIGHTS",
      options.topic?.slice(0, 20).toUpperCase() ?? "MUST SEE",
    ].filter(Boolean),
    chapterMarkers,
    endScreenSuggestions: [
      "Subscribe button — last 20 seconds",
      "Best-performing related video — top right",
      "Playlist link — bottom left",
    ],
  };
}

export function generatePackageFromVideo(video: YouTubeVideo): SeoPackage {
  const transcript = [
    video.title,
    video.description,
    video.tags.join(" "),
  ].join(". ");

  return generateSeoPackage(transcript, {
    topic: video.title,
    durationSeconds: video.durationSeconds,
  });
}

export function analyzeUploadedVideo(
  request: VideoAnalyzeRequest,
  options: {
    transcriptionSource?: VideoAnalyzeResponse["transcriptionSource"];
  } = {}
): VideoAnalyzeResponse {
  const transcript = request.transcript?.trim() ?? "";
  if (transcript.length < 20) {
    throw new Error("Transcript is too short to generate an SEO package.");
  }

  const keywords = extractKeywords(transcript, 15);
  const generated = generateSeoPackage(transcript, {
    topic: request.topic,
    durationSeconds: request.durationSeconds,
    fileName: request.fileName,
  });

  const now = new Date().toISOString();
  const projected = analyzeVideoSeo({
    title: generated.title,
    description: generated.description,
    tags: generated.tags,
    thumbnailUrl: "hqdefault",
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    durationSeconds: request.durationSeconds ?? 600,
    publishedAt: now,
  });

  let current: VideoAnalyzeResponse["current"];
  if (request.currentTitle) {
    current = analyzeVideoSeo({
      title: request.currentTitle,
      description: request.currentDescription ?? "",
      tags: request.currentTags ?? [],
      thumbnailUrl: "",
      viewCount: 100,
      likeCount: 5,
      commentCount: 1,
      durationSeconds: request.durationSeconds ?? 600,
      publishedAt: now,
    });
  }

  return {
    source: "analysis",
    transcript,
    transcriptionSource: options.transcriptionSource ?? ("manual" as const),
    current,
    generated,
    projected,
    keywords,
  };
}
