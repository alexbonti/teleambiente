#!/usr/bin/env node
/**
 * Builds the static search index for the GitHub Pages preview.
 *
 * Search on the live site is WordPress full-text; a static host cannot call it (the WP
 * REST API sends no CORS header), so the preview ships a small JSON index of the latest
 * posts and filters it in the browser. The production build keeps server-side search —
 * this file only exists for the `STATIC_EXPORT=true` path.
 *
 * Output: app/public/search-index.json  (~200 KB for 1,000 posts)
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const WP = process.env.WP_BASE_URL ?? "https://teleambiente.tv";
const PAGES = Number(process.env.SEARCH_INDEX_PAGES ?? "10");
const PER_PAGE = 100;
const OUT = resolve("app/public/search-index.json");

const FORMAT_SLUGS = new Set(["video", "intervista", "dossier", "live"]);

function plain(html) {
  return String(html ?? "")
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

const entries = [];

for (let page = 1; page <= PAGES; page += 1) {
  const url = new URL("/wp-json/wp/v2/posts", WP);
  url.searchParams.set("per_page", String(PER_PAGE));
  url.searchParams.set("page", String(page));
  url.searchParams.set("_embed", "wp:term");
  url.searchParams.set("orderby", "date");
  url.searchParams.set("order", "desc");

  let response;
  try {
    response = await fetch(url, { headers: { accept: "application/json" } });
  } catch (error) {
    console.warn(`page ${page}: network error (${error.message}) — stopping`);
    break;
  }
  if (!response.ok) {
    console.warn(`page ${page}: HTTP ${response.status} — stopping`);
    break;
  }

  const posts = await response.json();
  if (!Array.isArray(posts) || posts.length === 0) break;

  for (const post of posts) {
    const terms = post._embedded?.["wp:term"]?.flat() ?? [];
    const hub = terms.find(
      (term) =>
        term?.taxonomy === "category" &&
        typeof term.slug === "string" &&
        !FORMAT_SLUGS.has(term.slug) &&
        term.slug !== "senza-categoria",
    );
    entries.push({
      s: post.slug,
      t: plain(post.title?.rendered),
      d: post.date,
      h: hub ? plain(hub.name) : null,
      x: plain(post.excerpt?.rendered).slice(0, 180),
    });
  }

  if (posts.length < PER_PAGE) break;
}

await mkdir(dirname(OUT), { recursive: true });
await writeFile(
  OUT,
  JSON.stringify({ generated: new Date().toISOString(), count: entries.length, entries }),
);
console.log(`search index: ${entries.length} posts -> ${OUT}`);
