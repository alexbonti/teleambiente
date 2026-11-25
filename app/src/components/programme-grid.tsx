import Link from "next/link";

import { WEEKDAYS, currentSlot, romeNow, slotsForDay, toMinutes } from "@/lib/schedule";

/**
 * The week grid, drawn like a listings page: a day rail on the left, times in a
 * fixed column, programmes as text with hairline separation. The current day is
 * marked, and the slot on air right now carries the only accent in the page.
 */
export function ProgrammeGrid({ onlyDay }: { onlyDay?: number }) {
  const now = new Date();
  const { day: today } = romeNow(now);
  const live = currentSlot(now);

  const order = [1, 2, 3, 4, 5, 6, 0];
  const days = onlyDay === undefined ? order : [onlyDay];

  return (
    <div className="border-t-2 border-ink">
      {days.map((day) => {
        const slots = slotsForDay(day);
        const isToday = day === today;
        return (
          <section
            key={day}
            aria-labelledby={`day-${day}`}
            className={`grid gap-2 border-b border-rule py-5 sm:grid-cols-[9rem_1fr] sm:gap-6 ${isToday ? "bg-paper-raised" : ""}`}
          >
            <div>
              <h2 id={`day-${day}`} className="flex items-baseline gap-2 text-[0.9375rem] font-bold uppercase tracking-[0.08em]">
                {WEEKDAYS[day]}
                {isToday ? (
                  <span className="inline-flex items-center gap-1 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-signal-ink">
                    <span className="on-air-dot inline-block size-1.5 rounded-full bg-signal" aria-hidden="true" />
                    oggi
                  </span>
                ) : null}
              </h2>
              <p className="mt-0.5 text-[0.6875rem] uppercase tracking-[0.1em] text-ink-soft">
                {slots.length} {slots.length === 1 ? "appuntamento" : "appuntamenti"}
              </p>
            </div>

            {slots.length === 0 ? (
              <p className="max-w-[52ch] font-reading text-[0.9375rem] italic leading-relaxed text-ink-soft">
                Nessun programma pubblicato per questo giorno. La griglia va confermata con la
                redazione: il palinsesto è dato editoriale, non inferito.
              </p>
            ) : (
              <ul className="space-y-0">
                {slots.map(({ slot, programme }, index) => {
                  const onAir = live !== null && live.slot.day === slot.day && live.slot.programme === slot.programme;
                  return (
                    <li
                      key={`${slot.day}-${slot.start}-${programme.slug}-${index}`}
                      className={`grid grid-cols-[3.5rem_1fr] items-baseline gap-4 border-t border-rule/60 py-2 first:border-t-0 first:pt-0 ${onAir ? "text-ink" : ""}`}
                    >
                      <time
                        dateTime={`${WEEKDAYS[day]}T${slot.start}`}
                        className={`text-[0.9375rem] font-bold ${onAir ? "text-signal-ink" : "text-ink"}`}
                      >
                        {slot.start}
                      </time>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <Link className="link-plain text-[1.0625rem] font-semibold leading-snug" href={`/tv/programmi/${programme.slug}`}>
                          {programme.title}
                        </Link>
                        {onAir ? (
                          <span className="inline-flex items-center gap-1.5 text-[0.625rem] font-bold uppercase tracking-[0.1em] text-signal-ink">
                            <span className="on-air-dot inline-block size-1.5 rounded-full bg-signal" aria-hidden="true" />
                            in onda
                          </span>
                        ) : null}
                        {programme.insideOf ? (
                          <span className="text-[0.6875rem] uppercase tracking-[0.08em] text-ink-soft">
                            dentro {programme.insideOf === "a-tutto-mondo" ? "A Tutto Mondo" : programme.insideOf}
                          </span>
                        ) : null}
                        <span className="text-[0.8125rem] text-ink-soft">{programme.hosts.join(" · ")}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

export function TodayGrid() {
  const now = new Date();
  const { day: today, minutes } = romeNow(now);
  const slots = slotsForDay(today);
  const live = currentSlot(now);

  return (
    <ol className="divide-y divide-rule/70">
      {slots.map(({ slot, programme }, index) => {
        const isPast = toMinutes(slot.start) < minutes;
        const onAir = live !== null && live.slot.programme === slot.programme && live.slot.start === slot.start;
        return (
          <li key={`${slot.start}-${programme.slug}-${index}`} className="flex items-baseline gap-3 py-2">
            <time className={`w-11 shrink-0 text-[0.8125rem] font-bold ${onAir ? "text-signal-ink" : isPast ? "text-ink-soft" : "text-ink"}`}>
              {slot.start}
            </time>
            <Link
              className={`link-plain text-[0.9375rem] leading-snug ${isPast && !onAir ? "text-ink-soft" : "font-semibold"}`}
              href={`/tv/programmi/${programme.slug}`}
            >
              {programme.title}
            </Link>
            {onAir ? (
              <span className="ml-auto inline-flex items-center gap-1 text-[0.5625rem] font-bold uppercase tracking-[0.1em] text-signal-ink">
                <span className="on-air-dot inline-block size-1.5 rounded-full bg-signal" aria-hidden="true" />
                in onda
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
