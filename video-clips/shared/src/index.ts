export type SourceType = "youtube" | "drive" | "upload";

export type JobStatus =
  | "queued"
  | "downloading"
  | "transcribing"
  | "scoring"
  | "rendering"
  | "done"
  | "failed";

export interface ClipPrefs {
  minDurationSec: number;
  maxDurationSec: number;
  maxClips: number;
}

export const DEFAULT_CLIP_PREFS: ClipPrefs = {
  minDurationSec: 30,
  maxDurationSec: 60,
  maxClips: 8,
};

export interface ProjectRecord {
  id: string;
  userId: string;
  title: string;
  sourceType: SourceType;
  sourceUrl?: string;
  sourceKey?: string;
  sourceFileName?: string;
  prefs: ClipPrefs;
  jobStatus: JobStatus;
  jobError?: string;
  jobProgress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClipCandidate {
  startMs: number;
  endMs: number;
  title: string;
  viralityScore: number;
  hook: string;
  reason: string;
  keywords?: string[];
}

export interface ClipRecord {
  id: string;
  projectId: string;
  title: string;
  startMs: number;
  endMs: number;
  durationSec: number;
  viralityScore: number;
  hook: string;
  reason: string;
  keywords: string[];
  mediaKey?: string;
  thumbKey?: string;
  rank: number;
  createdAt: string;
}

export interface TranscriptWord {
  word: string;
  startMs: number;
  endMs: number;
}

export interface TranscriptSegment {
  text: string;
  startMs: number;
  endMs: number;
  words?: TranscriptWord[];
}

export interface WorkerJobPayload {
  projectId: string;
  sourceType: SourceType;
  sourceUrl?: string;
  sourceKey?: string;
  prefs: ClipPrefs;
  callbackUrl: string;
  mediaBaseUrl?: string;
}

export interface WorkerStatusUpdate {
  projectId: string;
  status: JobStatus;
  progress?: string;
  error?: string;
}

export interface WorkerClipsComplete {
  projectId: string;
  status: "done";
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
  }>;
}

export function parseYouTubeId(input: string): string | null {
  try {
    const trimmed = input.trim();
    if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      return /^[\w-]{11}$/.test(id) ? id : null;
    }
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const shorts = url.pathname.match(/\/shorts\/([\w-]{11})/);
      if (shorts) return shorts[1];
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function parseDriveFileId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[\w-]{25,}$/.test(trimmed) && !trimmed.includes("/")) return trimmed;
  try {
    const url = new URL(trimmed);
    if (!url.hostname.includes("drive.google.com") && !url.hostname.includes("docs.google.com")) {
      return null;
    }
    const fileMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
    if (fileMatch) return fileMatch[1];
    const id = url.searchParams.get("id");
    if (id) return id;
  } catch {
    /* ignore */
  }
  return null;
}
