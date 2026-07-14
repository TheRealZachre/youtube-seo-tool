/** Canonical YouTube video thumbnail (always available for public videos). */
export function videoThumbnailUrl(
  videoId: string,
  quality: "max" | "hq" | "mq" = "hq"
) {
  const file =
    quality === "max"
      ? "maxresdefault.jpg"
      : quality === "hq"
        ? "hqdefault.jpg"
        : "mqdefault.jpg";
  return `https://i.ytimg.com/vi/${videoId}/${file}`;
}

export function pickThumbnailUrl(videoId: string, provided?: string): string {
  if (provided?.includes("i.ytimg.com") || provided?.includes("ytimg.com")) {
    return provided.split("?")[0] || provided;
  }
  return videoThumbnailUrl(videoId, "hq");
}

export function pickBestYouTubeThumbnail(
  thumbnails?: {
    maxres?: { url?: string };
    standard?: { url?: string };
    high?: { url?: string };
    medium?: { url?: string };
    default?: { url?: string };
  },
  videoId?: string
): string {
  const url =
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    "";

  if (url) return url;
  if (videoId) return videoThumbnailUrl(videoId, "hq");
  return "";
}
