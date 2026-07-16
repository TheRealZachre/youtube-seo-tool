import Link from "next/link";
import { NAV_LINKS, VCF_CONTACT_EMAIL, VCF_PRODUCT_NAME } from "@/lib/brand";
import { getSession } from "@/lib/auth/session";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-deep/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="group flex items-center gap-3" aria-label="Vibe.Code.Flow. Video Clips home">
          <img
            src="/vcf-logo-horizontal.png"
            alt="Vibe.Code.Flow."
            style={{ height: "36px", width: "auto", display: "block" }}
          />
          <span className="hidden text-sm font-semibold tracking-wide text-gold-soft sm:inline">
            {VCF_PRODUCT_NAME}
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          {session?.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-gold-soft transition hover:bg-gold/10"
            >
              Admin
            </Link>
          )}
          {session ? (
            <Link
              href="/signout"
              className="ml-1 rounded-md border border-white/20 px-3 py-1.5 text-sm font-medium text-white/60 transition hover:border-white/40 hover:text-white"
            >
              Sign out
            </Link>
          ) : (
            <Link
              href="/login"
              className="ml-1 rounded-md bg-gold px-3 py-1.5 text-sm font-medium text-navy-deep transition hover:bg-gold-soft"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-navy-deep text-sky-soft/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <img
          src="/vcf-logo-stacked.png"
          alt="Vibe.Code.Flow."
          style={{ height: "52px", width: "auto", display: "block" }}
        />
        <p className="text-sm">
          <span className="text-sky-soft/60">{VCF_PRODUCT_NAME} · </span>
          <a
            className="text-gold-soft underline-offset-2 hover:underline"
            href={`mailto:${VCF_CONTACT_EMAIL}`}
          >
            {VCF_CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </footer>
  );
}
