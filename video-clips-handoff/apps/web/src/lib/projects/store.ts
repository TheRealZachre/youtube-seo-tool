import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import {
  DEFAULT_CLIP_PREFS,
  type ClipPrefs,
  type ClipRecord,
  type JobStatus,
  type ProjectRecord,
  type SourceType,
} from "@video-clips/shared";

interface Store {
  projects: ProjectRecord[];
  clips: ClipRecord[];
}

const STORE_FILE = path.join(process.cwd(), "data", "vcf-clips-store.json");

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    return JSON.parse(raw) as Store;
  } catch {
    return { projects: [], clips: [] };
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(STORE_FILE), { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), "utf-8");
}

export async function listProjectsForUser(userId: string): Promise<ProjectRecord[]> {
  const store = await readStore();
  return store.projects
    .filter((p) => p.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getProject(id: string): Promise<ProjectRecord | undefined> {
  const store = await readStore();
  return store.projects.find((p) => p.id === id);
}

export async function getProjectForUser(id: string, userId: string): Promise<ProjectRecord | undefined> {
  const project = await getProject(id);
  if (!project || project.userId !== userId) return undefined;
  return project;
}

export interface CreateProjectInput {
  userId: string;
  title: string;
  sourceType: SourceType;
  sourceUrl?: string;
  sourceKey?: string;
  sourceFileName?: string;
  prefs?: Partial<ClipPrefs>;
}

export async function createProject(input: CreateProjectInput): Promise<ProjectRecord> {
  const now = new Date().toISOString();
  const project: ProjectRecord = {
    id: randomUUID(),
    userId: input.userId,
    title: input.title.trim() || "Untitled project",
    sourceType: input.sourceType,
    sourceUrl: input.sourceUrl,
    sourceKey: input.sourceKey,
    sourceFileName: input.sourceFileName,
    prefs: { ...DEFAULT_CLIP_PREFS, ...input.prefs },
    jobStatus: "queued",
    jobProgress: "Waiting for worker…",
    createdAt: now,
    updatedAt: now,
  };
  const store = await readStore();
  store.projects.unshift(project);
  await writeStore(store);
  return project;
}

export async function updateProjectStatus(
  id: string,
  patch: Partial<Pick<ProjectRecord, "jobStatus" | "jobError" | "jobProgress" | "sourceKey" | "title">>
): Promise<ProjectRecord | undefined> {
  const store = await readStore();
  const project = store.projects.find((p) => p.id === id);
  if (!project) return undefined;
  Object.assign(project, patch, { updatedAt: new Date().toISOString() });
  if ("jobError" in patch && patch.jobError === undefined) {
    delete project.jobError;
  }
  await writeStore(store);
  return project;
}

export async function listClipsForProject(projectId: string): Promise<ClipRecord[]> {
  const store = await readStore();
  return store.clips
    .filter((c) => c.projectId === projectId)
    .sort((a, b) => a.rank - b.rank || b.viralityScore - a.viralityScore);
}

export async function replaceClipsForProject(
  projectId: string,
  clips: Array<Omit<ClipRecord, "id" | "projectId" | "createdAt" | "rank" | "durationSec"> & { durationSec?: number }>
): Promise<ClipRecord[]> {
  const store = await readStore();
  store.clips = store.clips.filter((c) => c.projectId !== projectId);
  const now = new Date().toISOString();
  const ranked = [...clips]
    .sort((a, b) => b.viralityScore - a.viralityScore)
    .map((c, index) => {
      const durationSec = c.durationSec ?? (c.endMs - c.startMs) / 1000;
      const record: ClipRecord = {
        id: randomUUID(),
        projectId,
        title: c.title,
        startMs: c.startMs,
        endMs: c.endMs,
        durationSec,
        viralityScore: c.viralityScore,
        hook: c.hook,
        reason: c.reason,
        keywords: c.keywords ?? [],
        mediaKey: c.mediaKey,
        thumbKey: c.thumbKey,
        rank: index + 1,
        createdAt: now,
      };
      return record;
    });
  store.clips.push(...ranked);
  await writeStore(store);
  return ranked;
}

export function isActiveJobStatus(status: JobStatus): boolean {
  return status !== "done" && status !== "failed";
}
