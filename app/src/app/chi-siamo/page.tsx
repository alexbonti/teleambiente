import type { Metadata } from "next";
import Link from "next/link";

import { CHANNELS } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Chi siamo",
  description:
    "TeleAmbiente: dal 1991 il canale televisivo dell'ambiente. Multi Media Coop SCARL, Roma.",
};

export default function AboutPage() {
  return (
    <main className="page-shell py-8">
      <header className="border-b-2 border-ink pb-5">
        <h1 className="display-2 max-w-[24ch]">Dal 1991 informiamo per un mondo sostenibile.</h1>
        <p className="dek mt-3 max-w-[58ch]">
          Un canale televisivo nato per raccontare l&apos;ambiente quando nessuno lo faceva, oggi una
          redazione video-first che segue il territorio di Roma e del Lazio e parla a un pubblico
          nazionale.
        </p>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-14">
        <div className="prose-tv max-w-[62ch]">
          <p>
            TeleAmbiente va in onda sul canale 221 del digitale terrestre in tutta Italia e sul canale
            18 in Lazio e Umbria. Dal 2025 il canale è visibile anche in streaming, con una
            programmazione che segue il ritmo della redazione: un notiziario settimanale sull&apos;ambiente,
            un contenitore di attualità, rubriche sul territorio, la salute, la casa, la musica e lo
            sport.
          </p>
          <h2>Come lavoriamo</h2>
          <p>
            Il metodo è quello del servizio pubblico declinato sull&apos;ambiente: andare sul posto,
            filmare, sentire chi ha responsabilità, verificare i dati. Undici persone, una regia, una
            redazione che pubblica ogni giorno e un archivio di oltre 11.900 articoli dal 2017.
          </p>
          <p>
            Crediamo che l&apos;informazione ambientale non sia una nicchia: è la cronaca del posto in cui
            viviamo. Per questo raccontiamo la qualità dell&apos;aria di un quartiere con la stessa cura con
            cui raccontiamo una conferenza internazionale.
          </p>
          <h2>Trasparenza</h2>
          <p>
            Il sito dichiara i suoi errori e li corregge in pubblico. La pubblicità è separata dal
            contenuto editoriale e non esistono contenuti sponsorizzati non dichiarati.
          </p>
        </div>

        <aside aria-labelledby="canali" className="border-t-2 border-ink pt-4">
          <h2 id="canali" className="label">
            Dove vederci
          </h2>
          <ul className="mt-3">
            {CHANNELS.map((channel) => (
              <li key={channel.number} className="flex items-baseline gap-3 border-b border-rule py-2">
                <span className="text-[1.5rem] font-bold leading-none">{channel.number}</span>
                <span className="text-[0.8125rem] uppercase tracking-[0.08em] text-ink-soft">
                  {channel.label}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-soft">
            Digitale terrestre, e in streaming dal sito.
          </p>
          <Link className="mt-3 inline-block border border-ink px-3 py-1.5 text-[0.75rem] font-bold uppercase tracking-[0.1em] hover:bg-ink hover:text-paper" href="/tv/diretta">
            Guarda la diretta
          </Link>

          <h3 className="label mt-6">Sede</h3>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">
            Multi Media Coop SCARL
            <br />
            Via Galilei 55
            <br />
            00185 Roma (RM)
            <br />
            P.IVA 09740661005
          </p>
        </aside>
      </div>
    </main>
  );
}
