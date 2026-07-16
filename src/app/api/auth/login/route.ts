import { NextResponse } from "next/server";
import { verifyUserPassword } from "@/lib/auth/users";
import { createSessionToken, makeSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as { login?: string; password?: string; from?: string };
    const { login = "", password = "", from = "/" } = body;

    if (!login.trim() || !password) {
      return NextResponse.json({ error: "Username/email and password are required." }, { status: 400 });
    }

    const user = await verifyUserPassword(login, password);
    if (!user) {
      return NextResponse.json({ error: "Incorrect username or password." }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    const redirect = from && from.startsWith("/") && !from.startsWith("/login") ? from : "/";
    const response = NextResponse.json({ ok: true, redirect });
    const cookie = makeSessionCookie(token);
    response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2]);
    return response;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
