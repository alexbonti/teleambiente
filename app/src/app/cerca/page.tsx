import type { Metadata } from "next";
import Link from "next/link";

import { StoryItem } from "@/components/story";
import { content } from "@/lib/content";

export const metadata: Metadata = {
  title: "Cerca",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query.length >= 2 ? await content.searchArticles(query, 20).catch(() => []) : [];

  return (
    <main className="page-shell py-8">
      <header className="border-b-2 border-ink pb-4">
        <h1 className="display-2">Cerca nell&apos;archivio</h1>
        <form className="mt-4 flex max-w-[40rem]" action="/cerca" role="search">
          <label className="sr-only" htmlFor="q">
            Parole da cercare
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Es. qualità dell'aria a Roma"
            className="min-w-0 flex-1 border border-ink bg-paper-raised px-3 py-2 text-[1rem]"
          />
          <button
            type="submit"
            className="border border-l-0 border-ink bg-ink px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-paper"
          >
            Cerca
          </button>
        </form>
      </header>

      <section className="mt-6" aria-live="polite">
        {query.length < 2 ? (
          <p className="max-w-[58ch] font-reading text-[1rem] leading-relaxed text-ink-soft">
            Scrivi almeno due parole. La ricerca interrogherà l&apos;archivio completo (11.900 articoli
            dal 2017) e, nel build di produzione, anche video e programmi.
          </p>
        ) : results.length === 0 ? (
          <p className="max-w-[58ch] font-reading text-[1rem] leading-relaxed text-ink-soft">
            Nessun risultato per <strong className="text-ink">“{query}”</strong>. Prova con un termine
            più ampio, oppure sfoglia i <Link className="link-signal" href="/">temi in home</Link>.
          </p>
        ) : (
          <>
            <p className="text-[0.75rem] uppercase tracking-[0.1em] text-ink-soft">
              {results.length} risultati per “{query}”
            </p>
            <ul className="mt-2 grid gap-x-10 sm:grid-cols-2">
              {results.map((article) => (
                <li key={article.id} className="border-t border-rule">
                  <StoryItem article={article} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
