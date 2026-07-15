import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FactorBars, ScoreBadge, formatCount } from "@/components/score-ui";
import { SeoPackagePanel } from "@/components/seo-package-panel";
import { analyzeChannel } from "@/lib/youtube/channel";
import { generatePackageFromVideo } from "@/lib/youtube/generate-seo";
import { getSeedVideo } from "@/lib/youtube/providers/seed";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const video = getSeedVideo(id) ?? (await findLiveVideo(id));
  return { title: video?.title ?? "Video SEO" };
}

async function findLiveVideo(id: string) {
  const channel = await analyzeChannel();
  return channel.videos.find((v) => v.id === id);
}

export default async function VideoPage({ params }: PageProps) {
  const { id } = await params;
  const channel = await analyzeChannel();
  const video =
    channel.videos.find((v) => v.id === id) ?? getSeedVideo(id) ?? null;

  if (!video) notFound();

  const packageData = generatePackageFromVideo(video);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link
        href="/channel"
        className="text-sm font-medium text-sky hover:underline"
      >
        ← Back to channel library
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={video.thumbnailUrl}
            alt=""
            className="aspect-video w-full rounded-2xl object-cover shadow-md"
          />
          <div className="mt-5 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-sky">
                Score · Generate
              </p>
              <h1 className="mt-1 font-display text-2xl font-semibold text-navy sm:text-3xl">
                {video.title}
              </h1>
              <p className="mt-2 text-sm text-muted">
                {formatCount(video.viewCount)} views ·{" "}
                {formatCount(video.likeCount)} likes ·{" "}
                {formatCount(video.commentCount)} comments
              </p>
            </div>
            <ScoreBadge score={video.analysis.totalScore} size="lg" />
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-white/80 p-5">
            <h2 className="font-display text-lg font-semibold text-navy">
              Factor breakdown
            </h2>
            <div className="mt-4">
              <FactorBars scores={video.analysis.factorScores} />
            </div>
            {video.analysis.recommendations.length > 0 && (
              <ul className="mt-5 space-y-2 border-t border-line pt-4">
                {video.analysis.recommendations.map((rec) => (
                  <li key={rec} className="text-sm text-muted">
                    <span className="mr-2 text-gold">▸</span>
                    {rec}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-cream/80 p-5">
            <h2 className="font-display text-lg font-semibold text-navy">
              Current description
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink/90">
              {video.description || "No description provided."}
            </p>
            <p className="mt-4 text-xs text-muted">
              Tags: {video.tags.length ? video.tags.join(", ") : "none"}
            </p>
          </div>
        </section>

        <SeoPackagePanel
          packageData={packageData}
          videoId={video.id}
          currentScore={video.analysis.totalScore}
        />
      </div>
    </div>
  );
}
