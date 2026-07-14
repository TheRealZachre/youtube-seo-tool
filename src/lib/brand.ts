export const VCF_CONTACT_EMAIL = "zach@vibecodeflow.com";
export const VCF_PRODUCT_NAME = "YouTube SEO";
export const VCF_BRAND = "Vibe.Code.Flow.";

export const SEO_SCORE_FACTORS = [
  {
    weight: 25,
    label: "Title optimization",
    detail: "Keyword placement & click appeal",
    key: "title" as const,
  },
  {
    weight: 20,
    label: "Description quality",
    detail: "Structure, CTA & links",
    key: "description" as const,
  },
  {
    weight: 15,
    label: "Tag relevance",
    detail: "Alignment with transcript",
    key: "tags" as const,
  },
  {
    weight: 15,
    label: "Thumbnail performance",
    detail: "Estimated CTR benchmarks",
    key: "thumbnail" as const,
  },
  {
    weight: 15,
    label: "Watch time & retention",
    detail: "View velocity signals",
    key: "retention" as const,
  },
  {
    weight: 10,
    label: "Engagement signals",
    detail: "Likes, comments & shares",
    key: "engagement" as const,
  },
] as const;

export const NAV_LINKS = [
  { href: "/channel", label: "Channel" },
  { href: "/packages", label: "Packages" },
  { href: "/visibility", label: "Visibility" },
] as const;
