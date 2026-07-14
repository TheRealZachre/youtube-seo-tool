import { parseChannelInput } from "../parse-channel-url";
import { analyzeVideoSeo } from "../score-video";
import { pickBestYouTubeThumbnail } from "../thumbnails";
import type {
  ChannelAnalyzeResponse,
  YouTubeChannel,
  YouTubeVideo,
} from "../types";

function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = Number(match[1] ?? 0);
  const m = Number(match[2] ?? 0);
  const s = Number(match[3] ?? 0);
  return h * 3600 + m * 60 + s;
}

async function ytFetch<T>(path: string, apiKey: string): Promise<T> {
  const url = `https://www.googleapis.com/youtube/v3/${path}&key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`YouTube API error (${res.status}): ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchChannelFromYouTubeApi(
  channelInput: string,
  apiKey: string,
  maxVideos = 20
): Promise<ChannelAnalyzeResponse> {
  const parsed = parseChannelInput(channelInput);
  if (!parsed) {
    throw new Error("Invalid channel URL or handle.");
  }

  type ChannelResponse = {
    items?: {
      id: string;
      snippet: {
        title: string;
        description: string;
        customUrl?: string;
        thumbnails?: {
          high?: { url: string };
          medium?: { url: string };
          default?: { url: string };
        };
      };
      statistics: {
        subscriberCount?: string;
        videoCount?: string;
        viewCount?: string;
      };
      contentDetails?: { relatedPlaylists?: { uploads?: string } };
    }[];
  };

  const channelParams = parsed.channelId
    ? `channels?part=snippet,statistics,contentDetails&id=${parsed.channelId}`
    : `channels?part=snippet,statistics,contentDetails&forHandle=${parsed.handle}`;

  const channelData = await ytFetch<ChannelResponse>(channelParams, apiKey);
  const item = channelData.items?.[0];
  if (!item) {
    throw new Error("Channel not found. Check the URL or handle.");
  }

  const uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    throw new Error("Could not resolve uploads playlist for this channel.");
  }

  type PlaylistResponse = {
    items?: {
      snippet: {
        resourceId: { videoId: string };
      };
    }[];
  };

  const playlistData = await ytFetch<PlaylistResponse>(
    `playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxVideos}`,
    apiKey
  );

  const videoIds =
    playlistData.items
      ?.map((entry) => entry.snippet.resourceId.videoId)
      .filter(Boolean)
      .join(",") ?? "";

  if (!videoIds) {
    return {
      source: "youtube-api",
      channel: mapChannel(item),
      videos: [],
    };
  }

  type VideosResponse = {
    items?: {
      id: string;
      snippet: {
        title: string;
        description: string;
        tags?: string[];
        publishedAt: string;
        thumbnails?: {
          maxres?: { url: string };
          standard?: { url: string };
          high?: { url: string };
          medium?: { url: string };
          default?: { url: string };
        };
      };
      statistics: {
        viewCount?: string;
        likeCount?: string;
        commentCount?: string;
      };
      contentDetails?: { duration?: string };
    }[];
  };

  const videosData = await ytFetch<VideosResponse>(
    `videos?part=snippet,statistics,contentDetails&id=${videoIds}`,
    apiKey
  );

  const videos: (YouTubeVideo & {
    analysis: ReturnType<typeof analyzeVideoSeo>;
  })[] = (videosData.items ?? []).map((video) => {
    const mapped: YouTubeVideo = {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      tags: video.snippet.tags ?? [],
      thumbnailUrl: pickBestYouTubeThumbnail(
        video.snippet.thumbnails,
        video.id
      ),
      publishedAt: video.snippet.publishedAt,
      viewCount: Number(video.statistics.viewCount ?? 0),
      likeCount: Number(video.statistics.likeCount ?? 0),
      commentCount: Number(video.statistics.commentCount ?? 0),
      durationSeconds: parseDuration(video.contentDetails?.duration ?? "PT0S"),
    };
    return { ...mapped, analysis: analyzeVideoSeo(mapped) };
  });

  // Sort by SEO upside first (lowest scores need the most help)
  videos.sort((a, b) => a.analysis.totalScore - b.analysis.totalScore);

  return {
    source: "youtube-api",
    channel: mapChannel(item),
    videos,
  };
}

function mapChannel(item: {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    thumbnails?: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
  };
  statistics: {
    subscriberCount?: string;
    videoCount?: string;
    viewCount?: string;
  };
}): YouTubeChannel {
  const handle = item.snippet.customUrl?.replace("@", "") ?? item.id;
  return {
    id: item.id,
    title: item.snippet.title,
    handle,
    description: item.snippet.description,
    thumbnailUrl:
      item.snippet.thumbnails?.high?.url ??
      item.snippet.thumbnails?.medium?.url ??
      item.snippet.thumbnails?.default?.url ??
      "",
    subscriberCount: Number(item.statistics.subscriberCount ?? 0),
    videoCount: Number(item.statistics.videoCount ?? 0),
    viewCount: Number(item.statistics.viewCount ?? 0),
  };
}
