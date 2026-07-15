import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Package,
  Plug,
  Sparkles,
} from "lucide-react";
import { SEO_SCORE_FACTORS, VCF_BRAND, VCF_PRODUCT_NAME } from "@/lib/brand";

const STEPS = [
  {
    icon: Plug,
    title: "Connect",
    body: "Pull @BeOneMedicines (or any channel) via the YouTube Data API — or demo with the curated seed library.",
    href: "/channel",
  },
  {
    icon: Sparkles,
    title: "Score",
    body: "Weighted SEO score across title, description, tags, thumbnail, retention, and engagement.",
    href: "/channel",
  },
  {
    icon: Package,
    title: "Generate",
    body: "Ship an optimized title, description with chapters, tags, thumbnail overlays, and end-screen notes.",
    href: "/packages",
  },
  {
    icon: BarChart3,
    title: "Track",
    body: "Watch impressions, CTR, view velocity, and keyword share of voice against competitors.",
    href: "/visibility",
  },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:pt-16">
      <section className="relative overflow-hidden rounded-3xl bg-navy px-6 py-14 text-white shadow-[0_24px_80px_rgba(11,31,58,0.28)] sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-16 top-0 h-64 w-64 rounded-full bg-sky/30 blur-3xl animate-pulse-soft" />
          <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-gold/25 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative max-w-2xl">
          <p className="animate-rise font-display text-3xl font-semibold tracking-tight text-gold-soft sm:text-4xl md:text-5xl">
            {VCF_BRAND}
          </p>
          <h1 className="animate-rise-delay mt-3 font-display text-2xl font-medium leading-tight text-white sm:text-3xl">
            {VCF_PRODUCT_NAME} for channels that need to be found
          </h1>
          <p className="animate-rise-delay-2 mt-4 max-w-xl text-base leading-relaxed text-sky-soft/95 sm:text-lg">
            Score every upload, generate a full SEO package, and track visibility
            lift — starting with BeOne Medicines.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/channel"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy-deep transition hover:bg-gold-soft"
            >
              Connect @BeOneMedicines
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/visibility"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View visibility
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-navy">
          Connect → Score → Generate → Track
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          One pipeline from channel ingest to packaged SEO and measurable lift.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <Link
              key={step.title}
              href={step.href}
              className="group rounded-2xl border border-line bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky/40 hover:shadow-md"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <step.icon className="h-6 w-6 text-sky" />
              <h3 className="mt-3 font-display text-lg font-semibold text-navy group-hover:text-sky">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-line bg-white/70 p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-navy">
          How videos are scored
        </h2>
        <p className="mt-1 text-sm text-muted">
          Weighted factors matching the product brief — title 25%, description
          20%, tags 15%, thumbnail / retention / engagement 40%.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SEO_SCORE_FACTORS.map((factor) => (
            <li
              key={factor.key}
              className="flex items-start gap-3 rounded-xl bg-cream/80 px-4 py-3"
            >
              <span className="font-display text-lg font-semibold text-gold">
                {factor.weight}%
              </span>
              <div>
                <p className="font-medium text-ink">{factor.label}</p>
                <p className="text-sm text-muted">{factor.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
