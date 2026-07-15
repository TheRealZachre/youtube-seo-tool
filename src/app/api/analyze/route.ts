import { NextResponse } from "next/server";
import { analyzeUploadedVideo } from "@/lib/youtube/generate-seo";
import type { VideoAnalyzeRequest } from "@/lib/youtube/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VideoAnalyzeRequest;
    const result = analyzeUploadedVideo(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate SEO package",
      },
      { status: 400 }
    );
  }
}
