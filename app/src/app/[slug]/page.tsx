import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StoryItem } from "@/components/story";
import { content } from "@/lib/content";
import { replaceSocialEmbeds, sanitizeHtml, stripLeadingDek, toPlainText } from "@/lib/content/html";
import { formatDateline, readingMinutes } from "@/lib/format";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await content.getArticleBySlug(slug).catch(() => null);
  if (article === null) return { title: "Articolo non trovato" };

  return {
    title: article.title,
    description: article.dek || toPlainText(article.html).slice(0, 160),
    openGraph: {
      type: "article",
      title: article.title,
      description: article.dek ?? undefined,
      publishedTime: article.publishedAt,
      images: article.heroImage ? [{ url: article.heroImage.url, alt: article.heroImage.alt }] : undefined,
    },
    alternates: { canonical: `/` + slug + "/" },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await content.getArticleBySlug(slug).catch(() => null);
  if (article === null) notFound();

  const hub = article.hubs[0];
  const related = hub ? await content.getArticlesByCategory(hub.slug, 4).catch(() => []) : [];
  const relatedArticles = related.filter((item) => item.id !== article.id).slice(0, 3);
  const bodyHtml = replaceSocialEmbeds(sanitizeHtml(stripLeadingDek(article.html, article.dek)));
  // The body often already carries the service's own embed: never show it twice.
  const bodyHasOwnVideo = article.videoId !== null && bodyHtml.includes(article.videoId);
  const showVideoBlock = article.videoId !== null && !bodyHasOwnVideo;

  return (
    <main>
      <article className="page-shell py-8">
        <nav
          aria-label="Percorso"
          className="mx-auto max-w-[46rem] text-[0.75rem] uppercase tracking-[0.08em] text-ink-soft"
        >
          <Link className="hover:underline" href="/">
            Home
          </Link>
          {hub ? (
            <>
              <span className="mx-2">/</span>
              <Link className="hover:underline" href={`/temi/${hub.slug}`}>
                {hub.name}
              </Link>
            </>
          ) : null}
        </nav>

        <header className="mx-auto mt-3 max-w-[46rem]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] uppercase tracking-[0.1em]">
            {hub ? <span className="font-bold text-signal-ink">{hub.name}</span> : null}
            {article.videoId ? <span className="font-bold text-channel">▶ Servizio video</span> : null}
          </div>

          <h1 className="display-1 mt-2 max-w-[30ch]">{article.title}</h1>

          {article.dek ? <p className="dek mt-3 max-w-[58ch]">{article.dek}</p> : null}

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-rule py-2 text-[0.75rem] text-ink-soft">
            {article.authors.length > 0 ? (
              <span className="font-semibold uppercase tracking-[0.06em] text-ink">
                {article.authors.map((author) => author.name).join(" · ")}
              </span>
            ) : null}
            <time dateTime={article.publishedAt}>{formatDateline(article.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{readingMinutes(toPlainText(article.html))} min di lettura</span>
          </div>
        </header>

        {article.heroImage && article.videoId === null ? (
          <figure className="mx-auto mt-6 max-w-[62rem]">
            <Image
              src={article.heroImage.url}
              alt={article.heroImage.alt}
              width={article.heroImage.width ?? 1240}
              height={article.heroImage.height ?? 700}
              priority
              sizes="(min-width: 1024px) 62rem, 100vw"
              className="w-full border border-rule object-cover"
            />
            {article.heroImage.alt ? (
              <figcaption className="mt-1.5 text-[0.75rem] text-ink-soft">{article.heroImage.alt}</figcaption>
            ) : null}
          </figure>
        ) : null}

        {showVideoBlock && article.videoId ? (
          <div className="mx-auto mt-6 max-w-[46rem]">
            <div className="border border-ink bg-ink">
              <div className="aspect-video">
                <iframe
                  className="size-full"
                  src={`https://www.youtube-nocookie.com/embed/${article.videoId}`}
                  title={article.title}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
            <p className="mt-1.5 text-[0.75rem] text-ink-soft">
              Il servizio video della redazione. Nel build di produzione il player sarà quello del
              sito, con trascrizione sotto il video.
            </p>
          </div>
        ) : null}

        <div className="prose-tv mx-auto mt-8" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

        <div className="mx-auto mt-10 max-w-[46rem] border-t-2 border-ink pt-4">
          <p className="label">Sul pezzo</p>
          <p className="mt-2 max-w-[56ch] text-[0.9375rem] leading-relaxed text-ink-soft">
            Segnalazioni, correzioni e documenti su questo tema sono benvenuti: la trasparenza è parte
            del metodo, non un reparto.
          </p>
          <a
            className="mt-3 inline-flex border border-ink px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-ink hover:text-paper"
            href="https://teleambiente.tv/scriveteci/"
          >
            Scrivi alla redazione
          </a>
        </div>
      </article>

      {relatedArticles.length > 0 ? (
        <section aria-labelledby="correlati" className="border-t-2 border-ink">
          <div className="page-shell py-7">
            <h2 id="correlati" className="text-[1.05rem] font-bold uppercase tracking-[0.08em]">
              Nello stesso tema
            </h2>
            <div className="mt-2 grid gap-x-10 sm:grid-cols-3">
              {relatedArticles.map((item) => (
                <div key={item.id} className="border-t border-rule">
                  <StoryItem article={item} dense />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
