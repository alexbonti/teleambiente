import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "TeleAmbiente — prototipo",
  description:
    "Prototipo della nuova piattaforma editoriale TeleAmbiente: non è il sito pubblico.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-surface text-ink antialiased">{children}</body>
    </html>
  );
}
