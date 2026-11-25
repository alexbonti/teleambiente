import Image from "next/image";
import Link from "next/link";

import { formatDateLong } from "@/lib/format";
import { CHANNELS, PRIMARY_NAV } from "@/lib/navigation";
import { OnAirBar } from "./on-air-bar";
import { PrimaryNav } from "./primary-nav";

export function SiteHeader() {
  return (
    <header>
      <div className="border-b border-rule bg-paper-deep">
        <div className="page-shell flex h-8 items-center justify-between gap-4 text-[0.6875rem] uppercase tracking-[0.1em] text-ink-soft">
          <p className="truncate">
            {formatDateLong(new Date())}
            <span className="mx-2 text-rule-strong">/</span>
            Roma
          </p>
          <div className="flex items-center gap-2">
            {CHANNELS.map((channel) => (
              <span
                key={channel.number}
                className="channel-badge"
                aria-label={`Canale ${channel.number}, ${channel.label}`}
              >
                <b aria-hidden="true">{channel.number}</b>
                <span className="hidden xs:inline">{channel.label}</span>
              </span>
            ))}
            <Link className="ml-1 hidden font-semibold text-channel hover:underline xs:inline" href="/tv/diretta">
              Diretta
            </Link>
          </div>
        </div>
      </div>

      <div className="page-shell flex flex-wrap items-end justify-between gap-x-8 gap-y-3 py-4">
        <Link href="/" className="group flex items-end gap-4">
          <Image
            src="/brand/teleambiente-logo.webp"
            alt="TeleAmbiente"
            width={560}
            height={345}
            priority
            className="h-11 w-auto sm:h-14"
          />
          <span className="hidden max-w-[20ch] pb-1 text-[0.6875rem] uppercase leading-[1.45] tracking-[0.08em] text-ink-soft md:block">
            Informare per un mondo sostenibile
            <br />
            dal 1991
          </span>
        </Link>

        <div className="flex items-center gap-5 text-[0.6875rem] uppercase tracking-[0.1em] text-ink-soft">
          <Link className="font-semibold text-ink hover:underline" href="/cerca">
            Cerca
          </Link>
          <span className="hidden h-4 w-px bg-rule sm:block" aria-hidden="true" />
          <Link className="font-semibold text-ink hover:underline" href="/tv/diretta">
            Guarda la diretta
          </Link>
        </div>
      </div>

      <PrimaryNav />

      <OnAirBar />
    </header>
  );
}
