import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import type { PublicUser, UserRecord, UserRole, UsersDatabase } from "./types";

const USERS_FILE = path.join(process.cwd(), "data", "vcf-seo-users.json");

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

export async function findUserByLogin(login: string): Promise<UserRecord | undefined> {
  const normalized = normalizeLogin(login);
  const db = await readUsersDb();
  return db.users.find(
    (u) => u.email === normalized || u.username === normalized
  );
}

export async function findUserById(id: string): Promise<UserRecord | undefined> {
  const db = await readUsersDb();
  return db.users.find((u) => u.id === id);
}

export async function isUserAdminById(id: string): Promise<boolean> {
  const user = await findUserById(id);
  return user?.role === "admin";
}

export async function verifyUserPassword(
  login: string,
  password: string
): Promise<UserRecord | null> {
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

  const passwordHash = await bcrypt.hash(input.password, 12);
  const isFirstUser = db.users.length === 0;
  const user: UserRecord = {
    id: randomUUID(),
    name: input.name.trim(),
    email,
    username,
    passwordHash,
    role: input.role ?? (isFirstUser ? "admin" : "user"),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  await writeUsersDb(db);
  return user;
}

export async function deleteUser(userId: string, actingUserId?: string): Promise<void> {
  const db = await readUsersDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");
  if (actingUserId && actingUserId === userId) throw new Error("You cannot delete your own account.");
  const adminCount = db.users.filter((u) => u.role === "admin").length;
  if (user.role === "admin" && adminCount <= 1) throw new Error("Cannot delete the only admin.");
  db.users = db.users.filter((u) => u.id !== userId);
  await writeUsersDb(db);
}

export async function setUserPassword(userId: string, newPassword: string): Promise<void> {
  if (newPassword.length < 8) throw new Error("Password must be at least 8 characters.");
  const db = await readUsersDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("User not found.");
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await writeUsersDb(db);
}
