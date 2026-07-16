import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { setUserPassword } from "@/lib/auth/users";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { userId, password } = (await request.json()) as { userId?: string; password?: string };
  if (!userId || !password) {
    return NextResponse.json({ error: "userId and password are required." }, { status: 400 });
  }

  try {
    await setUserPassword(userId, password);
    return NextResponse.json({ ok: true, message: "Password updated." });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed." }, { status: 422 });
  }
}
