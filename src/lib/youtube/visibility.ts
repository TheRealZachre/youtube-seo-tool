import type { CompetitorShare, VisibilityPoint } from "./types";

/** Demo visibility trends tied to BeOne channel performance narratives. */
export function getVisibilitySeries(): VisibilityPoint[] {
  return [
    { month: "Jan", impressions: 182000, ctr: 3.1, viewVelocity: 4200, subscribers: 180 },
    { month: "Feb", impressions: 205000, ctr: 3.4, viewVelocity: 5100, subscribers: 240 },
    { month: "Mar", impressions: 268000, ctr: 3.8, viewVelocity: 7200, subscribers: 410 },
    { month: "Apr", impressions: 291000, ctr: 4.1, viewVelocity: 8000, subscribers: 460 },
    { month: "May", impressions: 312000, ctr: 4.0, viewVelocity: 7600, subscribers: 390 },
    { month: "Jun", impressions: 348000, ctr: 4.4, viewVelocity: 9100, subscribers: 520 },
  ];
}

export function getCompetitorShareOfVoice(): CompetitorShare[] {
  return [
    { channel: "BeOne Medicines", shareOfVoice: 34, keyword: "BTK inhibitor" },
    { channel: "Competitor A", shareOfVoice: 28, keyword: "BTK inhibitor" },
    { channel: "Competitor B", shareOfVoice: 22, keyword: "BTK inhibitor" },
    { channel: "Competitor C", shareOfVoice: 16, keyword: "BTK inhibitor" },
    { channel: "BeOne Medicines", shareOfVoice: 41, keyword: "CLL patient story" },
    { channel: "Competitor A", shareOfVoice: 27, keyword: "CLL patient story" },
    { channel: "Competitor B", shareOfVoice: 19, keyword: "CLL patient story" },
    { channel: "Competitor C", shareOfVoice: 13, keyword: "CLL patient story" },
  ];
}
