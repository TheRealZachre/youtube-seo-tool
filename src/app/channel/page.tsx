import Link from "next/link";
import type { Metadata } from "next";
import { ChannelConnectForm } from "@/components/channel-connect-form";
import { FactorBars, ScoreBadge, formatCount } from "@/components/score-ui";
import { analyzeChannel, getDefaultChannelInput } from "@/lib/youtube/channel";

export const metadata: Metadata = {
  title: "Channel library",
};

type PageProps = {
  searchParams: Promise<{ channel?: string }>;
};

export default async function ChannelPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const channelInput = params.channel?.trim() || getDefaultChannelInput();
  const data = await analyzeChannel(channelInput);
  const avgScore =
    data.videos.length === 0
      ? 0
      : Math.round(
          data.videos.reduce((sum, v) => sum + v.analysis.totalScore, 0) /
            data.videos.length
        );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-sky">
            Connect · Score
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-navy">
            Channel library
          </h1>
          <p className="mt-2 max-w-xl text-muted">
            Videos sorted by SEO upside (lowest scores first) so you fix the
            biggest gaps first.
          </p>
        </div>
        <div className="w-full max-w-md">
          <ChannelConnectForm defaultChannel={channelInput} />
        </div>
      </div>

      <section className="mt-8 flex flex-col gap-5 rounded-2xl border border-line bg-white/80 p-5 sm:flex-row sm:items-center sm:p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.channel.thumbnailUrl}
          alt=""
          className="h-20 w-20 rounded-full border-2 border-gold/40 object-cover"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-semibold text-navy">
              {data.channel.title}
            </h2>
            <span className="rounded-md bg-sky/10 px-2 py-0.5 text-xs font-medium text-sky">
              @{data.channel.handle.replace("@", "")}
            </span>
            <span className="rounded-md bg-navy/5 px-2 py-0.5 text-xs font-medium text-muted">
              {data.source === "youtube-api" ? "Live YouTube API" : "Seed demo"}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-muted">
            {data.channel.description}
          </p>
          <p className="mt-3 flex flex-wrap gap-4 text-sm text-ink">
            <span>
              <strong>{formatCount(data.channel.subscriberCount)}</strong>{" "}
              subscribers
            </span>
            <span>
              <strong>{formatCount(data.channel.videoCount)}</strong> videos
            </span>
            <span>
              <strong>{formatCount(data.channel.viewCount)}</strong> views
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-cream px-4 py-3">
          <ScoreBadge score={avgScore} size="lg" />
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              Average SEO
            </p>
            <p className="font-display text-lg font-semibold text-navy">
              Library score
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-4">
        {data.videos.map((video) => (
          <Link
            key={video.id}
            href={`/video/${video.id}`}
            className="group grid gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-sky/40 hover:shadow-md sm:grid-cols-[10rem_1fr_auto] sm:items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnailUrl}
              alt=""
              className="aspect-video w-full rounded-lg object-cover sm:h-24 sm:w-40"
            />
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-semibold text-navy group-hover:text-sky">
                {video.title}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {formatCount(video.viewCount)} views ·{" "}
                {new Date(video.publishedAt).toLocaleDateString()}
              </p>
              <div className="mt-3 max-w-md">
                <FactorBars scores={video.analysis.factorScores} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
              <ScoreBadge score={video.analysis.totalScore} />
              <span className="text-sm font-medium text-sky">Open package →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
