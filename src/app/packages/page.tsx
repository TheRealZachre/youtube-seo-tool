import Link from "next/link";
import type { Metadata } from "next";
import { Package } from "lucide-react";
import { ScoreBadge, formatCount } from "@/components/score-ui";
import { analyzeChannel } from "@/lib/youtube/channel";
import { generatePackageFromVideo } from "@/lib/youtube/generate-seo";

export const metadata: Metadata = {
  title: "SEO packages",
};

export default async function PackagesPage() {
  const data = await analyzeChannel();
  const packages = data.videos.slice(0, 8).map((video) => ({
    video,
    package: generatePackageFromVideo(video),
  }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <p className="text-sm font-medium uppercase tracking-wider text-sky">
        Generate
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-navy">
        SEO package workspace
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Deterministic packages for the BeOne library — optimized titles under 70
        characters, chaptered descriptions, tags, and thumbnail overlays. Open a
        video for the full copy panel.
      </p>

      <div className="mt-8 grid gap-4">
        {packages.map(({ video, package: pkg }) => (
          <article
            key={video.id}
            className="grid gap-4 rounded-2xl border border-line bg-white/80 p-5 lg:grid-cols-[1fr_1.2fr] lg:items-start"
          >
            <div className="flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnailUrl}
                alt=""
                className="h-20 w-32 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gold" />
                  <span className="text-xs font-medium uppercase tracking-wide text-muted">
                    From {formatCount(video.viewCount)} views
                  </span>
                </div>
                <h2 className="mt-1 truncate font-display text-lg font-semibold text-navy">
                  {video.title}
                </h2>
                <div className="mt-2 flex items-center gap-3">
                  <ScoreBadge score={video.analysis.totalScore} size="sm" />
                  <Link
                    href={`/video/${video.id}`}
                    className="text-sm font-medium text-sky hover:underline"
                  >
                    Full package →
                  </Link>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-navy/95 p-4 text-white">
              <p className="text-xs uppercase tracking-wide text-gold-soft">
                Optimized title
              </p>
              <p className="mt-1 font-medium">{pkg.title}</p>
              <p className="mt-1 text-xs text-sky-soft/80">
                {pkg.titleCharCount} characters · {pkg.tags.length} tags
              </p>
              <p className="mt-3 line-clamp-3 text-sm text-white/75">
                {pkg.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
