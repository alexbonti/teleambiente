import type { Article } from "./types";
import { getArticleBySlug, getLatestArticles } from "./wp";

/**
 * Content source switchboard.
 *
 * Today: WordPress REST (read-only).
 * M5: the editorial CMS. Only this file and the adapter behind it change —
 * templates keep importing from `@/lib/content`.
 */
export interface ContentSource {
  readonly name: "wordpress" | "cms";
  getLatestArticles(limit?: number): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | null>;
}

const wordpressSource: ContentSource = {
  name: "wordpress",
  getLatestArticles,
  getArticleBySlug,
};

export const content: ContentSource = wordpressSource;

export * from "./types";
