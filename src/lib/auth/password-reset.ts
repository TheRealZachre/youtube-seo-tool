import { randomBytes } from "crypto";
import fs from "fs/promises";
import path from "path";

const RESET_FILE = path.join(process.cwd(), "data", "vcf-seo-reset-tokens.json");
const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

interface ResetRecord {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}

interface ResetDatabase {
  tokens: ResetRecord[];
}

async function readDb(): Promise<ResetDatabase> {
  try {
    const raw = await fs.readFile(RESET_FILE, "utf-8");
    return JSON.parse(raw) as ResetDatabase;
  } catch {
    return { tokens: [] };
  }
}

async function writeDb(db: ResetDatabase): Promise<void> {
  // Prune old/used tokens on every write
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  db.tokens = db.tokens.filter(
    (t) => !t.usedAt && new Date(t.expiresAt).getTime() > cutoff
  );
  await fs.mkdir(path.dirname(RESET_FILE), { recursive: true });
  await fs.writeFile(RESET_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export async function createPasswordResetToken(userId: string): Promise<ResetRecord> {
  const db = await readDb();
  const now = new Date();

  // Invalidate any existing tokens for this user
  for (const t of db.tokens) {
    if (t.userId === userId && !t.usedAt) t.usedAt = now.toISOString();
  }

  const record: ResetRecord = {
    token: randomBytes(32).toString("hex"),
    userId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + TOKEN_TTL_MS).toISOString(),
  };
  db.tokens.push(record);
  await writeDb(db);
  return record;
}

export async function findValidResetToken(token: string): Promise<ResetRecord | null> {
  const db = await readDb();
  const entry = db.tokens.find((t) => t.token === token && !t.usedAt);
  if (!entry) return null;
  if (new Date(entry.expiresAt).getTime() < Date.now()) return null;
  return entry;
}

export async function markTokenUsed(token: string): Promise<void> {
  const db = await readDb();
  const entry = db.tokens.find((t) => t.token === token);
  if (entry) entry.usedAt = new Date().toISOString();
  await writeDb(db);
}

export function buildResetUrl(origin: string, token: string): string {
  return `${origin.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
}
