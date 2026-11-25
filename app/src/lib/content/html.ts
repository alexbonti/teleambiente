/**
 * Small, dependency-free helpers for turning WordPress HTML into clean text
 * values. Deliberately conservative: they decode the entities the current site
 * actually emits (Italian accents, typographic quotes, `&amp;`) and strip tags.
 * Anything richer belongs to the migration sanitiser in M5, not here.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  laquo: "«",
  raquo: "»",
  agrave: "à",
  egrave: "è",
  eacute: "é",
  igrave: "ì",
  ograve: "ò",
  ugrave: "ù",
  Agrave: "À",
  Egrave: "È",
  Igrave: "Ì",
  Ograve: "Ò",
  Ugrave: "Ù",
  deg: "°",
  euro: "€",
  copy: "©",
  reg: "®",
  trade: "™",
  middot: "·",
  bull: "•",
  times: "×",
};

/** Decode named and numeric HTML entities produced by WordPress. */
export function decodeEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (match, name: string) => NAMED_ENTITIES[name] ?? match);
}

/** Strip tags, decode entities, collapse whitespace. */
export function toPlainText(html: string): string {
  const withoutTags = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(withoutTags).replace(/\s+/g, " ").trim();
}

const YOUTUBE_PATTERNS = [
  /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
  /youtube-nocookie\.com\/embed\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})/,
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
];

/** First YouTube video id embedded in a body of HTML, if any. */
export function extractYouTubeId(html: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = pattern.exec(html);
    if (match?.[1]) return match[1];
  }
  return null;
}

/** First `<img>` in a body of HTML, with its alt text. */
export function extractFirstImage(html: string): { url: string; alt: string } | null {
  const img = /<img\b[^>]*>/i.exec(html)?.[0];
  if (!img) return null;
  const src = /\bsrc\s*=\s*"([^"]+)"/i.exec(img)?.[1];
  if (!src) return null;
  const alt = /\balt\s*=\s*"([^"]*)"/i.exec(img)?.[1] ?? "";
  return { url: src, alt: decodeEntities(alt) };
}

/** Normalise a title for display: decode entities, collapse whitespace. */
export function cleanTitle(html: string): string {
  return toPlainText(html);
}
