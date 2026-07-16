import { NextResponse } from "next/server";
import { findUserByLogin } from "@/lib/auth/users";
import { buildResetUrl, createPasswordResetToken } from "@/lib/auth/password-reset";
import { sendEmail } from "@/lib/email/resend";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { login?: string };
  const login = body.login?.trim() ?? "";

  if (!login) {
    return NextResponse.json({ error: "Email or username is required." }, { status: 400 });
  }

  const user = await findUserByLogin(login);
  if (!user?.passwordHash) {
    return NextResponse.json({ ok: true });
  }

  const record = await createPasswordResetToken(user.id);
  const origin = request.headers.get("origin") ?? "https://videoclips.vibecodeflow.com";
  const resetUrl = buildResetUrl(origin, record.token);

  const sent = await sendEmail({
    to: user.email,
    subject: "Reset your Vibe.Code.Flow. password",
    html: `
      <p>Hi ${user.name},</p>
      <p>You requested a password reset for your Vibe.Code.Flow. Video Clips account.</p>
      <p><a href="${resetUrl}" style="background:#0b1f3a;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Reset my password</a></p>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  });

  if (!sent && process.env.NODE_ENV !== "production") {
    return NextResponse.json({ ok: true, devResetUrl: resetUrl });
  }

  return NextResponse.json({ ok: true });
}
