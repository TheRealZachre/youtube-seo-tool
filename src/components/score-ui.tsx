import clsx from "clsx";

export function ScoreBadge({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md" | "lg";
}) {
  const tone =
    score >= 80 ? "text-sky" : score >= 60 ? "text-gold" : "text-red-600";
  const dims =
    size === "lg"
      ? "h-20 w-20 text-2xl"
      : size === "sm"
        ? "h-10 w-10 text-sm"
        : "h-14 w-14 text-lg";

  return (
    <div
      className={clsx(
        "score-ring relative grid place-items-center rounded-full p-[3px]",
        dims
      )}
      style={{ ["--score" as string]: score }}
      title={`SEO score ${score}`}
    >
      <div
        className={clsx(
          "grid h-full w-full place-items-center rounded-full bg-white font-display font-semibold",
          tone
        )}
      >
        {score}
      </div>
    </div>
  );
}

export function FactorBars({
  scores,
}: {
  scores: {
    title: number;
    description: number;
    tags: number;
    thumbnail: number;
    retention: number;
    engagement: number;
  };
}) {
  const rows: { key: keyof typeof scores; label: string; weight: string }[] = [
    { key: "title", label: "Title", weight: "25%" },
    { key: "description", label: "Description", weight: "20%" },
    { key: "tags", label: "Tags", weight: "15%" },
    { key: "thumbnail", label: "Thumbnail", weight: "15%" },
    { key: "retention", label: "Retention", weight: "15%" },
    { key: "engagement", label: "Engagement", weight: "10%" },
  ];

  return (
    <div className="space-y-2.5">
      {rows.map((row) => (
        <div key={row.key} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-2 text-sm">
          <div className="flex items-baseline justify-between gap-1">
            <span className="font-medium text-ink">{row.label}</span>
            <span className="text-xs text-muted">{row.weight}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-navy/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky to-gold transition-all"
              style={{ width: `${scores[row.key]}%` }}
            />
          </div>
          <span className="text-right tabular-nums text-muted">{scores[row.key]}</span>
        </div>
      ))}
    </div>
  );
}

export function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
