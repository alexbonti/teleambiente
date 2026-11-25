import Image from "next/image";
import Link from "next/link";

import type { Article } from "@/lib/content";
import { formatDateline } from "@/lib/format";

/** A ruled list item — the listings page's unit of news. No cards. */
export function StoryItem({ article, dense = false }: { article: Article; dense?: boolean }) {
  const hub = article.hubs[0];

  return (
    <article className={dense ? "py-3" : "py-4"}>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] uppercase tracking-[0.1em] text-ink-soft">
        {hub ? <span className="font-bold text-signal-ink">{hub.name}</span> : null}
        <time dateTime={article.publishedAt}>{formatDateline(article.publishedAt)}</time>
        {article.videoId ? (
          <span className="inline-flex items-center gap-1 font-bold text-channel">
            <span aria-hidden="true">▶</span> Video
          </span>
        ) : null}
      </p>
      <h3 className={dense ? "mt-1 text-[1.05rem] font-bold leading-snug" : "mt-1.5 text-[1.2rem] font-bold leading-[1.12]"}>
        <Link className="link-plain" href={`/${article.slug}`}>
          {article.title}
        </Link>
      </h3>
      {article.dek && !dense ? (
        <p className="mt-1 line-clamp-3 max-w-[60ch] font-reading text-[0.95rem] leading-relaxed text-ink-soft sm:line-clamp-4">
          {article.dek}
        </p>
      ) : null}
    </article>
  );
}

/** The lead: one story carries the page, and on the front page it carries the h1. */
export function LeadStory({ article, level = 2 }: { article: Article; level?: 1 | 2 }) {
  const hub = article.hubs[0];
  const Heading = level === 1 ? "h1" : "h2";

  return (
    <article>
      <div className="flex flex-wrap items-center gap-x-2 text-[0.6875rem] uppercase tracking-[0.1em]">
        {hub ? <span className="font-bold text-signal-ink">{hub.name}</span> : null}
        <time className="text-ink-soft" dateTime={article.publishedAt}>
          {formatDateline(article.publishedAt)}
        </time>
        {article.videoId ? (
          <span className="font-bold text-channel">
            <span aria-hidden="true">▶</span> Servizio video
          </span>
        ) : null}
      </div>

      <Heading className="display-1 mt-2">
        <Link className="link-plain" href={`/${article.slug}`}>
          {article.title}
        </Link>
      </Heading>

      {article.dek ? <p className="dek mt-3 max-w-[58ch]">{article.dek}</p> : null}

      {article.heroImage ? (
        <Link href={`/${article.slug}`} className="mt-5 block">
          <Image
            src={article.heroImage.url}
            alt={article.heroImage.alt}
            width={article.heroImage.width ?? 1240}
            height={article.heroImage.height ?? 700}
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="aspect-[16/10] w-full border border-rule object-cover"
          />
        </Link>
      ) : null}
    </article>
  );
}
