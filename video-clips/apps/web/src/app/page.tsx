import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { VCF_BRAND, VCF_PRODUCT_NAME } from "@/lib/brand";
import { getSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getSession();
  const ctaHref = session ? "/app/new" : "/login";

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="hero-plane relative min-h-[88vh] overflow-hidden text-white">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-5 py-16">
            <p className="animate-rise font-display text-3xl font-semibold tracking-tight text-gold-soft sm:text-4xl md:text-5xl">
              {VCF_BRAND}
            </p>
            <h1 className="animate-rise-delay mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
              {VCF_PRODUCT_NAME}
            </h1>
            <p className="animate-rise-delay-2 mt-5 max-w-xl text-lg text-sky-soft/90 sm:text-xl">
              Paste a YouTube link, Drive file, or upload — AI finds the moments most likely to go viral and
              delivers ranked vertical clips with captions.
            </p>
            <div className="animate-rise-delay-2 mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={ctaHref}
                className="rounded-md bg-gold px-6 py-3 text-base font-semibold text-navy-deep transition hover:bg-gold-soft"
              >
                Create clips
              </Link>
              <Link
                href="/app"
                className="rounded-md border border-white/25 px-6 py-3 text-base font-medium text-white/85 transition hover:border-white/50 hover:bg-white/5"
              >
                My projects
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="font-display text-2xl font-semibold text-navy sm:text-3xl">How it works</h2>
          <p className="mt-2 max-w-2xl text-muted">
            One job per step — ingest, score, render — so you ship shorts without hunting through the timeline.
          </p>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Add your source",
                body: "YouTube URL, Google Drive file, or a local upload.",
              },
              {
                step: "02",
                title: "AI ranks gold nuggets",
                body: "Transcript + virality scoring for hook, flow, value, and trend.",
              },
              {
                step: "03",
                title: "Download vertical clips",
                body: "Captioned 9:16 MP4s sorted by score, ready for Shorts and Reels.",
              },
            ].map((item) => (
              <li key={item.step} className="border-t border-line pt-5">
                <p className="font-mono text-xs tracking-widest text-sky">{item.step}</p>
                <h3 className="mt-2 font-display text-xl font-semibold text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
