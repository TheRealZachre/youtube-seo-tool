export interface YouTubeChannel {
  id: string;
  title: string;
  handle: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  durationSeconds: number;
}

export interface VideoFactorScores {
  title: number;
  description: number;
  tags: number;
  thumbnail: number;
  retention: number;
  engagement: number;
}

export interface VideoSeoAnalysis {
  videoId?: string;
  totalScore: number;
  factorScores: VideoFactorScores;
  recommendations: string[];
}

export interface SeoPackage {
  title: string;
  titleCharCount: number;
  description: string;
  tags: string[];
  thumbnailOverlays: string[];
  chapterMarkers: { time: string; title: string }[];
  endScreenSuggestions: string[];
}

export interface VideoAnalyzeRequest {
  fileName?: string;
  durationSeconds?: number;
  transcript?: string;
  topic?: string;
  currentTitle?: string;
  currentDescription?: string;
  currentTags?: string[];
}

export interface VideoAnalyzeResponse {
  source: "analysis";
  transcript: string;
  transcriptionSource: "whisper" | "whisper-local" | "manual" | "youtube";
  current?: VideoSeoAnalysis;
  generated: SeoPackage;
  projected: VideoSeoAnalysis;
  keywords: string[];
}

export interface ChannelAnalyzeResponse {
  source: "youtube-api" | "seed";
  channel: YouTubeChannel;
  videos: (YouTubeVideo & { analysis: VideoSeoAnalysis })[];
}

export interface VisibilityPoint {
  month: string;
  impressions: number;
  ctr: number;
  viewVelocity: number;
  subscribers: number;
}

export interface CompetitorShare {
  channel: string;
  shareOfVoice: number;
  keyword: string;
}
