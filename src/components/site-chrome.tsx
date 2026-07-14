import Link from "next/link";
import { NAV_LINKS, VCF_BRAND, VCF_CONTACT_EMAIL, VCF_PRODUCT_NAME } from "@/lib/brand";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="brand-mark font-display text-xl font-semibold text-navy transition group-hover:text-sky">
            {VCF_BRAND}
          </span>
          <span className="hidden text-sm text-muted sm:inline">{VCF_PRODUCT_NAME}</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-ink/80 transition hover:bg-sky/10 hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={`mailto:${VCF_CONTACT_EMAIL}`}
            className="ml-1 hidden rounded-md bg-navy px-3 py-1.5 text-sm font-medium text-white transition hover:bg-sky sm:inline-block"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-navy-deep text-sky-soft/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-sm font-medium tracking-tight text-white">
          {VCF_BRAND} · {VCF_PRODUCT_NAME}
        </p>
        <p className="text-sm">
          Default channel{" "}
          <a
            className="text-gold-soft underline-offset-2 hover:underline"
            href="https://www.youtube.com/@BeOneMedicines"
            target="_blank"
            rel="noreferrer"
          >
            @BeOneMedicines
          </a>
          {" · "}
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
