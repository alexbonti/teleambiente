import Link from "next/link";

import { CHANNELS, PRIMARY_NAV } from "@/lib/navigation";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t-2 border-ink bg-paper-deep">
      <div className="page-shell grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="display-3 max-w-[18ch]">TeleAmbiente, dal 1991 informa per un mondo sostenibile.</p>
          <p className="mt-3 max-w-[42ch] text-[0.8125rem] leading-relaxed text-ink-soft">
            Multi Media Coop SCARL · Via Galilei 55, 00185 Roma · P.IVA 09740661005
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CHANNELS.map((channel) => (
              <span
                key={channel.number}
                className="channel-badge"
                aria-label={`Canale ${channel.number}, ${channel.label}`}
              >
                <b aria-hidden="true">{channel.number}</b>
                {channel.label}
              </span>
            ))}
          </div>
        </div>

        <nav aria-label="Mappa del sito">
          <p className="label">Sezioni</p>
          <ul className="mt-3 space-y-1.5">
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <Link className="text-[0.875rem] hover:underline" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="label">Contatti</p>
          <ul className="mt-3 space-y-1.5 text-[0.875rem]">
            <li>
              <a className="hover:underline" href="https://teleambiente.tv/scriveteci/">
                Scriveteci
              </a>
            </li>
            <li>
              <a className="hover:underline" href="https://www.instagram.com/teleambiente/">
                Instagram
              </a>
            </li>
            <li>
              <a className="hover:underline" href="https://www.youtube.com/channel/UCf9ONyZWZ9NfdKDvJ6T2QZQ">
                YouTube
              </a>
            </li>
            <li>
              <a className="hover:underline" href="https://www.facebook.com/teleambiente">
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-rule">
        <div className="page-shell flex flex-wrap items-center justify-between gap-3 py-4 text-[0.6875rem] uppercase tracking-[0.08em] text-ink-soft">
          <p>© 2026 TeleAmbiente TV</p>
          <p className="normal-case tracking-normal">
            Prototipo di redesign · non è il sito pubblico ·{" "}
            <Link className="underline" href="/chi-siamo">
              Chi siamo
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
