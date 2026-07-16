import { NextResponse } from "next/server";
import { findUserById, setUserPassword } from "@/lib/auth/users";
import { findValidResetToken, markTokenUsed } from "@/lib/auth/password-reset";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { token?: string; password?: string };
  const { token = "", password = "" } = body;

  if (!token || !password) {
    return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const record = await findValidResetToken(token);
  if (!record) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const user = await findUserById(record.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  await setUserPassword(record.userId, password);
  await markTokenUsed(token);

  return NextResponse.json({ ok: true, message: "Password updated. You can now sign in." });
}
