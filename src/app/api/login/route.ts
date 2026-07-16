import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { password, from } = body as { password?: string; from?: string };

  const expected = process.env.SITE_PASSWORD ?? "vcf2026";

  if (password !== expected) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const redirect = from && from.startsWith("/") ? from : "/";
  const response = NextResponse.json({ ok: true, redirect });

  response.cookies.set("vcf-auth", expected, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // 7-day session
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
