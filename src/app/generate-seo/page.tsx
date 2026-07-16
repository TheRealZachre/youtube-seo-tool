import type { Metadata } from "next";
import { SeoGeneratorClient } from "./seo-generator-client";

export const metadata: Metadata = {
  title: "SEO Package Generator",
};

export default function GenerateSeoPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-sm font-semibold uppercase tracking-widest text-sky">Generate</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-navy">
        SEO Package Generator
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Paste a transcript, drop in a YouTube URL, or upload a video file — and get a full, ready-to-paste SEO package in seconds.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-white/70 p-6 sm:p-8">
        <SeoGeneratorClient />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3 text-center">
        {[
          { label: "Optimized title", desc: "Under 70 chars, keyword-first" },
          { label: "Full description", desc: "With chapters, CTAs & links" },
          { label: "Tags + thumbnail notes", desc: "25–30 tags, visual brief" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-line bg-white/60 px-4 py-4">
            <p className="font-semibold text-navy text-sm">{item.label}</p>
            <p className="mt-1 text-xs text-muted">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
