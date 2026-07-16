import { NextResponse } from "next/server";
import { countUsers, createUser } from "@/lib/auth/users";
import { createSessionToken, makeSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    if ((await countUsers()) > 0) {
      return NextResponse.json({ error: "Setup already completed." }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!body.name?.trim() || !body.email?.trim() || !body.password) {
      return NextResponse.json({ error: "name, email, and password are required." }, { status: 400 });
    }

    const user = await createUser({
      name: body.name,
      email: body.email,
      password: body.password,
      role: "admin",
    });

    const token = await createSessionToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    const response = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, role: user.role } });
    const cookie = makeSessionCookie(token);
    response.cookies.set(cookie.name, cookie.value, cookie.options as Parameters<typeof response.cookies.set>[2]);
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Setup failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
