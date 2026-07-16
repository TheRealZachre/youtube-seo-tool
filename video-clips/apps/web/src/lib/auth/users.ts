import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import type { PublicUser, UserRecord, UserRole, UsersDatabase } from "./types";

const USERS_FILE = path.join(process.cwd(), "data", "vcf-clips-users.json");

function normalizeLogin(login: string): string {
  return login.trim().toLowerCase();
}

function isValidUsername(username: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{2,31}$/.test(username);
}

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role ?? "user",
    createdAt: user.createdAt,
    hasPassword: Boolean(user.passwordHash),
    hasGoogle: Boolean(user.googleRefreshToken),
  };
}

async function readUsersDb(): Promise<UsersDatabase> {
  try {
    const raw = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(raw) as UsersDatabase;
  } catch {
    return { users: [] };
  }
}

async function writeUsersDb(db: UsersDatabase): Promise<void> {
  await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export async function listUsers(): Promise<PublicUser[]> {
  const db = await readUsersDb();
  return db.users.map(toPublicUser).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function countUsers(): Promise<number> {
  const db = await readUsersDb();
  return db.users.length;
}

export async function findUserByLogin(login: string): Promise<UserRecord | undefined> {
  const normalized = normalizeLogin(login);
  const db = await readUsersDb();
  return db.users.find((u) => u.email === normalized || u.username === normalized);
}

export async function findUserById(id: string): Promise<UserRecord | undefined> {
  const db = await readUsersDb();
  return db.users.find((u) => u.id === id);
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  return findUserByLogin(email);
}

export async function verifyUserPassword(login: string, password: string): Promise<UserRecord | null> {
  const user = await findUserByLogin(login);
  if (!user?.passwordHash) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  username?: string;
  role?: UserRole;
}

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  const email = normalizeLogin(input.email);
  const username = input.username ? normalizeLogin(input.username) : undefined;
  const db = await readUsersDb();

  if (username && !isValidUsername(username)) {
    throw new Error("Username must be 3–32 chars: letters, numbers, dots, dashes, underscores.");
  }
  if (db.users.some((u) => u.email === email)) {
    throw new Error("An account with this email already exists.");
  }
  if (username && db.users.some((u) => u.username === username)) {
    throw new Error("This username is already taken.");
  }
  if (input.password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const role: UserRole = input.role ?? (db.users.length === 0 ? "admin" : "user");
  const user: UserRecord = {
    id: randomUUID(),
    name: input.name.trim(),
    email,
    username,
    passwordHash: await bcrypt.hash(input.password, 12),
    role,
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  await writeUsersDb(db);
  return user;
}

export async function setGoogleRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
  const db = await readUsersDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found");
  user.googleRefreshToken = refreshToken ?? undefined;
  await writeUsersDb(db);
}

export async function getGoogleRefreshToken(userId: string): Promise<string | undefined> {
  const user = await findUserById(userId);
  return user?.googleRefreshToken;
}
