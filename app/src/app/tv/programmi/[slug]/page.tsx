import Link from "next/link";
import { notFound } from "next/navigation";

import { StoryItem } from "@/components/story";
import { content } from "@/lib/content";
import { PROGRAMMES, SLOTS, WEEKDAYS, toMinutes } from "@/lib/schedule";


export function generateStaticParams() {
  return Object.keys(PROGRAMMES).map((slug) => ({ slug }));
}

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const programme = PROGRAMMES[slug];
  if (programme === undefined) notFound();

  const slots = SLOTS.filter((slot) => slot.programme === slug).sort(
    (a, b) => a.day - b.day || toMinutes(a.start) - toMinutes(b.start),
  );

  const articles = await content.getArticlesByCategory(slug, 6).catch(() => []);

  return (
    <main className="page-shell py-8">
      <nav aria-label="Percorso" className="text-[0.75rem] uppercase tracking-[0.08em] text-ink-soft">
        <Link className="hover:underline" href="/tv/palinsesto">
          Palinsesto
        </Link>
        <span className="mx-2">/</span>
        <span>Programmi</span>
      </nav>

      <header className="mt-3 grid gap-6 border-b-2 border-ink pb-6 lg:grid-cols-[1fr_22rem] lg:gap-12">
        <div>
          <h1 className="display-2 max-w-[24ch]">{programme.title}</h1>
          <p className="dek mt-3 max-w-[58ch]">{programme.description}</p>
          {programme.hosts.length > 0 ? (
            <p className="mt-3 text-[0.8125rem] uppercase tracking-[0.08em] text-ink-soft">
              Con {programme.hosts.join(", ")}
            </p>
          ) : null}
        </div>

        <dl className="divide-y divide-rule border-t border-rule">
          <div className="grid grid-cols-[6rem_1fr] gap-3 py-2">
            <dt className="label">Genere</dt>
            <dd className="text-[0.9375rem] capitalize">{programme.genre}</dd>
          </div>
          <div className="grid grid-cols-[6rem_1fr] gap-3 py-2">
            <dt className="label">In onda</dt>
            <dd className="text-[0.9375rem]">
              {slots.length === 0 ? (
                <span className="text-ink-soft">Griglia da confermare</span>
              ) : (
                <ul className="space-y-0.5">
                  {slots.map((slot) => (
                    <li key={`${slot.day}-${slot.start}`}>
                      {WEEKDAYS[slot.day]} · {slot.start}
                    </li>
                  ))}
                </ul>
              )}
            </dd>
          </div>
          <div className="grid grid-cols-[6rem_1fr] gap-3 py-2">
            <dt className="label">Durata</dt>
            <dd className="text-[0.9375rem]">Circa {programme.durationMin} minuti</dd>
          </div>
          {programme.insideOf ? (
            <div className="grid grid-cols-[6rem_1fr] gap-3 py-2">
              <dt className="label">Rubrica di</dt>
              <dd className="text-[0.9375rem]">
                <Link className="link-signal" href={`/tv/programmi/${programme.insideOf}`}>
                  {PROGRAMMES[programme.insideOf]?.title ?? programme.insideOf}
                </Link>
              </dd>
            </div>
          ) : null}
        </dl>
      </header>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          className="inline-flex items-center gap-2 border border-ink px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-ink hover:text-paper"
          href="/tv/diretta"
        >
          <span aria-hidden="true">▶</span> Guarda la diretta
        </Link>
        {programme.playlistUrl ? (
          <a
            className="inline-flex items-center gap-2 border border-rule-strong px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-channel transition-colors hover:border-channel"
            href={programme.playlistUrl}
          >
            Playlist delle puntate
          </a>
        ) : null}
        {programme.facebookUrl ? (
          <a
            className="inline-flex items-center gap-2 border border-rule-strong px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-channel transition-colors hover:border-channel"
            href={programme.facebookUrl}
          >
            Pagina Facebook
          </a>
        ) : null}
      </div>

      <section aria-labelledby="puntate" className="mt-10">
        <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-2">
          <h2 id="puntate" className="text-[1.05rem] font-bold uppercase tracking-[0.08em]">
            Dal programma
          </h2>
          <Link className="text-[0.75rem] font-semibold text-channel hover:underline" href="/temi/video">
            Tutti i video →
          </Link>
        </div>
        {articles.length === 0 ? (
          <p className="mt-3 max-w-[60ch] font-reading text-[0.95rem] leading-relaxed text-ink-soft">
            Nessun articolo collegato in archivio: le puntate di questo programma vivono per ora solo
            sulla playlist YouTube. Il collegamento articolo ↔ puntata è uno dei lavori del progetto.
          </p>
        ) : (
          <ul className="mt-1 grid gap-x-10 sm:grid-cols-2">
            {articles.map((article) => (
              <li key={article.id} className="border-b border-rule">
                <StoryItem article={article} dense />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
