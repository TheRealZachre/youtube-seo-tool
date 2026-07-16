import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { buildResetUrl, createPasswordResetToken } from "@/lib/auth/password-reset";
import { sendEmail } from "@/lib/email/resend";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { userId } = await request.json() as { userId?: string };
  if (!userId) return NextResponse.json({ error: "userId required." }, { status: 400 });

  const user = await findUserById(userId);
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const record = await createPasswordResetToken(user.id);
  const origin = request.headers.get("origin") ?? "https://youtubeseo.vibecodeflow.com";
  const inviteUrl = buildResetUrl(origin, record.token);

  const sent = await sendEmail({
    to: user.email,
    subject: "You've been invited to Vibe.Code.Flow. YouTube SEO",
    html: `
      <p>Hi ${user.name},</p>
      <p>You've been granted access to the <strong>Vibe.Code.Flow. YouTube SEO platform</strong>.</p>
      <p>Click the button below to set your password and sign in:</p>
      <p><a href="${inviteUrl}" style="background:#0b1f3a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600;">Accept invite &amp; set password</a></p>
      <p>Or copy this link: ${inviteUrl}</p>
      <p>This link expires in 1 hour. Once you've set your password, sign in at <a href="${origin}/login">${origin}/login</a>.</p>
      <p>— Vibe.Code.Flow.</p>
    `,
  });

  if (!sent && process.env.NODE_ENV !== "production") {
    return NextResponse.json({ ok: true, devInviteUrl: inviteUrl });
  }

  return NextResponse.json({ ok: sent, message: sent ? `Invite sent to ${user.email}.` : "Email not configured — copy the invite URL." , devInviteUrl: !sent ? inviteUrl : undefined });
}
