import { NextResponse } from "next/server";

export const maxDuration = 60;

export interface SeoPackage {
  title: string;
  titleCharCount: number;
  description: string;
  chapters: { timestamp: string; label: string }[];
  tags: string[];
  thumbnailNotes: string;
  endScreenNotes: string;
  seoScore: number;
  reasoning: string;
}

async function getTranscriptFromYouTubeUrl(url: string): Promise<string> {
  // Extract video ID
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  if (!match) throw new Error("Could not extract YouTube video ID from URL.");
  const videoId = match[1];

  // Try to fetch captions via YouTube's timedtext API (works for auto-generated captions)
  const captionUrl = `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en&fmt=vtt`;
  const res = await fetch(captionUrl);
  if (!res.ok) throw new Error("No English captions available for this video.");

  const vtt = await res.text();
  // Strip VTT markup to plain text
  const text = vtt
    .replace(/WEBVTT[\s\S]*?\n\n/, "")
    .replace(/\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}[^\n]*/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{2,}/g, " ")
    .trim();
  if (!text) throw new Error("Captions were empty for this video.");
  return text;
}

async function transcribeAudio(audioData: string, mimeType: string, filename: string): Promise<string> {
  const openaiModule = await import("openai");
  const OpenAI = openaiModule.default;
  const { toFile } = openaiModule;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const buffer = Buffer.from(audioData, "base64");
  const file = await toFile(buffer, filename, { type: mimeType });

  const transcription = await client.audio.transcriptions.create({
    model: "whisper-1",
    file,
    response_format: "text",
  });
  return transcription as unknown as string;
}

async function generateSeoPackage(transcript: string, sourceHint: string): Promise<SeoPackage> {
  if (!process.env.OPENAI_API_KEY) {
    return getMockPackage(transcript);
  }

  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const truncated = transcript.slice(0, 12000);

  const prompt = `You are a YouTube SEO expert. Based on the following video transcript, generate a complete SEO package.

TRANSCRIPT (${sourceHint}):
"""
${truncated}
"""

Return a JSON object with exactly these fields:
{
  "title": "Optimized YouTube title under 70 characters with primary keyword near the start",
  "description": "Full YouTube description (300-500 words) with natural keyword integration, hook in first 2 sentences, links section placeholder, and call to action",
  "chapters": [
    { "timestamp": "0:00", "label": "Introduction" },
    { "timestamp": "2:30", "label": "..." }
  ],
  "tags": ["tag1", "tag2", ...] (25-30 tags, mix of broad and specific, ordered by relevance),
  "thumbnailNotes": "2-3 sentences describing the ideal thumbnail: subject, text overlay, color scheme, and emotion",
  "endScreenNotes": "Brief recommendations for end screen cards: subscribe button, related video suggestions",
  "seoScore": 85,
  "reasoning": "2-3 sentences explaining the SEO strategy and why these choices will improve discoverability"
}

Return ONLY the JSON. No markdown fences.`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message.content ?? "{}";
  const parsed = JSON.parse(raw) as SeoPackage;
  parsed.titleCharCount = parsed.title?.length ?? 0;
  return parsed;
}

function getMockPackage(transcript: string): SeoPackage {
  const words = transcript.split(" ").slice(0, 5).join(" ");
  return {
    title: `Complete Guide: ${words}... and What You Need to Know`,
    titleCharCount: 62,
    description: `In this video, we dive deep into ${words}...\n\nThis comprehensive guide covers everything you need to know, from the basics to advanced strategies. Whether you're just getting started or looking to level up, this video has you covered.\n\n⏱ CHAPTERS\n0:00 Introduction\n2:00 Core concepts\n5:30 Deep dive\n10:00 Key takeaways\n\n🔗 RESOURCES\n• [Link 1]\n• [Link 2]\n\n📩 Subscribe for more: [Channel URL]\n\n#YouTube #SEO #ContentCreation`,
    chapters: [
      { timestamp: "0:00", label: "Introduction" },
      { timestamp: "2:00", label: "Core concepts" },
      { timestamp: "5:30", label: "Deep dive" },
      { timestamp: "10:00", label: "Key takeaways" },
    ],
    tags: [
      "youtube seo", "video optimization", "content strategy", "youtube tips",
      "grow youtube channel", "youtube algorithm", "video marketing", "seo tips",
      "youtube growth", "video seo", "content creation", "youtube guide",
      "how to rank on youtube", "youtube keywords", "video title optimization",
    ],
    thumbnailNotes: "Use a bold, high-contrast background (deep blue or red). Add a large text overlay with 3–4 words from the title. Include a reaction face or relevant visual to drive curiosity clicks.",
    endScreenNotes: "Add a subscribe button at 20s from end. Feature your most relevant recent video as the main card. Consider a playlist card for binge-watching.",
    seoScore: 78,
    reasoning: "Mock package — connect an OpenAI API key for real AI-generated output. Keywords are placed for discoverability, and the description structure follows YouTube best practices.",
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const inputType = formData.get("inputType") as string;

    let transcript = "";
    let sourceHint = "";

    if (inputType === "transcript") {
      transcript = (formData.get("transcript") as string)?.trim() ?? "";
      if (!transcript) return NextResponse.json({ error: "Transcript is required." }, { status: 400 });
      sourceHint = "pasted transcript";

    } else if (inputType === "url") {
      const url = (formData.get("url") as string)?.trim() ?? "";
      if (!url) return NextResponse.json({ error: "YouTube URL is required." }, { status: 400 });
      try {
        transcript = await getTranscriptFromYouTubeUrl(url);
        sourceHint = `YouTube URL: ${url}`;
      } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch captions." }, { status: 422 });
      }

    } else if (inputType === "file") {
      const file = formData.get("file") as File | null;
      if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
      if (!process.env.OPENAI_API_KEY) {
        // Can't transcribe without API key — fall back to mock
        transcript = "Audio transcription requires an OpenAI API key. This is a demo package.";
        sourceHint = `uploaded file: ${file.name}`;
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        try {
          transcript = await transcribeAudio(base64, file.type, file.name);
          sourceHint = `uploaded file: ${file.name}`;
        } catch (e) {
          return NextResponse.json({ error: e instanceof Error ? e.message : "Transcription failed." }, { status: 422 });
        }
      }
    } else {
      return NextResponse.json({ error: "Invalid input type." }, { status: 400 });
    }

    const pkg = await generateSeoPackage(transcript, sourceHint);
    return NextResponse.json({ ok: true, package: pkg, transcript: transcript.slice(0, 500) + (transcript.length > 500 ? "…" : "") });

  } catch (err) {
    console.error("[generate-seo]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
