import { extractKeywords } from "./keywords";
import type { VideoFactorScores, VideoSeoAnalysis, YouTubeVideo } from "./types";

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

function scoreTitle(title: string, keywords: string[]): number {
  if (!title.trim()) return 0;
  let score = 70;
  const len = title.length;

  if (len <= 70) score += 15;
  else score -= Math.min(30, (len - 70) * 2);

  if (len >= 40 && len <= 60) score += 10;

  const lower = title.toLowerCase();
  const keywordHits = keywords.filter((k) => lower.includes(k)).length;
  score += Math.min(15, keywordHits * 5);

  if (title === title.toUpperCase() && title.length > 10) score -= 15;
  if (/[0-9]/.test(title)) score += 5;

  return clamp(score);
}

function scoreDescription(description: string, keywords: string[]): number {
  if (!description.trim()) return 0;
  let score = 50;
  const len = description.length;
  const opening = description.slice(0, 200).toLowerCase();

  if (len >= 200) score += 15;
  if (len >= 500) score += 10;

  const keywordHits = keywords.filter((k) => opening.includes(k)).length;
  score += Math.min(20, keywordHits * 4);

  if (/https?:\/\//.test(description)) score += 10;
  if (/\b(subscribe|learn more|visit|click|watch)\b/i.test(description)) {
    score += 10;
  }
  if (/#[a-z0-9]+/i.test(description)) score += 5;

  return clamp(score);
}

function scoreTags(tags: string[], keywords: string[]): number {
  if (tags.length === 0) return 10;
  let score = 40;
  score += Math.min(30, tags.length * 3);

  const tagText = tags.join(" ").toLowerCase();
  const keywordHits = keywords.filter((k) => tagText.includes(k)).length;
  score += Math.min(30, keywordHits * 5);

  return clamp(score);
}

function scoreThumbnail(thumbnailUrl: string): number {
  if (!thumbnailUrl) return 30;
  if (thumbnailUrl.includes("maxresdefault")) return 90;
  if (thumbnailUrl.includes("hqdefault")) return 75;
  return 60;
}

function scoreRetention(
  video: Pick<YouTubeVideo, "viewCount" | "durationSeconds" | "publishedAt">
): number {
  const ageDays = Math.max(
    1,
    (Date.now() - new Date(video.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  const viewsPerDay = video.viewCount / ageDays;
  const minutes = Math.max(1, video.durationSeconds / 60);

  if (viewsPerDay > 500) return 90;
  if (viewsPerDay > 100) return 75;
  if (viewsPerDay > 25) return 60;
  if (minutes >= 8) return 55;
  return 45;
}

function scoreEngagement(
  video: Pick<YouTubeVideo, "viewCount" | "likeCount" | "commentCount">
): number {
  if (video.viewCount === 0) return 40;
  const engagementRate =
    ((video.likeCount + video.commentCount * 3) / video.viewCount) * 100;

  if (engagementRate > 5) return 95;
  if (engagementRate > 2) return 80;
  if (engagementRate > 1) return 65;
  if (engagementRate > 0.3) return 50;
  return 35;
}

function buildRecommendations(
  video: Pick<YouTubeVideo, "title" | "description" | "tags">,
  scores: VideoFactorScores
): string[] {
  const recs: string[] = [];

  if (scores.title < 70) {
    if (video.title.length > 70) {
      recs.push(
        "Shorten title to under 70 characters for full search visibility."
      );
    } else {
      recs.push(
        "Add primary keywords earlier in the title to improve click appeal."
      );
    }
  }
  if (scores.description < 70) {
    recs.push(
      "Expand description with keyword-rich opening lines, links, and a clear CTA."
    );
  }
  if (scores.tags < 70) {
    recs.push(
      "Add more relevant tags aligned with title and transcript keywords."
    );
  }
  if (scores.thumbnail < 70) {
    recs.push(
      "Use a high-resolution custom thumbnail with bold, readable text."
    );
  }
  if (scores.engagement < 60) {
    recs.push(
      "Add an end-screen CTA to boost likes, comments, and subscriptions."
    );
  }

  return recs.slice(0, 4);
}

function weightedTotal(scores: VideoFactorScores): number {
  // Matches SignalComms brief: title 25, description 20, tags 15, thumb/retention/engagement 40
  const weights: { factor: keyof VideoFactorScores; weight: number }[] = [
    { factor: "title", weight: 25 },
    { factor: "description", weight: 20 },
    { factor: "tags", weight: 15 },
    { factor: "thumbnail", weight: 15 },
    { factor: "retention", weight: 15 },
    { factor: "engagement", weight: 10 },
  ];

  return Math.round(
    weights.reduce(
      (sum, { factor, weight }) => sum + (scores[factor] / 100) * weight,
      0
    )
  );
}

export function analyzeVideoSeo(
  video: Pick<
    YouTubeVideo,
    | "title"
    | "description"
    | "tags"
    | "thumbnailUrl"
    | "viewCount"
    | "likeCount"
    | "commentCount"
    | "durationSeconds"
    | "publishedAt"
  > & { id?: string }
): VideoSeoAnalysis {
  const keywords = extractKeywords(
    `${video.title} ${video.description} ${video.tags.join(" ")}`,
    12
  );

  const factorScores: VideoFactorScores = {
    title: scoreTitle(video.title, keywords),
    description: scoreDescription(video.description, keywords),
    tags: scoreTags(video.tags, keywords),
    thumbnail: scoreThumbnail(video.thumbnailUrl),
    retention: scoreRetention(video),
    engagement: scoreEngagement(video),
  };

  return {
    videoId: video.id,
    totalScore: weightedTotal(factorScores),
    factorScores,
    recommendations: buildRecommendations(video, factorScores),
  };
}
