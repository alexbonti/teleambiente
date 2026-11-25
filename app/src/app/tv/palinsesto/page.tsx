import Link from "next/link";

import { ProgrammeGrid } from "@/components/programme-grid";
import { programmesByGenre } from "@/lib/schedule";

export const revalidate = 300;

export const metadata = {
  title: "Palinsesto",
  description:
    "La settimana di TeleAmbiente: A Tutto Mondo, Sulla Via della Natura, QuoVadis, Vox Populi Roma, EcoAgenda e gli altri programmi. Canale 221 e canale 18.",
};

export default function PalinsestoPage() {
  const genres = programmesByGenre();

  return (
    <main className="page-shell py-8">
      <header className="border-b-2 border-ink pb-4">
        <h1 className="display-2">Palinsesto</h1>
        <p className="mt-2 max-w-[64ch] font-reading text-[1.05rem] leading-relaxed text-ink-soft">
          La griglia della settimana, come va in onda: canale 221 del digitale terrestre in tutta
          Italia, canale 18 in Lazio e Umbria. Ogni programma ha la sua pagina con le puntate e le
          playlist.
        </p>
      </header>

      <section aria-labelledby="griglia" className="mt-8">
        <h2 id="griglia" className="label mb-3">
          Griglia settimanale · ora di Roma
        </h2>
        <ProgrammeGrid />
      </section>

      <section aria-labelledby="programmi" className="mt-12">
        <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-2">
          <h2 id="programmi" className="text-[1.05rem] font-bold uppercase tracking-[0.08em]">
            I programmi
          </h2>
          <p className="text-[0.6875rem] uppercase tracking-[0.1em] text-ink-soft">
            {genres.reduce((total, group) => total + group.programmes.length, 0)} titoli
          </p>
        </div>

        <div className="mt-1">
          {genres.map((group) => (
            <section key={group.genre} className="grid gap-3 border-b border-rule py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
              <h3 className="label pt-1">{group.genre}</h3>
              <ul className="grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {group.programmes.map((programme) => (
                  <li key={programme.slug} className="border-l border-rule pl-4">
                    <Link className="link-plain text-[1.1rem] font-bold leading-snug" href={`/tv/programmi/${programme.slug}`}>
                      {programme.title}
                    </Link>
                    <p className="mt-1 max-w-[46ch] font-reading text-[0.9rem] leading-relaxed text-ink-soft">
                      {programme.description}
                    </p>
                    <p className="mt-1.5 text-[0.75rem] uppercase tracking-[0.08em] text-ink-soft">
                      {programme.hosts.join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
