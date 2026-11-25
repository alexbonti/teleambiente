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

const ALLOWED_IFRAME_HOSTS = ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"];

/**
 * Defensive clean-up for WordPress body HTML before it reaches `dangerouslySetInnerHTML`.
 * The CMS is trusted, but body HTML is the one place where arbitrary markup is rendered, so
 * scripts, inline event handlers and non-allowlisted iframes are removed here rather than
 * relying on every future editor. Keeps figures, embeds and inline formatting.
 */
export function sanitizeHtml(html: string): string {
  let output = html;

  output = output.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  output = output.replace(/<style\b[\s\S]*?<\/style>/gi, "");
  output = output.replace(/<(script|style)\b[^>]*\/?>/gi, "");

  const stripHandlers = (tag: string) => tag.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Allowlisted embeds are parked behind placeholders so the blanket iframe strip below
  // cannot reach them.
  const keptIframes: string[] = [];
  output = output.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, (block) => {
    const src = /src=["']([^"']+)["']/i.exec(block)?.[1] ?? "";
    try {
      if (!ALLOWED_IFRAME_HOSTS.includes(new URL(src).hostname)) return "";
    } catch {
      return "";
    }
    keptIframes.push(stripHandlers(block));
    return `\u0000iframe${keptIframes.length - 1}\u0000`;
  });
  // Self-closing or malformed iframes never load anything: drop them wholesale.
  output = output.replace(/<iframe\b[^>]*\/?>/gi, "");
  output = output.replace(/<\/iframe>/gi, "");
  output = output.replace(/\u0000iframe(\d+)\u0000/g, (_match, index: string) => keptIframes[Number(index)] ?? "");

  output = output.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  output = output.replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');

  return output.trim();
}

/**
 * WordPress auto-excerpts end with a truncated-word marker ("[...]", "[…]", "[&hellip;]").
 * It reads as a bug on a curated front page, so it is stripped; the dek still ends where
 * the CMS cut it.
 */
export function cleanDek(text: string): string {
  const stripped = text.replace(/\s*\[(?:\.\.\.|…|&hellip;)\]\s*[\s\S]*$/u, "").trim();
  if (stripped === "") return "";
  if (/[.!?»”"']$/u.test(stripped)) return stripped;

  // Cut back to the last finished sentence when there is enough of one to keep.
  const lastStop = Math.max(stripped.lastIndexOf(". "), stripped.lastIndexOf("! "), stripped.lastIndexOf("? "));
  if (lastStop >= 40) return stripped.slice(0, lastStop + 1);

  return `${stripped.replace(/[,\s]+$/u, "")} …`;
}

/**
 * WordPress posts often open with the same sentence the CMS uses as the excerpt; on the
 * new templates that excerpt is already the dek, so the first body paragraph would repeat
 * it. Drop the duplicate paragraph instead of showing the same words twice.
 */
export function stripLeadingDek(html: string, dek: string | null): string {
  if (dek === null || dek.trim() === "") return html;
  const needle = toPlainText(dek).replace(/\s*…$/, "").trim().toLowerCase().slice(0, 40);
  if (needle.length < 20) return html;

  // Gutenberg leaves block comments before the first block, and a video embed may open
  // the body, so the duplicate paragraph is looked for among the first blocks, not at
  // position zero.
  const withoutComments = html.replace(/^\s*(?:<!--[\s\S]*?-->\s*)*/u, "");
  const block = /<(p|h[2-6]|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let match = block.exec(withoutComments);
  while (match !== null && match.index < 1500) {
    const text = toPlainText(match[2] ?? "").toLowerCase();
    if (text.startsWith(needle)) {
      return (withoutComments.slice(0, match.index) + withoutComments.slice(match.index + match[0].length)).trimStart();
    }
    match = block.exec(withoutComments);
  }
  return html;
}

/**
 * Instagram's blockquote embed renders as an empty card once its <script> is stripped.
 * Replace it with a plain link to the same post, which is what a reader needs anyway.
 */
export function replaceSocialEmbeds(html: string): string {
  return html.replace(
    /<blockquote\b[^>]*class=["'][^"']*instagram-media[^"']*["'][^>]*>[\s\S]*?<\/blockquote>/gi,
    (block) => {
      const permalink = /data-instgrm-permalink=["']([^"']+)["']/i.exec(block)?.[1];
      if (permalink === undefined) return "";
      return `<p><a href="${permalink}" rel="noopener">Guarda il post su Instagram</a></p>`;
    },
  );
}
