"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { formatDateline } from "@/lib/format";

interface IndexEntry {
  s: string;
  t: string;
  d: string;
  h: string | null;
  x: string;
}

/** Accent- and case-insensitive folding, so "qualita" finds "qualità". */
function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<IndexEntry[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    fetch(`${base}/search-index.json`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((payload: { entries: IndexEntry[] }) => setEntries(payload.entries))
      .catch(() => setFailed(true));
  }, []);

  const results = useMemo(() => {
    const needle = fold(query.trim());
    if (needle.length < 2 || entries === null) return [];
    const words = needle.split(/\s+/).filter(Boolean);
    return entries
      .map((entry) => {
        const haystack = fold(`${entry.t} ${entry.x} ${entry.h ?? ""}`);
        const hits = words.filter((word) => haystack.includes(word)).length;
        return { entry, hits };
      })
      .filter((row) => row.hits > 0)
      .sort((a, b) => b.hits - a.hits || (a.entry.d < b.entry.d ? 1 : -1))
      .slice(0, 20)
      .map((row) => row.entry);
  }, [entries, query]);

  return (
    <main className="page-shell py-8">
      <header className="border-b-2 border-ink pb-4">
        <h1 className="display-2">Cerca nell&apos;archivio</h1>
        <form className="mt-4 flex max-w-[40rem]" role="search" onSubmit={(event) => event.preventDefault()}>
          <label className="sr-only" htmlFor="q">
            Parole da cercare
          </label>
          <input
            id="q"
            name="q"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Es. qualità dell'aria a Roma"
            className="min-w-0 flex-1 border border-ink bg-paper-raised px-3 py-2 text-[1rem]"
          />
        </form>
      </header>

      <section className="mt-6" aria-live="polite">
        {failed ? (
          <p className="max-w-[58ch] font-reading text-[1rem] leading-relaxed text-ink-soft">
            Indice di ricerca non disponibile in questa build. Nel sito di produzione la ricerca
            interrogherà l&apos;archivio completo lato server.
          </p>
        ) : query.trim().length < 2 ? (
          <p className="max-w-[58ch] font-reading text-[1rem] leading-relaxed text-ink-soft">
            Scrivi almeno due lettere. Questa anteprima cerca negli ultimi{" "}
            {entries === null ? "…" : entries.length.toLocaleString("it-IT")} articoli; l&apos;archivio
            completo dal 2017 resta sul sito in produzione.
          </p>
        ) : results.length === 0 ? (
          <p className="max-w-[58ch] font-reading text-[1rem] leading-relaxed text-ink-soft">
            Nessun risultato per <strong className="text-ink">“{query}”</strong>. Prova con un
            termine più ampio, oppure sfoglia i{" "}
            <Link className="link-signal" href="/">
              temi in home
            </Link>
            .
          </p>
        ) : (
          <>
            <p className="text-[0.75rem] uppercase tracking-[0.1em] text-ink-soft">
              {results.length} risultati per “{query}”
            </p>
            <ul className="mt-2 grid gap-x-10 sm:grid-cols-2">
              {results.map((entry) => (
                <li key={entry.s} className="border-t border-rule py-3">
                  <p className="flex flex-wrap items-center gap-x-2 text-[0.6875rem] uppercase tracking-[0.1em] text-ink-soft">
                    {entry.h ? <span className="font-bold text-signal-ink">{entry.h}</span> : null}
                    <time dateTime={entry.d}>{formatDateline(entry.d)}</time>
                  </p>
                  <h2 className="mt-1 text-[1.1rem] font-bold leading-snug">
                    <Link className="link-plain" href={`/${entry.s}`}>
                      {entry.t}
                    </Link>
                  </h2>
                  <p className="mt-1 line-clamp-2 font-reading text-[0.9rem] leading-relaxed text-ink-soft">{entry.x}</p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
