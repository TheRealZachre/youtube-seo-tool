import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createUser, deleteUser, listUsers, updateUser } from "@/lib/auth/users";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const users = await listUsers();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json() as {
      name?: string; email?: string; username?: string; password?: string; role?: "admin" | "user";
    };
    const { name = "", email = "", username, password = "", role } = body;
    if (!name.trim() || !email.trim() || !password) {
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
    }
    const user = await createUser({ name, email, username, password, role });
    const { passwordHash: _, ...safe } = user;
    return NextResponse.json({ ok: true, user: safe }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to create user." }, { status: 422 });
  }
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json() as {
      userId: string; name?: string; email?: string; username?: string; role?: "admin" | "user";
    };
    const { userId, ...fields } = body;
    if (!userId) return NextResponse.json({ error: "userId required." }, { status: 400 });
    const user = await updateUser(userId, fields);
    const { passwordHash: _, ...safe } = user;
    return NextResponse.json({ ok: true, user: safe });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to update user." }, { status: 422 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  const { userId } = await request.json() as { userId?: string };
  if (!userId) return NextResponse.json({ error: "userId required." }, { status: 400 });
  try {
    await deleteUser(userId, session.userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to delete user." }, { status: 422 });
  }
}
