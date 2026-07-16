import Link from "next/link";
import { ArrowRight, BarChart3, Package, Search, Sparkles, TrendingUp, PlayCircle } from "lucide-react";
import { SEO_SCORE_FACTORS } from "@/lib/brand";

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Connect your channel",
    body: "Enter any YouTube channel handle or URL. The platform pulls your video library, metadata, and performance signals in seconds.",
  },
  {
    num: "02",
    title: "Score every video",
    body: "Each upload gets a weighted SEO score across title, description, tags, thumbnail, retention, and engagement — with a clear breakdown of what to fix.",
  },
  {
    num: "03",
    title: "Generate your SEO package",
    body: "Ship an optimized title under 70 characters, chaptered description, ranked tags, and thumbnail overlay notes — ready to paste.",
  },
  {
    num: "04",
    title: "Track visibility lift",
    body: "Watch impressions, CTR, view velocity, and keyword share of voice move as you apply improvements over time.",
  },
] as const;

const TOOLS = [
  {
    icon: Search,
    label: "SmartRank Keywords",
    desc: "AI-ranked keyword suggestions with search volume and competition estimates tailored to your topic.",
    href: "/keywords",
  },
  {
    icon: Sparkles,
    label: "Intelligent SEO Tags",
    desc: "Clustered primary, secondary, and long-tail tags generated from your title and description.",
    href: "/tags",
  },
  {
    icon: TrendingUp,
    label: "Thumbnail CTR Analysis",
    desc: "Upload a thumbnail and get a predicted CTR score, letter grade, and specific improvement notes.",
    href: "/thumbnails",
  },
  {
    icon: BarChart3,
    label: "Channel Authority Scan",
    desc: "Full authority audit — niche position, content gaps, posting cadence, and growth recommendations.",
    href: "/audit",
  },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-12 sm:pt-20">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl bg-navy px-8 py-16 text-white shadow-[0_24px_80px_rgba(11,31,58,0.32)] sm:px-14 sm:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-10 h-72 w-72 rounded-full bg-sky/25 blur-3xl" />
          <div className="absolute -bottom-10 right-0 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>
        <div className="relative max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold-soft">
            <PlayCircle className="h-3.5 w-3.5" />
            YouTube SEO · Powered by Vibe.Code.Flow.
          </div>
          <h1 className="animate-rise font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
            Stop flying blind<br />on YouTube.
          </h1>
          <p className="animate-rise-delay mt-5 max-w-xl text-lg leading-relaxed text-sky-soft/90">
            Score every upload, generate a full SEO package, and track visibility
            lift — for any YouTube channel. No guesswork. No generic dashboards.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/channel"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-navy-deep transition hover:bg-gold-soft"
            >
              Connect a channel
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/visibility"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              View visibility
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mt-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky">How it works</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-navy">
          Up and running in minutes.<br />Results from day one.
        </h2>
        <div className="mt-10 grid gap-0 divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:divide-y-0">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.num} className="px-0 py-6 sm:px-6 sm:py-0 lg:px-8">
              <p className="font-display text-4xl font-semibold text-navy/15">{step.num}</p>
              <h3 className="mt-3 font-display text-base font-semibold text-navy">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEO Tools ── */}
      <section className="mt-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-sky">AI tools</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-navy">
          Purpose-built for YouTube SEO.
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Every tool is designed for a specific job — keyword research, tag generation, thumbnail scoring, or channel auditing. No filler.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.label}
              href={tool.href}
              className="group flex flex-col gap-4 rounded-2xl border border-line bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky/40 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky/10 transition group-hover:bg-sky/20">
                <tool.icon className="h-5 w-5 text-sky" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-navy group-hover:text-sky">
                  {tool.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{tool.desc}</p>
              </div>
              <span className="mt-auto text-xs font-semibold text-sky">
                Open tool →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Scoring breakdown ── */}
      <section className="mt-20 rounded-3xl bg-navy px-8 py-12 text-white sm:px-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gold-soft">Scoring</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-white">
              Every video scored.<br />Every factor explained.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-sky-soft/80">
              Six weighted factors tell you exactly what&apos;s working and what isn&apos;t — so you know where to focus before publishing, not after.
            </p>
            <Link
              href="/channel"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy-deep transition hover:bg-gold-soft"
            >
              Score my channel →
            </Link>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {SEO_SCORE_FACTORS.map((factor) => (
              <li
                key={factor.key}
                className="flex items-start gap-3 rounded-xl bg-white/6 px-4 py-3"
              >
                <span className="font-display text-lg font-semibold text-gold-soft">
                  {factor.weight}%
                </span>
                <div>
                  <p className="font-medium text-white">{factor.label}</p>
                  <p className="text-sm text-sky-soft/70">{factor.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="mt-16 grid gap-6 text-center sm:grid-cols-3">
        {[
          { stat: "6", label: "SEO factors scored per video" },
          { stat: "4×", label: "Reporting views — channel, video, packages, visibility" },
          { stat: "0", label: "Spreadsheets needed" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-line bg-white/70 px-6 py-8">
            <p className="font-display text-5xl font-semibold text-navy">{item.stat}</p>
            <p className="mt-2 text-sm text-muted">{item.label}</p>
          </div>
        ))}
      </section>

      {/* ── CTA ── */}
      <section className="mt-16 rounded-3xl border border-line bg-white/70 px-8 py-14 text-center">
        <h2 className="font-display text-3xl font-semibold text-navy">
          Tell us the channel.<br />We&apos;ll show you what to fix.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-muted">
          Connect any YouTube channel handle and get a full SEO breakdown — scored, packaged, and ready to act on.
        </p>
        <Link
          href="/channel"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky"
        >
          Connect a channel
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

    </div>
  );
}
