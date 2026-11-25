"use client";

import Link from "next/link";

import { TodayGrid } from "@/components/programme-grid";
import { currentSlot, nextSlot } from "@/lib/schedule";
import { useRomeNow } from "@/lib/use-now";

/** The front page's TV panel: what is on now, what is on today. */
export function OnAirPanel({ initialNow }: { initialNow: number }) {
  const now = useRomeNow(initialNow);
  const live = currentSlot(now);
  const upcoming = nextSlot(now);

  return (
    <aside aria-labelledby="in-tv" className="border-t-2 border-ink pt-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="in-tv" className="label label-signal">
          Adesso in TV
        </h2>
        <Link
          className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-channel hover:underline"
          href="/tv/diretta"
        >
          Diretta
        </Link>
      </div>

      <div className="mt-3 bg-paper-deep p-4">
        {live ? (
          <>
            <p className="flex items-center gap-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-signal-ink">
              <span className="on-air-dot inline-block size-2 rounded-full bg-signal" aria-hidden="true" />
              In onda ora
            </p>
            <p className="mt-2 text-[1.35rem] font-bold leading-[1.05]">{live.programme.title}</p>
            <p className="mt-1 text-[0.8125rem] text-ink-soft">Fino alle {live.endsAt} · canale 221</p>
            <Link
              className="mt-3 inline-flex items-center gap-2 border border-ink px-3 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-ink hover:text-paper"
              href="/tv/diretta"
            >
              <span aria-hidden="true">▶</span> Guarda
            </Link>
          </>
        ) : (
          <>
            <p className="font-reading text-[1.02rem] leading-snug text-ink-soft">
              Nessun programma in onda adesso.
            </p>
            {upcoming ? (
              <p className="mt-2 text-[0.9375rem] leading-snug">
                <span className="font-semibold">A seguire:</span> {upcoming.programme.title},{" "}
                {upcoming.when} alle {upcoming.slot.start}
              </p>
            ) : null}
          </>
        )}
      </div>

      <h3 className="label mt-5">Oggi in televisione</h3>
      <div className="mt-2">
        <TodayGrid initialNow={initialNow} />
      </div>
      <Link
        className="mt-3 inline-block text-[0.8125rem] font-semibold text-channel hover:underline"
        href="/tv/palinsesto"
      >
        Palinsesto della settimana →
      </Link>
    </aside>
  );
}
