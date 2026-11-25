import Link from "next/link";

import { LivePlayer } from "@/components/live-player";
import { TodayGrid } from "@/components/programme-grid";
import { CHANNELS } from "@/lib/navigation";
import { WEEKDAYS, currentSlot, nextSlot, upcomingSlots } from "@/lib/schedule";

export const revalidate = 60;

export const metadata = {
  title: "Diretta",
  description:
    "Guarda TeleAmbiente in diretta: canale 221 del digitale terrestre in tutta Italia, canale 18 in Lazio e Umbria.",
};

export default function DirettaPage() {
  const now = new Date();
  const live = currentSlot(now);
  const upcoming = nextSlot(now);

  const nextTen = upcomingSlots(10, now);

  const offAirNote = upcoming
    ? `La programmazione riprende ${upcoming.when === "oggi" ? "oggi" : upcoming.when} alle ${upcoming.slot.start} con ${upcoming.programme.title}.`
    : "La programmazione riprende a breve.";

  return (
    <main className="page-shell py-8">
      <header className="border-b-2 border-ink pb-3">
        <h1 className="display-2">Diretta</h1>
        <p className="mt-1 max-w-[62ch] font-reading text-[1rem] leading-relaxed text-ink-soft">
          {live
            ? `In onda ora: ${live.programme.title}, fino alle ${live.endsAt}.`
            : offAirNote}{" "}
          Canale {CHANNELS[0].number} del digitale terrestre, canale {CHANNELS[1].number} in Lazio e
          Umbria.
        </p>
      </header>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10">
        <div>
          <LivePlayer programme={live?.programme.title ?? "TeleAmbiente in diretta"} offAirNote={offAirNote} />
          <p className="mt-2 max-w-[70ch] text-[0.75rem] leading-relaxed text-ink-soft">
            Flusso HLS della regia, senza cookie di terze parti. Se il player non parte, il canale
            resta visibile su YouTube e in televisione.
          </p>
        </div>

        <aside aria-labelledby="adesso" className="border-t-2 border-ink pt-4">
          <h2 id="adesso" className="label label-signal">
            Adesso
          </h2>
          {live ? (
            <div className="mt-3 bg-paper-deep p-4">
              <p className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-signal-ink">
                <span className="on-air-dot inline-block size-2 rounded-full bg-signal" aria-hidden="true" />
                In onda
              </p>
              <Link className="mt-2 block text-[1.3rem] font-bold leading-[1.05] hover:underline" href={`/tv/programmi/${live.programme.slug}`}>
                {live.programme.title}
              </Link>
              <p className="mt-1 text-[0.8125rem] text-ink-soft">
                Fino alle {live.endsAt} · {live.programme.hosts.join(", ")}
              </p>
            </div>
          ) : (
            <p className="mt-3 bg-paper-deep p-4 font-reading text-[0.95rem] leading-relaxed text-ink-soft">
              Segnale in pausa: la griglia riprende con il prossimo appuntamento.
            </p>
          )}

          {upcoming ? (
            <div className="mt-3 border border-rule p-4">
              <p className="label">A seguire</p>
              <p className="mt-1 text-[1.05rem] font-semibold leading-snug">{upcoming.programme.title}</p>
              <p className="mt-0.5 text-[0.8125rem] text-ink-soft">
                {upcoming.when} alle {upcoming.slot.start}
              </p>
            </div>
          ) : null}

          <h3 className="label mt-6">Oggi in TV</h3>
          <div className="mt-2">
            <TodayGrid />
          </div>

          <Link className="mt-4 inline-block text-[0.8125rem] font-semibold text-channel hover:underline" href="/tv/palinsesto">
            Palinsesto completo →
          </Link>
        </aside>
      </div>

      <section aria-labelledby="settimana" className="mt-12">
        <div className="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-2">
          <h2 id="settimana" className="text-[1.05rem] font-bold uppercase tracking-[0.08em]">
            La settimana
          </h2>
          <Link className="text-[0.75rem] font-semibold text-channel hover:underline" href="/tv/palinsesto">
            Griglia completa →
          </Link>
        </div>
        <ol className="grid gap-x-10 sm:grid-cols-2">
          {nextTen.map((entry, index) => (
            <li key={`${entry.slot.day}-${entry.slot.start}-${entry.programme.slug}-${index}`} className="flex items-baseline gap-3 border-b border-rule py-2">
              <span className="w-16 shrink-0 text-[0.6875rem] uppercase tracking-[0.08em] text-ink-soft">
                {entry.when === "oggi" || entry.when === "domani" ? entry.when : (WEEKDAYS[entry.slot.day] ?? "").slice(0, 3)}
              </span>
              <time className="w-10 shrink-0 text-[0.875rem] font-bold">{entry.slot.start}</time>
              <Link className="link-plain text-[0.9375rem] font-semibold leading-snug" href={`/tv/programmi/${entry.programme.slug}`}>
                {entry.programme.title}
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
