const STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "been",
  "being",
  "both",
  "from",
  "have",
  "here",
  "into",
  "just",
  "like",
  "more",
  "most",
  "only",
  "other",
  "over",
  "some",
  "such",
  "than",
  "that",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "through",
  "very",
  "what",
  "when",
  "where",
  "which",
  "while",
  "with",
  "would",
  "your",
  "https",
  "http",
  "www",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));
}

export function extractKeywords(text: string, limit = 15): string[] {
  const words = tokenize(text);
  const freq = new Map<string, number>();

  for (const word of words) {
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

export function extractPhrases(text: string, limit = 8): string[] {
  const words = tokenize(text);
  const phrases = new Map<string, number>();

  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`;
    phrases.set(phrase, (phrases.get(phrase) ?? 0) + 1);
  }

  return [...phrases.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([phrase]) => phrase);
}
