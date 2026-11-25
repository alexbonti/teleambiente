"use client";

import Link from "next/link";

import { currentSlot, nextSlot } from "@/lib/schedule";
import { useRomeNow } from "@/lib/use-now";

/**
 * The persistent on-air marker. It answers the question the audience actually has when
 * they land from television or social: what is on right now, and what is next? Server-
 * rendered from the published grid in Europe/Rome, so it renders without JavaScript.
 */
export function OnAirBar({ initialNow }: { initialNow: number }) {
  const now = useRomeNow(initialNow);
  const live = currentSlot(now);
  const upcoming = nextSlot(now);

  return (
    <div className="border-b border-rule bg-paper-raised">
      <div className="page-shell flex flex-wrap items-center justify-between gap-x-8 gap-y-0.5 py-2">
        <p className="flex min-w-0 items-baseline gap-2 text-[0.8125rem] leading-tight">
          {live ? (
            <>
              <span className="flex shrink-0 items-center gap-1.5 font-bold uppercase tracking-[0.1em] text-signal-ink">
                <span className="on-air-dot inline-block size-2 rounded-full bg-signal" aria-hidden="true" />
                In onda
              </span>
              <span className="truncate font-semibold">{live.programme.title}</span>
              <span className="hidden whitespace-nowrap text-ink-soft xs:inline">fino alle {live.endsAt}</span>
            </>
          ) : (
            <>
              <span className="shrink-0 font-bold uppercase tracking-[0.1em] text-ink-soft">Ora in TV</span>
              <span className="truncate text-ink-soft">Nessun programma in onda</span>
            </>
          )}
        </p>

        <p className="flex min-w-0 items-baseline gap-2 text-[0.8125rem] leading-tight">
          {upcoming ? (
            <>
              <span className="shrink-0 uppercase tracking-[0.1em] text-ink-soft">A seguire</span>
              <Link className="truncate font-semibold text-ink hover:underline" href={`/tv/programmi/${upcoming.programme.slug}`}>
                {upcoming.programme.title}
              </Link>
              <span className="whitespace-nowrap text-ink-soft">
                {upcoming.when} alle {upcoming.slot.start}
              </span>
            </>
          ) : null}
          <Link className="ml-auto shrink-0 font-semibold text-channel hover:underline" href="/tv/diretta">
            {live ? "Guarda" : "Diretta"}
          </Link>
        </p>
      </div>
    </div>
  );
}
