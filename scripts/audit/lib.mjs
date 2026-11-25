/**
 * Shared helpers for the audit scripts. No dependencies: Node 24 ships fetch.
 *
 * These scripts are the evidence layer of docs/audit/. Every number quoted in
 * the audit must be reproducible with `pnpm audit:all`, so keep them
 * deterministic (fixed sample seed) and polite (bounded concurrency + delay).
 */

export const SITE = "https://teleambiente.tv";
export const USER_AGENT =
  "TeleAmbienteAudit/0.1 (+internal research; contact: web@teleambiente.tv)";

/** Deterministic PRNG so the sample is identical on every run. */
export function makeRandom(seed = 20261125) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function sample(items, count, random = Math.random) {
  const copy = [...items];
  const picked = [];
  while (copy.length > 0 && picked.length < count) {
    const index = Math.floor(random() * copy.length);
    picked.push(...copy.splice(index, 1));
  }
  return picked;
}

export async function fetchText(url, { timeoutMs = 25000 } = {}) {
  const started = performance.now();
  const response = await fetch(url, {
    headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml,application/xml" },
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const body = await response.text();
  return {
    url,
    finalUrl: response.url,
    status: response.status,
    contentType: response.headers.get("content-type") ?? "",
    bytes: Buffer.byteLength(body, "utf8"),
    ttfbMs: Math.round(performance.now() - started),
    body,
  };
}

/** Extract every <loc> value from an XML sitemap. */
export function locs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1]);
}

/** Classify a sitemap URL by its filename (Rank Math naming scheme). */
export function sitemapKind(path) {
  const name = path.split("/").pop() ?? "";
  if (name.startsWith("post-sitemap")) return "post";
  if (name.startsWith("page-sitemap")) return "page";
  if (name.startsWith("category-sitemap")) return "category";
  if (name.startsWith("post_tag-sitemap")) return "tag";
  if (name.startsWith("author-sitemap")) return "author";
  if (name.includes("news")) return "news";
  return "other";
}

export async function pool(items, workerCount, delayMs, worker) {
  const queue = [...items];
  const results = [];
  const workers = Array.from({ length: Math.min(workerCount, queue.length) }, async () => {
    for (;;) {
      const item = queue.shift();
      if (item === undefined) return;
      results.push(await worker(item));
      if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  });
  await Promise.all(workers);
  return results;
}

export function metaContent(html, name) {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]*content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*name=["']${name}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match?.[1] !== undefined) return match[1];
  }
  return null;
}

export function canonical(html) {
  const match = /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i.exec(html);
  return match?.[1] ?? null;
}

export function title(html) {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  return match ? decode(match[1]).replace(/\s+/g, " ").trim() : null;
}

export function decode(text) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", agrave: "à", egrave: "è", igrave: "ì", ograve: "ò", ugrave: "ù", hellip: "…", mdash: "—" };
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (match, name) => named[name] ?? match);
}

export function count(html, pattern) {
  return (html.match(pattern) ?? []).length;
}

export function schemaTypes(html) {
  const types = new Set();
  for (const match of html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)) types.add(match[1]);
  return [...types].sort();
}

export async function writeJson(filePath, value) {
  const { mkdir, writeFile } = await import("node:fs/promises");
  await mkdir(filePath.split("/").slice(0, -1).join("/"), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function toCsv(rows, columns) {
  const escape = (value) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [columns.join(","), ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))].join("\n") + "\n";
}
