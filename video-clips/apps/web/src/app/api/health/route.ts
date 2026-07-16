import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "video-clips-web",
    product: "Vibe.Code.Flow. Video Clips",
  });
}
