import { NextResponse } from "next/server";
import { analyzeChannel, getDefaultChannelInput } from "@/lib/youtube/channel";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel =
    searchParams.get("channel")?.trim() || getDefaultChannelInput();

  try {
    const data = await analyzeChannel(channel);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to analyze channel",
      },
      { status: 500 }
    );
  }
}
