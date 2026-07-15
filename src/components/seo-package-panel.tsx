"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import type { SeoPackage } from "@/lib/youtube/types";

export function SeoPackagePanel({
  packageData,
  videoId,
  currentScore,
}: {
  packageData: SeoPackage;
  videoId: string;
  currentScore: number;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1600);
  }

  return (
    <aside className="rounded-2xl border border-line bg-navy p-5 text-white shadow-lg sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gold-soft">
            SEO package
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold">
            Recommended update
          </h2>
          <p className="mt-1 text-sm text-sky-soft/90">
            Current score {currentScore} · Package optimized for discovery
          </p>
        </div>
        <span className="rounded-md bg-white/10 px-2 py-1 font-mono text-xs text-sky-soft">
          {videoId.slice(0, 10)}
        </span>
      </div>

      <PackageBlock
        label="Title"
        meta={`${packageData.titleCharCount}/70 chars`}
        value={packageData.title}
        copied={copied === "Title"}
        onCopy={() => copy("Title", packageData.title)}
      />

      <PackageBlock
        label="Description"
        value={packageData.description}
        copied={copied === "Description"}
        onCopy={() => copy("Description", packageData.description)}
        multiline
      />

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gold-soft">Tags</h3>
          <button
            type="button"
            onClick={() => copy("Tags", packageData.tags.join(", "))}
            className="inline-flex items-center gap-1 text-xs text-sky-soft hover:text-white"
          >
            {copied === "Tags" ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            Copy
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {packageData.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-sky-soft"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-gold-soft">
          Thumbnail overlays
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-white/90">
          {packageData.thumbnailOverlays.map((line) => (
            <li key={line}>• {line}</li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-gold-soft">Chapters</h3>
        <ul className="mt-2 space-y-1 font-mono text-xs text-sky-soft">
          {packageData.chapterMarkers.map((m) => (
            <li key={`${m.time}-${m.title}`}>
              {m.time} — {m.title}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 border-t border-white/15 pt-4">
        <h3 className="text-sm font-semibold text-gold-soft">End screens</h3>
        <ul className="mt-2 space-y-1 text-sm text-white/85">
          {packageData.endScreenSuggestions.map((s) => (
            <li key={s}>• {s}</li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function PackageBlock({
  label,
  value,
  meta,
  copied,
  onCopy,
  multiline,
}: {
  label: string;
  value: string;
  meta?: string;
  copied: boolean;
  onCopy: () => void;
  multiline?: boolean;
}) {
  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-semibold text-gold-soft">{label}</h3>
          {meta && <span className="text-xs text-white/50">{meta}</span>}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 text-xs text-sky-soft hover:text-white"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          Copy
        </button>
      </div>
      <p
        className={
          multiline
            ? "mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-white/8 p-3 text-sm leading-relaxed text-white/90"
            : "mt-2 rounded-lg bg-white/8 p-3 text-sm font-medium text-white"
        }
      >
        {value}
      </p>
    </div>
  );
}
