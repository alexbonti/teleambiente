import type { Article } from "./types";
import {
  getArticleBySlug,
  getArticlesByCategory,
  getCategoryBySlug,
  getHubs,
  getLatestArticles,
  searchArticles,
  type Hub,
} from "./wp";

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
  getArticlesByCategory(slug: string, limit?: number): Promise<Article[]>;
  getHubs(): Promise<Hub[]>;
  getCategoryBySlug(slug: string): Promise<Hub | null>;
  searchArticles(query: string, limit?: number): Promise<Article[]>;
}

const wordpressSource: ContentSource = {
  name: "wordpress",
  getLatestArticles,
  getArticleBySlug,
  getArticlesByCategory,
  getHubs,
  getCategoryBySlug,
  searchArticles,
};

export const content: ContentSource = wordpressSource;

export * from "./types";
export type { Hub } from "./wp";
