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

export default async function VisibilityPage() {
  const channel = await analyzeChannel();
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
        Hybrid dashboard for {channel.channel.title} — search impressions, CTR,
        view velocity, and keyword share of voice. Seed series stay demoable
        without Analytics API credentials.
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
          BeOne-linked monthly series · source: curated demo metrics
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
          Relative presence vs competitor pharma / oncology channels
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
                        <span
                          className={
                            row.channel.includes("BeOne")
                              ? "font-semibold text-sky"
                              : "text-ink"
                          }
                        >
                          {row.channel}
                        </span>
                        <span className="tabular-nums text-muted">
                          {row.shareOfVoice}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-navy/10">
                        <div
                          className={
                            row.channel.includes("BeOne")
                              ? "h-full rounded-full bg-gradient-to-r from-sky to-gold"
                              : "h-full rounded-full bg-navy/35"
                          }
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
