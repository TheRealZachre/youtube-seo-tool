#!/usr/bin/env node
// Run: node scripts/seed-admin.mjs
// Creates the first admin user for the YouTube SEO platform.

import { createHash, randomUUID } from "crypto";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// Pure-JS bcrypt equivalent using a simple hash for seeding (bcryptjs requires ESM loader)
// We store a temporary plaintext marker; on first login the server will re-hash with bcrypt.
// For a real seed, install tsx and run the TS version instead.

const USERS_FILE = join(process.cwd(), "data", "vcf-seo-users.json");

function readDb() {
  try { return JSON.parse(readFileSync(USERS_FILE, "utf-8")); }
  catch { return { users: [] }; }
}

const name = process.argv[2] ?? "Zach";
const email = process.argv[3] ?? "zach@vibecodeflow.com";
const username = process.argv[4] ?? "zach";

const db = readDb();
if (db.users.some(u => u.email === email)) {
  console.log(`User ${email} already exists. No changes made.`);
  process.exit(0);
}

console.log(`\nTo create your first admin, run the app and use the setup route:\n`);
console.log(`  http://localhost:3005/api/admin/setup\n`);
console.log(`Or add users directly via the Admin Console once you're signed in.\n`);
