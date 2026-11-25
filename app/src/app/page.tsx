import { content, type Article } from "@/lib/content";

// The prototype reads the live WordPress API so the design is validated against
// real content, never lorem ipsum. It revalidates instead of fetching per request.
export const revalidate = 300;

async function loadArticles(): Promise<{ articles: Article[]; error: string | null }> {
  try {
    return { articles: await content.getLatestArticles(10), error: null };
  } catch (error) {
    // A prototype must render even when the upstream API is unreachable.
    return { articles: [], error: error instanceof Error ? error.message : "unknown error" };
  }
}

export default async function HomePage() {
  const { articles, error } = await loadArticles();

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <p className="mb-6 inline-block border border-rule bg-surface-raised px-3 py-1 text-xs font-semibold uppercase tracking-widest text-ink-muted">
        Prototipo interno · non indicizzato
      </p>

      <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-brand-ink">
        TeleAmbiente
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-muted">
        La nuova piattaforma editoriale: audit, strategia e design in corso. Questa pagina
        verifica il collegamento con il contenuto reale del sito attuale.
      </p>

      {error ? (
        <div className="mt-8 border-l-4 border-informational bg-surface-raised p-4 text-sm">
          <p className="font-semibold">Content source unreachable</p>
          <p className="mt-1 text-ink-muted">{error}</p>
        </div>
      ) : null}

      <section aria-labelledby="latest" className="mt-12">
        <h2 id="latest" className="text-sm font-semibold uppercase tracking-widest text-ink-muted">
          Ultime notizie · {articles.length} articoli dal feed WordPress
        </h2>

        <ul className="mt-6 divide-y divide-rule border-y border-rule">
          {articles.map((article) => (
            <li key={article.id} className="py-5">
              <article className="grid gap-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs uppercase tracking-wide text-ink-muted">
                  {article.hubs.slice(0, 2).map((hub) => (
                    <span key={hub.slug} className="font-semibold text-brand-deep">
                      {hub.name}
                    </span>
                  ))}
                  <time dateTime={article.publishedAt}>
                    {new Date(article.publishedAt).toLocaleDateString("it-IT", {
                      dateStyle: "medium",
                    })}
                  </time>
                  {article.videoId ? <span>Video</span> : null}
                </div>
                <h3 className="text-xl font-semibold leading-snug">
                  <a
                    className="decoration-brand decoration-2 underline-offset-4 hover:underline"
                    href={article.url}
                  >
                    {article.title}
                  </a>
                </h3>
                {article.dek ? (
                  <p className="max-w-3xl text-ink-muted">{article.dek}</p>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-12 border-t border-rule pt-6 text-sm text-ink-muted">
        <p>
          Fase 1 · M0. Dati: WordPress REST di teleambiente.tv, riletti ogni 300s. Vedi{" "}
          <code className="text-ink">docs/WORKLOG.md</code> per lo stato del lavoro.
        </p>
      </footer>
    </main>
  );
}
