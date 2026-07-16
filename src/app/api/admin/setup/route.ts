import { NextResponse } from "next/server";
import { listUsers, createUser } from "@/lib/auth/users";

// One-time setup route — creates the first admin if no users exist.
// Disabled once any user exists.
export async function POST(request: Request) {
  const existing = await listUsers();
  if (existing.length > 0) {
    return NextResponse.json({ error: "Setup already complete. Use /admin to manage users." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({})) as {
    name?: string; email?: string; username?: string; password?: string;
  };
  const { name = "", email = "", username, password = "" } = body;

  if (!name.trim() || !email.trim() || !password) {
    return NextResponse.json({ error: "name, email, and password are required." }, { status: 400 });
  }

  try {
    const user = await createUser({ name, email, username, password, role: "admin" });
    return NextResponse.json({ ok: true, message: `Admin account created for ${user.name}. You can now sign in.` }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed." }, { status: 422 });
  }
}

// GET — check setup status
export async function GET() {
  const existing = await listUsers();
  if (existing.length > 0) {
    return NextResponse.json({ setupComplete: true, message: "Platform already has users. Visit /login to sign in." });
  }
  return NextResponse.json({
    setupComplete: false,
    message: "No users yet. POST to this endpoint with { name, email, username, password } to create the first admin.",
  });
}
