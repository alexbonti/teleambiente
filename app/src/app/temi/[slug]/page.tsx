import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { StoryItem } from "@/components/story";
import { content } from "@/lib/content";
import { formatDateline } from "@/lib/format";
import { NAV_HUBS } from "@/lib/navigation";


export function generateStaticParams() {
  return NAV_HUBS.map((hub) => ({ slug: hub.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const hub = await content.getCategoryBySlug(slug).catch(() => null);
  const nav = NAV_HUBS.find((item) => item.slug === slug);
  const name = hub?.name ?? nav?.name;
  if (name === undefined) return { title: "Tema" };
  return { title: name, description: nav?.blurb ?? hub?.description ?? undefined };
}

export default async function HubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const nav = NAV_HUBS.find((item) => item.slug === slug);

  const [hub, articles] = await Promise.all([
    content.getCategoryBySlug(slug).catch(() => null),
    content.getArticlesByCategory(slug, 19).catch(() => []),
  ]);

  if (hub === null && nav === undefined) notFound();

  const name = hub?.name ?? nav?.name ?? slug;
  const blurb = nav?.blurb ?? (hub?.description ? hub.description : undefined);
  const [lead, ...rest] = articles;

  return (
    <main className="page-shell py-8">
      <header className="grid gap-6 border-b-2 border-ink pb-5 lg:grid-cols-[1fr_16rem] lg:items-end lg:gap-12">
        <div>
          <h1 className="display-2">{name}</h1>
          {blurb ? <p className="dek mt-2 max-w-[56ch]">{blurb}</p> : null}
        </div>
        <p className="text-[0.75rem] uppercase tracking-[0.1em] text-ink-soft lg:text-right">
          {hub ? `${hub.count} articoli in archivio` : "Archivio in caricamento"}
          <br />
          <span className="normal-case tracking-normal">Aggiornato {formatDateline(new Date())}</span>
        </p>
      </header>

      <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
        <div>
          {lead ? (
            <article className="border-b border-rule pb-6">
              <p className="flex flex-wrap items-center gap-x-2 text-[0.6875rem] uppercase tracking-[0.1em]">
                <time className="text-ink-soft" dateTime={lead.publishedAt}>
                  {formatDateline(lead.publishedAt)}
                </time>
                {lead.videoId ? <span className="font-bold text-channel">▶ Video</span> : null}
              </p>
              <h2 className="display-2 mt-2 max-w-[26ch]">
                <Link className="link-plain" href={`/${lead.slug}`}>
                  {lead.title}
                </Link>
              </h2>
              {lead.dek ? <p className="dek mt-2 max-w-[56ch]">{lead.dek}</p> : null}
              {lead.heroImage ? (
                <Link href={`/${lead.slug}`} className="mt-4 block">
                  <Image
                    src={lead.heroImage.url}
                    alt={lead.heroImage.alt}
                    width={lead.heroImage.width ?? 1240}
                    height={lead.heroImage.height ?? 700}
                    priority
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="aspect-[16/9] w-full border border-rule object-cover"
                  />
                </Link>
              ) : null}
            </article>
          ) : (
            <p className="max-w-[58ch] font-reading text-[1rem] leading-relaxed text-ink-soft">
              Nessun articolo pubblicato in questo tema. La tassonomia del nuovo sito è più stretta
              dell&apos;archivio attuale: alcuni contenitori restano vuoti finché la redazione non li
              popola.
            </p>
          )}

          {rest.length > 0 ? (
            <div className="mt-1 grid gap-x-10 sm:grid-cols-2">
              {rest.map((article) => (
                <div key={article.id} className="border-b border-rule">
                  <StoryItem article={article} dense />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <aside aria-labelledby="altri-temi" className="border-t-2 border-ink pt-4">
          <h2 id="altri-temi" className="label">
            Altri temi
          </h2>
          <ul className="mt-3 space-y-0">
            {NAV_HUBS.filter((item) => item.slug !== slug).map((item) => (
              <li key={item.slug} className="border-b border-rule">
                <Link className="flex items-baseline justify-between gap-2 py-2 hover:underline" href={`/temi/${item.slug}`}>
                  <span className="text-[0.9375rem] font-semibold">{item.name}</span>
                  <span className="text-[0.625rem] uppercase tracking-[0.08em] text-ink-soft">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-soft">
            I temi sono sei, non cinquantuno: il resto dell&apos;archivio arriva per ricerca e per
            correlati.
          </p>
        </aside>
      </div>
    </main>
  );
}
