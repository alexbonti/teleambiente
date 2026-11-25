import { z } from "zod";

/**
 * Domain model of the new TeleAmbiente site.
 *
 * These types are the contract between the content source (WordPress today,
 * the editorial CMS from M5) and every template. Templates never read the
 * CMS payload directly: they read these shapes, so swapping the source is an
 * implementation detail (see `source.ts`).
 */

export const ImageSchema = z.object({
  url: z.string(),
  alt: z.string(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});
export type ContentImage = z.infer<typeof ImageSchema>;

export const AuthorSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  url: z.string(),
});
export type Author = z.infer<typeof AuthorSchema>;

export const HubRefSchema = z.object({
  slug: z.string(),
  name: z.string(),
});
export type HubRef = z.infer<typeof HubRefSchema>;

export const ArticleSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  /** Absolute canonical URL. Article URLs are permanent: never rewrite a slug. */
  url: z.string(),
  title: z.string(),
  /** Standfirst / excerpt, plain text. */
  dek: z.string().nullable(),
  /** Sanitised article body HTML. */
  html: z.string(),
  publishedAt: z.string(),
  updatedAt: z.string(),
  authors: z.array(AuthorSchema),
  hubs: z.array(HubRefSchema),
  tags: z.array(z.string()),
  heroImage: ImageSchema.nullable(),
  /** YouTube id when the article is the written companion of a TV segment. */
  videoId: z.string().nullable(),
});
export type Article = z.infer<typeof ArticleSchema>;

export const ArticleListSchema = z.array(ArticleSchema);
