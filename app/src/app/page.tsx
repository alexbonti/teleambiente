import Image from "next/image";
import { nowMs } from "@/lib/clock";
import Link from "next/link";

import { LeadStory, StoryItem } from "@/components/story";
import { OnAirPanel } from "@/components/on-air-panel";
import { content, type Article } from "@/lib/content";
import { NAV_HUBS } from "@/lib/navigation";


async function load(): Promise<{ articles: Article[]; roma: Article[] }> {
  const [latest, roma] = await Promise.allSettled([
    content.getLatestArticles(18),
    content.getArticlesByCategory("roma", 3),
  ]);
  return {
    articles: latest.status === "fulfilled" ? latest.value : [],
    roma: roma.status === "fulfilled" ? roma.value : [],
  };
}

export default async function HomePage() {
  const { articles, roma } = await load();
  const lead = articles[0];
  const secondary = articles.slice(1, 3);
  const rest = articles.slice(3, 9);
  const videos = articles.filter((article) => article.videoId !== null).slice(0, 4);

  const initialNow = nowMs();

  return (
    <main>
      <section className="page-shell grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_19.5rem] lg:gap-14">
        <div>
          {lead ? <LeadStory article={lead} level={1} /> : <h1 className="display-2">TeleAmbiente</h1>}

          {secondary.length > 0 ? (
            <div className="mt-8 grid gap-6 border-t-2 border-ink pt-5 sm:grid-cols-2 sm:divide-x sm:divide-rule">
              {secondary.map((article, index) => (
                <div key={article.id} className={index === 1 ? "sm:pl-6" : "sm:pr-6"}>
                  <StoryItem article={article} />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <OnAirPanel initialNow={initialNow} />
      </section>

      <section aria-labelledby="notizie" className="border-y-2 border-ink">
        <div className="page-shell py-7">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="notizie" className="text-[1.05rem] font-bold uppercase tracking-[0.08em]">
              Le notizie
            </h2>
            <p className="text-[0.6875rem] uppercase tracking-[0.1em] text-ink-soft">
              Aggiornamento continuo · {new Date().getFullYear()}
            </p>
          </div>
          <div className="mt-2 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <div key={article.id} className="border-t border-rule">
                <StoryItem article={article} dense />
              </div>
            ))}
          </div>
        </div>
      </section>

      {videos.length > 0 ? (
        <section aria-labelledby="video" className="page-shell py-8">
          <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-2">
            <h2 id="video" className="text-[1.05rem] font-bold uppercase tracking-[0.08em]">
              Dal video
            </h2>
            <Link className="text-[0.75rem] font-semibold text-channel hover:underline" href="/temi/video">
              Tutti i video →
            </Link>
          </div>
          <ul className="mt-1 grid gap-x-8 sm:grid-cols-2">
            {videos.map((article) => (
              <li key={article.id} className="border-b border-rule py-3">
                <Link className="group grid grid-cols-[8rem_1fr] items-start gap-4" href={`/${article.slug}`}>
                  <Image
                    src={
                      article.heroImage?.url ??
                      `https://i.ytimg.com/vi/${article.videoId}/hqdefault.jpg`
                    }
                    alt=""
                    width={320}
                    height={180}
                    sizes="128px"
                    className="aspect-video w-full border border-rule object-cover"
                  />
                  <span>
                    <span className="block text-[1.02rem] font-semibold leading-snug group-hover:underline">
                      {article.title}
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.08em] text-ink-soft">
                      <span className="font-bold text-channel">▶ Video</span>
                      {article.hubs[0]?.name ?? ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {roma.length > 0 ? (
        <section aria-labelledby="territorio" className="page-shell pb-8">
          <div className="flex items-baseline justify-between gap-4 border-b border-rule pb-2">
            <h2 id="territorio" className="text-[1.05rem] font-bold uppercase tracking-[0.08em]">
              Dal territorio
            </h2>
            <Link className="text-[0.75rem] font-semibold text-channel hover:underline" href="/temi/roma">
              Roma &amp; Lazio →
            </Link>
          </div>
          <div className="mt-1 grid gap-x-10 sm:grid-cols-3">
            {roma.map((article) => (
              <div key={article.id} className="border-b border-rule sm:border-b-0">
                <StoryItem article={article} dense />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-labelledby="temi" className="border-t border-rule bg-paper-deep">
        <div className="page-shell grid gap-6 py-7 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-1">
            <h2 id="temi" className="text-[1.05rem] font-bold uppercase tracking-[0.08em]">
              Temi
            </h2>
            <p className="mt-2 max-w-[34ch] font-reading text-[0.95rem] leading-relaxed text-ink-soft">
              Sei filoni, non sessanta categorie: l&apos;archivio riorganizzato per come si cerca
              davvero l&apos;informazione ambientale.
            </p>
          </div>
          <ul className="grid gap-y-2 sm:col-span-1 lg:col-span-2 lg:grid-cols-2 lg:gap-x-10">
            {NAV_HUBS.map((hub) => (
              <li key={hub.slug} className="border-b border-rule pb-2">
                <Link className="group flex items-baseline justify-between gap-3" href={`/temi/${hub.slug}`}>
                  <span className="text-[1rem] font-semibold group-hover:underline">{hub.name}</span>
                  <span className="max-w-[22ch] text-right font-reading text-[0.8125rem] leading-snug text-ink-soft">
                    {hub.blurb}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="newsletter" className="page-shell py-10">
        <div className="grid gap-5 border-2 border-ink bg-signal-tint p-6 sm:grid-cols-[1fr_auto] sm:items-end sm:p-8">
          <div>
            <h2 id="newsletter" className="display-3 max-w-[24ch]">
              Una volta a settimana, cosa conta davvero per il territorio.
            </h2>
            <p className="mt-2 max-w-[52ch] font-reading text-[0.95rem] leading-relaxed text-ink-soft">
              La selezione della redazione: clima, Roma e Lazio, animali, scadenze ambientali. Niente
              breaking news a raffica.
            </p>
          </div>
          <form className="flex w-full flex-col gap-2 sm:w-80" aria-describedby="newsletter-note">
            <label className="label" htmlFor="newsletter-email">
              La tua email
            </label>
            <div className="flex">
              <input
                id="newsletter-email"
                type="email"
                required
                disabled
                placeholder="nome@esempio.it"
                className="min-w-0 flex-1 border border-ink bg-paper px-3 py-2 text-[0.9375rem] disabled:opacity-60"
              />
              <button
                type="submit"
                disabled
                className="border border-l-0 border-ink bg-ink px-4 py-2 text-[0.75rem] font-bold uppercase tracking-[0.1em] text-paper disabled:opacity-60"
              >
                Iscriviti
              </button>
            </div>
            <p id="newsletter-note" className="text-[0.6875rem] leading-snug text-ink-soft">
              Prototipo: modulo non attivo. La newsletter è la prima leva di pubblico proprietario
              prevista dalla strategia.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
