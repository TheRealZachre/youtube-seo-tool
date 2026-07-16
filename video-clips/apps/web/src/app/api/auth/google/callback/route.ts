import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { setGoogleRefreshToken } from "@/lib/auth/users";

export async function GET(request: Request) {
  const session = await getSession();
  const appUrl = (process.env.APP_URL || "http://localhost:3010").replace(/\/$/, "");
  if (!session) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");

  if (oauthError) {
    return NextResponse.redirect(`${appUrl}/app/new?drive=error`);
  }
  if (!code || state !== session.userId) {
    return NextResponse.redirect(`${appUrl}/app/new?drive=invalid`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/app/new?drive=config`);
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenJson = (await tokenRes.json()) as { refresh_token?: string; error?: string };
  if (!tokenRes.ok || !tokenJson.refresh_token) {
    console.error("[google/callback]", tokenJson);
    return NextResponse.redirect(`${appUrl}/app/new?drive=token`);
  }

  await setGoogleRefreshToken(session.userId, tokenJson.refresh_token);
  return NextResponse.redirect(`${appUrl}/app/new?drive=connected`);
}
