import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-shell py-16">
      <p className="text-[0.75rem] font-bold uppercase tracking-[0.12em] text-ink-soft">Errore 404</p>
      <h1 className="display-1 mt-2 max-w-[22ch]">Questa pagina non è in onda.</h1>
      <p className="dek mt-3 max-w-[52ch]">
        L&apos;indirizzo non esiste o è stato spostato. L&apos;archivio invece c&apos;è: 11.900 articoli dal 2017,
        tutti raggiungibili dalla ricerca.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link className="border border-ink px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] hover:bg-ink hover:text-paper" href="/">
          Torna alla home
        </Link>
        <Link className="border border-rule-strong px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-channel hover:border-channel" href="/cerca">
          Cerca nell&apos;archivio
        </Link>
        <Link className="border border-rule-strong px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-channel hover:border-channel" href="/tv/palinsesto">
          Palinsesto
        </Link>
      </div>
    </main>
  );
}
