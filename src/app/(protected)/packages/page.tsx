import Link from "next/link";
import type { Metadata } from "next";
import { Package } from "lucide-react";
import { ScoreBadge, formatCount } from "@/components/score-ui";
import { analyzeChannel } from "@/lib/youtube/channel";
import { generatePackageFromVideo } from "@/lib/youtube/generate-seo";

export const metadata: Metadata = {
  title: "SEO packages",
};

type PageProps = {
  searchParams: Promise<{ channel?: string }>;
};

export default async function PackagesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const channelInput = params.channel?.trim() ?? "";

  if (!channelInput) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-sm font-medium uppercase tracking-wider text-sky">Generate</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-navy">SEO package workspace</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Optimized titles, chaptered descriptions, tags, and thumbnail overlays — generated from your channel&apos;s videos.
        </p>
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line bg-white/50 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky/10">
            <Package className="h-7 w-7 text-sky" />
          </div>
          <p className="font-display text-lg font-semibold text-navy">No channel connected yet</p>
          <p className="max-w-sm text-sm text-muted">
            Connect a YouTube channel to generate SEO packages for your videos.
          </p>
          <Link
            href="/channel"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky"
          >
            Connect a channel →
          </Link>
        </div>
      </div>
    );
  }

  const data = await analyzeChannel(channelInput);
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
        Optimized titles under 70 characters, chaptered descriptions, tags, and thumbnail overlays for {data.channel.title}. Open a
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
