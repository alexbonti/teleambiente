import { z } from "zod";

import { cleanDek, cleanTitle, decodeEntities, extractFirstImage, extractYouTubeId, toPlainText } from "./html";
import { type Article, ArticleSchema } from "./types";

/**
 * WordPress REST adapter.
 *
 * The current site is the only source of truth until the editorial CMS lands
 * (M5). Everything here is read-only and unauthenticated; the public API is
 * rate-limited by the host's WAF (BitNinja), so callers should batch requests
 * rather than fan out per-request.
 */

export const WP_BASE_URL = process.env.WP_BASE_URL ?? "https://teleambiente.tv";
const REVALIDATE_SECONDS = Number(process.env.CONTENT_REVALIDATE_SECONDS ?? "300");

/** Categories that are really editorial formats, not topics (see docs/design/ia-and-content-model.md). */
export const FORMAT_SLUGS = new Set([
  "video",
  "featured",
  "interviste",
  "senza-categoria",
  "tv",
  "news",
]);

const WpRenderedSchema = z.object({ rendered: z.string() });
const WpTermSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  taxonomy: z.string(),
  link: z.string().optional(),
});
const WpMediaSchema = z.object({
  id: z.number(),
  source_url: z.string(),
  alt_text: z.string().optional().default(""),
  media_details: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      sizes: z.record(z.string(), z.object({ source_url: z.string() })).optional(),
    })
    .optional(),
});
const WpAuthorSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  link: z.string(),
});

export const WpPostSchema = z.object({
  id: z.number(),
  date: z.string(),
  modified: z.string(),
  slug: z.string(),
  link: z.string(),
  title: WpRenderedSchema,
  excerpt: WpRenderedSchema.optional(),
  content: WpRenderedSchema.optional(),
  _embedded: z
    .object({
      "wp:featuredmedia": z.array(z.unknown()).optional(),
      author: z.array(z.unknown()).optional(),
      "wp:term": z.array(z.array(z.unknown())).optional(),
    })
    .optional(),
});
export type WpPost = z.infer<typeof WpPostSchema>;

function pickHeroImage(post: WpPost): Article["heroImage"] {
  const embedded = post._embedded?.["wp:featuredmedia"]?.[0];
  if (embedded !== undefined) {
    const parsed = WpMediaSchema.safeParse(embedded);
    if (parsed.success) {
      const { source_url, alt_text, media_details } = parsed.data;
      return {
        url: source_url,
        alt: alt_text || cleanTitle(post.title.rendered),
        width: media_details?.width ?? null,
        height: media_details?.height ?? null,
      };
    }
  }
  const fallback = extractFirstImage(post.content?.rendered ?? "");
  if (fallback) return { url: fallback.url, alt: fallback.alt, width: null, height: null };
  return null;
}

function pickAuthors(post: WpPost): Article["authors"] {
  const embedded = post._embedded?.author?.[0];
  if (embedded !== undefined) {
    const parsed = WpAuthorSchema.safeParse(embedded);
    if (parsed.success) {
      return [
        {
          id: parsed.data.id,
          name: decodeEntities(parsed.data.name),
          slug: parsed.data.slug,
          url: parsed.data.link,
        },
      ];
    }
  }
  return [];
}

function pickTaxonomy(post: WpPost): Pick<Article, "hubs" | "tags"> {
  const groups = post._embedded?.["wp:term"] ?? [];
  const terms = groups
    .flat()
    .map((term) => WpTermSchema.safeParse(term))
    .filter((result) => result.success)
    .map((result) => result.data);

  const categories = terms.filter((term) => term.taxonomy === "category");
  const tags = terms.filter((term) => term.taxonomy === "post_tag");

  return {
    hubs: categories
      .filter((term) => !FORMAT_SLUGS.has(term.slug))
      .map((term) => ({ slug: term.slug, name: decodeEntities(term.name) })),
    tags: tags.map((term) => decodeEntities(term.name)),
  };
}

/** Pure mapper: raw WordPress post -> domain Article. Unit-tested without network. */
export function mapWpPost(raw: unknown): Article {
  const post = WpPostSchema.parse(raw);
  const html = post.content?.rendered ?? "";
  const { hubs, tags } = pickTaxonomy(post);

  return ArticleSchema.parse({
    id: post.id,
    slug: post.slug,
    url: post.link,
    title: cleanTitle(post.title.rendered),
    dek: post.excerpt?.rendered ? cleanDek(toPlainText(post.excerpt.rendered)) : null,
    html,
    publishedAt: post.date,
    updatedAt: post.modified,
    authors: pickAuthors(post),
    hubs,
    tags,
    heroImage: pickHeroImage(post),
    videoId: extractYouTubeId(html),
  });
}

async function wpGet(path: string, params: Record<string, string> = {}): Promise<unknown> {
  const url = new URL(path, WP_BASE_URL);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  url.searchParams.set("_embed", "wp:featuredmedia,author,wp:term");

  const response = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    throw new Error(`WordPress API ${response.status} ${response.statusText} for ${url.pathname}`);
  }
  return response.json();
}

export async function getLatestArticles(limit = 12): Promise<Article[]> {
  const payload = await wpGet("/wp-json/wp/v2/posts", {
    per_page: String(Math.min(Math.max(limit, 1), 100)),
  });
  const posts = z.array(z.unknown()).parse(payload);
  return posts.map(mapWpPost);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const payload = await wpGet("/wp-json/wp/v2/posts", { slug, per_page: "1" });
  const posts = z.array(z.unknown()).parse(payload);
  const first = posts[0];
  return first === undefined ? null : mapWpPost(first);
}

/* ------------------------------------------------------------------ */
/* Categories (hubs)                                                   */
/* ------------------------------------------------------------------ */

const WpCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().default(""),
  count: z.number(),
  parent: z.number().optional().default(0),
  link: z.string().optional().default(""),
});
export type Hub = z.infer<typeof WpCategorySchema> & { name: string };

export async function getCategoryBySlug(slug: string): Promise<Hub | null> {
  const url = new URL(`/wp-json/wp/v2/categories`, WP_BASE_URL);
  url.searchParams.set("slug", slug);
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!response.ok) throw new Error(`WordPress categories ${response.status}`);
  const payload = z.array(z.unknown()).parse(await response.json());
  const parsed = payload.map((item) => WpCategorySchema.safeParse(item)).find((result) => result.success);
  if (parsed === undefined || !parsed.success) return null;
  return { ...parsed.data, name: decodeEntities(parsed.data.name) };
}

export async function getHubs(): Promise<Hub[]> {
  const payload = await wpGet("/wp-json/wp/v2/categories", {
    per_page: "100",
    orderby: "count",
    order: "desc",
    hide_empty: "true",
  });
  const parsed = z.array(WpCategorySchema).parse(payload);
  return parsed.map((category) => ({ ...category, name: decodeEntities(category.name) }));
}

export async function getArticlesByCategory(slug: string, limit = 12): Promise<Article[]> {
  const category = await getCategoryBySlug(slug);
  if (category === null) return [];
  const payload = await wpGet("/wp-json/wp/v2/posts", {
    categories: String(category.id),
    per_page: String(Math.min(Math.max(limit, 1), 100)),
  });
  return z.array(z.unknown()).parse(payload).map(mapWpPost);
}

/* ------------------------------------------------------------------ */
/* Search                                                             */
/* ------------------------------------------------------------------ */

export async function searchArticles(query: string, limit = 12): Promise<Article[]> {
  const term = query.trim();
  if (term.length < 2) return [];
  const payload = await wpGet("/wp-json/wp/v2/posts", {
    search: term,
    per_page: String(Math.min(Math.max(limit, 1), 50)),
  });
  return z.array(z.unknown()).parse(payload).map(mapWpPost);
}
