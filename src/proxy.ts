import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/login", "/_next", "/favicon.ico", "/vcf-wordmark.svg", "/vcf-wordmark-white.svg", "/vcf-icon.svg"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname.includes(".")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("vcf-auth")?.value;
  const expected = process.env.SITE_PASSWORD ?? "vcf2026";

  if (token !== expected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|vcf-wordmark|vcf-icon).*)"],
};
