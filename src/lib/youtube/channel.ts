import { DEFAULT_CHANNEL, fetchSeedChannel } from "./providers/seed";
import { fetchChannelFromYouTubeApi } from "./providers/youtube-api";
import type { ChannelAnalyzeResponse } from "./types";

export async function analyzeChannel(
  channelInput = process.env.YOUTUBE_CHANNEL ?? DEFAULT_CHANNEL
): Promise<ChannelAnalyzeResponse> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();

  if (apiKey) {
    try {
      return await fetchChannelFromYouTubeApi(channelInput, apiKey);
    } catch (error) {
      console.warn(
        "[youtube] Live API failed, using seed demo fallback:",
        error instanceof Error ? error.message : error
      );
    }
  }

  return fetchSeedChannel();
}

export function getDefaultChannelInput() {
  return process.env.YOUTUBE_CHANNEL ?? "";
}
