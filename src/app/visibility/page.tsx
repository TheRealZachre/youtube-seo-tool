import Link from "next/link";
import type { Metadata } from "next";
import { analyzeChannel } from "@/lib/youtube/channel";
import {
  getCompetitorShareOfVoice,
  getVisibilitySeries,
} from "@/lib/youtube/visibility";
import { formatCount } from "@/components/score-ui";

export const metadata: Metadata = {
  title: "Visibility tracking",
};

type PageProps = {
  searchParams: Promise<{ channel?: string }>;
};

export default async function VisibilityPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const channelInput = params.channel?.trim() ?? "";

  if (!channelInput) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-sm font-medium uppercase tracking-wider text-sky">Track</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-navy">Visibility tracking</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Search impressions, CTR, view velocity, and keyword share of voice — connected to your channel.
        </p>
        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line bg-white/50 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky/10">
            <svg className="h-7 w-7 text-sky" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <p className="font-display text-lg font-semibold text-navy">No channel connected yet</p>
          <p className="max-w-sm text-sm text-muted">
            Connect a YouTube channel first to view impression trends, CTR data, and keyword share of voice.
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

  const channel = await analyzeChannel(channelInput);
  const series = getVisibilitySeries();
  const competitors = getCompetitorShareOfVoice();
  const latest = series[series.length - 1]!;
  const first = series[0]!;
  const impressionLift = Math.round(
    ((latest.impressions - first.impressions) / first.impressions) * 100
  );
  const maxImpressions = Math.max(...series.map((p) => p.impressions));
  const keywords = [...new Set(competitors.map((c) => c.keyword))];

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <p className="text-sm font-medium uppercase tracking-wider text-sky">
        Track
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-navy">
        Visibility tracking
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Visibility dashboard for {channel.channel.title} — search impressions, CTR,
        view velocity, and keyword share of voice.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Search impressions",
            value: formatCount(latest.impressions),
            note: `+${impressionLift}% vs Jan`,
          },
          {
            label: "Avg CTR",
            value: `${latest.ctr.toFixed(1)}%`,
            note: "Thumbnail + title lift",
          },
          {
            label: "View velocity",
            value: formatCount(latest.viewVelocity),
            note: "Views / rolling window",
          },
          {
            label: "Subscriber attribution",
            value: `+${latest.subscribers}`,
            note: "From organic search",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-line bg-white/85 p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {kpi.label}
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-navy">
              {kpi.value}
            </p>
            <p className="mt-1 text-sm text-sky">{kpi.note}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-line bg-white/80 p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-navy">
          Impressions & CTR trend
        </h2>
        <p className="mt-1 text-sm text-muted">
          Monthly series · source: demo metrics
        </p>
        <div className="mt-6 flex h-48 items-end gap-3 sm:gap-4">
          {series.map((point) => (
            <div
              key={point.month}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div
                className="relative w-full rounded-t-md bg-gradient-to-t from-navy to-sky"
                style={{
                  height: `${Math.max(12, (point.impressions / maxImpressions) * 100)}%`,
                }}
                title={`${point.impressions.toLocaleString()} impressions · ${point.ctr}% CTR`}
              />
              <span className="text-xs font-medium text-muted">{point.month}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {series.slice(-3).map((point) => (
            <div
              key={`detail-${point.month}`}
              className="rounded-lg bg-cream/90 px-3 py-2 text-sm"
            >
              <span className="font-medium text-navy">{point.month}</span>
              <span className="text-muted">
                {" "}
                · CTR {point.ctr}% · vel {formatCount(point.viewVelocity)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-navy">
          Keyword share of voice
        </h2>
        <p className="mt-1 text-sm text-muted">
          Relative presence vs competitor channels
        </p>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {keywords.map((keyword) => {
            const rows = competitors.filter((c) => c.keyword === keyword);
            return (
              <div
                key={keyword}
                className="rounded-2xl border border-line bg-white/80 p-5"
              >
                <h3 className="font-display text-lg font-semibold text-navy">
                  {keyword}
                </h3>
                <ul className="mt-4 space-y-3">
                  {rows.map((row) => (
                    <li key={`${keyword}-${row.channel}`}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-ink">{row.channel}</span>
                        <span className="tabular-nums text-muted">
                          {row.shareOfVoice}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-navy/10">
                        <div
                          className="h-full rounded-full bg-navy/35"
                          style={{ width: `${row.shareOfVoice}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
