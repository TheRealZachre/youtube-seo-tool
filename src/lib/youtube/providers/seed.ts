import { analyzeVideoSeo } from "../score-video";
import { pickThumbnailUrl, videoThumbnailUrl } from "../thumbnails";
import type { ChannelAnalyzeResponse, YouTubeVideo } from "../types";

/** Official BeOne Medicines channel ID. */
export const BEONE_CHANNEL_ID = "UCJPyN9QBGWtLvhHSqq5ne8Q";
export const DEFAULT_CHANNEL = "@BeOneMedicines";

const RAW_VIDEOS: Omit<YouTubeVideo, "thumbnailUrl">[] = [
  {
    id: "URAqBej-oOw",
    title: "Richard's Story - Esophageal Cancer",
    description:
      "Meet Richard and hear his journey with esophageal cancer. Subscribe for more patient stories from BeOne Medicines. Learn more at https://beonemedicines.com",
    tags: ["patient story", "esophageal cancer", "oncology", "BeOne"],
    publishedAt: "2026-04-01T10:00:00Z",
    viewCount: 232,
    likeCount: 12,
    commentCount: 3,
    durationSeconds: 226,
  },
  {
    id: "p2PuujS1iUA",
    title: "BeOne Patient Perspective: Living with CLL",
    description:
      "A patient perspective on living with CLL. Learn more at beonemedicines.com #CLL #PatientsFirst #Oncology",
    tags: ["cll", "patient story", "oncology", "hematology"],
    publishedAt: "2026-03-01T10:00:00Z",
    viewCount: 264,
    likeCount: 15,
    commentCount: 4,
    durationSeconds: 188,
  },
  {
    id: "beone-asco-2026",
    title: "ASCO 2026 Highlights | BeOne Data Presentation",
    description:
      "Our ASCO 2026 presentation covers new oncology data across multiple indications. Intended for healthcare professionals. #ASCO2026 #oncology https://beonemedicines.com",
    tags: ["asco", "clinical data", "oncology", "congress"],
    publishedAt: "2026-03-05T10:00:00Z",
    viewCount: 24100,
    likeCount: 580,
    commentCount: 44,
    durationSeconds: 645,
  },
  {
    id: "beone-btk-mechanism",
    title: "BTK Inhibition Explained for Clinicians",
    description:
      "A concise overview of BTK pathway biology and clinical relevance in B-cell malignancies. Subscribe for scientific updates from BeOne Medicines.",
    tags: ["btk", "hematology", "mechanism", "oncology"],
    publishedAt: "2026-02-12T10:00:00Z",
    viewCount: 8400,
    likeCount: 210,
    commentCount: 18,
    durationSeconds: 412,
  },
  {
    id: "beone-caregiver",
    title: "Caregiver Voices: Supporting Someone Through Treatment",
    description:
      "Caregivers share what helped during diagnosis and treatment. Patients First starts with the whole care team. https://beonemedicines.com",
    tags: ["caregiver", "patient support", "oncology", "advocacy"],
    publishedAt: "2026-01-28T10:00:00Z",
    viewCount: 5100,
    likeCount: 190,
    commentCount: 27,
    durationSeconds: 305,
  },
  {
    id: "beone-eha-2026",
    title: "EHA 2026 Booth Tour | Hematology Updates",
    description:
      "Walk through BeOne's hematology presence at EHA 2026. New data, HCP conversations, and pipeline highlights.",
    tags: ["eha", "hematology", "congress", "pipeline"],
    publishedAt: "2026-05-10T10:00:00Z",
    viewCount: 3900,
    likeCount: 95,
    commentCount: 11,
    durationSeconds: 268,
  },
  {
    id: "beone-access",
    title: "Access Programs: Helping Eligible Patients Start Therapy",
    description:
      "How BeOne access support helps eligible patients navigate coverage and start therapy without unnecessary delay. Learn more: https://beonemedicines.com",
    tags: ["access", "patient support", "coverage", "oncology"],
    publishedAt: "2026-04-18T10:00:00Z",
    viewCount: 1800,
    likeCount: 64,
    commentCount: 8,
    durationSeconds: 340,
  },
  {
    id: "beone-r-and-d",
    title: "Inside BeOne R&D: From Bench to Bedside",
    description:
      "Scientists explain how translational oncology teams move candidates from discovery into the clinic — urgency with rigor.",
    tags: ["research", "pipeline", "oncology", "innovation"],
    publishedAt: "2025-12-08T10:00:00Z",
    viewCount: 12600,
    likeCount: 340,
    commentCount: 29,
    durationSeconds: 720,
  },
  {
    id: "beone-wm-awareness",
    title: "Waldenström Awareness Day | What Patients Should Know",
    description:
      "Disease awareness for Waldenström macroglobulinemia: symptoms, diagnosis pathways, and where to find support. #AwarenessDay",
    tags: ["waldenstrom", "awareness", "rare disease", "hematology"],
    publishedAt: "2026-01-12T10:00:00Z",
    viewCount: 2200,
    likeCount: 88,
    commentCount: 14,
    durationSeconds: 255,
  },
  {
    id: "beone-esg",
    title: "Responsible Business & Sustainability at BeOne",
    description:
      "Highlights from our sustainability report: clinical trial diversity, carbon targets, and community health partnerships. https://beonemedicines.com",
    tags: ["esg", "sustainability", "corporate", "diversity"],
    publishedAt: "2026-04-22T10:00:00Z",
    viewCount: 980,
    likeCount: 41,
    commentCount: 5,
    durationSeconds: 380,
  },
  {
    id: "beone-community",
    title: "Team BeOne: Culture That Powers Cancer Innovation",
    description:
      "Colleagues across research, medical, and commercial teams share what Great Place to Work culture means for patients.",
    tags: ["culture", "team", "innovation", "careers"],
    publishedAt: "2026-02-01T10:00:00Z",
    viewCount: 4500,
    likeCount: 156,
    commentCount: 22,
    durationSeconds: 290,
  },
  {
    id: "beone-nsclc",
    title: "NSCLC Landscape Update for HCPs",
    description:
      "Clinical overview of evolving first-line NSCLC considerations for healthcare professionals. Subscribe for congress recaps.",
    tags: ["nsclc", "lung cancer", "hcp", "oncology"],
    publishedAt: "2026-03-20T10:00:00Z",
    viewCount: 7100,
    likeCount: 203,
    commentCount: 16,
    durationSeconds: 540,
  },
];

export function fetchSeedChannel(): ChannelAnalyzeResponse {
  const videos = RAW_VIDEOS.map((video) => {
    const mapped: YouTubeVideo = {
      ...video,
      thumbnailUrl: video.id.startsWith("beone-")
        ? videoThumbnailUrl("URAqBej-oOw")
        : pickThumbnailUrl(video.id),
    };
    return { ...mapped, analysis: analyzeVideoSeo(mapped) };
  }).sort((a, b) => a.analysis.totalScore - b.analysis.totalScore);

  return {
    source: "seed",
    channel: {
      id: BEONE_CHANNEL_ID,
      title: "BeOne Medicines",
      handle: "BeOneMedicines",
      description:
        "Official channel for BeOne Medicines — oncology innovation, patient stories, and scientific updates.",
      thumbnailUrl:
        "https://yt3.googleusercontent.com/Rplyx1b6s_8YhZGVvzI0vanLzba96UguSLcvzlBC4GXB-0YYH0Tc3cYiaFqsD891or54H0Ykg78=s160-c-k-c0x00ffffff-no-rj",
      subscriberCount: 125000,
      videoCount: 61,
      viewCount: 2094402,
    },
    videos,
  };
}

export function getSeedVideo(id: string) {
  return fetchSeedChannel().videos.find((video) => video.id === id);
}
