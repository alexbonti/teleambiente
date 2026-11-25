import type { Metadata } from "next";
import { nowMs } from "@/lib/clock";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { archivo, sourceSerif } from "@/fonts/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://teleambiente.tv"),
  title: {
    default: "TeleAmbiente — Informare per un mondo sostenibile",
    template: "%s — TeleAmbiente",
  },
  description:
    "Il canale televisivo dell'ambiente: diretta, palinsesto, inchieste e servizi dal territorio di Roma e del Lazio. Canale 221 del digitale terrestre, canale 18 in Lazio e Umbria.",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: "TeleAmbiente",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${archivo.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <a
          href="#contenuto"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Vai al contenuto
        </a>
        <SiteHeader initialNow={nowMs()} />
        <div id="contenuto">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
