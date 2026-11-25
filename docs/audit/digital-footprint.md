# Digital footprint — TeleAmbiente, measured 2026-11-25

Evidence for the rebuild. Every number here is reproducible:

```bash
pnpm audit:all     # writes data/audit/{urls.csv,sample.csv,summary.json,weight.json}
```

Raw output is committed in `data/audit/`. Third-party figures are labelled as
estimates; anything unverifiable is marked **UNVERIFIED** rather than smoothed over.

**Method.** Sitemap graph parsed in full (136 child sitemaps, 26,272 advertised URLs);
93 pages crawled in a deterministic stratified sample (60 posts, 8 hubs, 8 tags, 6
authors, 5 pages, plus home, live, schedule, about, search, date archive); every
same-origin asset of the five key templates fetched and measured by
`content-length`. `robots` indexability is read from the meta tag only — the crawl does
not evaluate canonical chains beyond the self-reference check.

---

## 1. The archive

| Metric | Value | Source |
| --- | --- | --- |
| Posts | **11,917** (oldest 2017-08-01) | `/wp-json/wp/v2/posts` |
| Posts advertised in sitemaps | 11,744 (Δ 173) | `data/audit/urls.csv` |
| Publishing rate, last 12 months | **1,671 posts** (≈ 139/month; range 68 in Aug → 182 in Dec) | WP API `after`/`before` counts |
| Media library | **47,038** items, avg sampled size ≈ 277 KB → ≈ 13 GB | WP API |
| Categories | 51 (47 advertised) | WP API |
| Tags | **43,950** (14,463 advertised in 73 tag sitemaps) | WP API |
| Users/authors | 16 (13 advertised) | WP API |
| Pages | 5 | WP API |
| Post body format | clean HTML — no Gutenberg blocks, no Elementor shortcodes in `post_content` | 5-post sample via API |

The content base is healthy and migratable: the Elementor dependency lives in the
**templates**, not in the articles. That is the single most important fact for the
migration plan.

## 2. Weight and speed

Measured with `pnpm audit:weight` (all assets referenced by the template, HEAD-sized):

| Template | HTML | Requests | Total assets | Images |
| --- | --- | --- | --- | --- |
| Home | 210 KB | **152** | **16.67 MB** | 99 files / 16.5 MB |
| Hub (`/categorie/attualita/`) | 96 KB | 83 | 9.39 MB | 42 / 9.2 MB |
| Article | 112 KB | 70 | 2.62 MB | 22 / 2.5 MB |
| Live (`/diretta-streaming/`) | 100 KB | 85 | 7.24 MB | 42 / 7.0 MB |
| Schedule | 134 KB | 80 | 2.11 MB | 46 / 2.0 MB |

- CSS: 37 stylesheets on Home, 75 KB. JS: 16 files, 134 KB. Scripts per page in the
  sample: avg 27; stylesheets avg 31.
- Worst offenders: a 2.0 MB PNG used as a news thumbnail, the 1.9 MB logo PNG
  (`Logo-TeleAmbiente.png`, served at every size via srcset), and 1.1 MB / 1.0 MB
  campaign graphics.
- Format mix on Home: 24 JPEG, 5 PNG, 1 WebP — no AVIF, no responsive art direction.
- TTFB is *not* the problem when the page cache warms (~60 ms on repeat requests);
  in the sample average TTFB was 1,052 ms across cold URLs. The debt is payload, not
  server.
- No CDN in front (`server: BitNinja-WafPro`, `via: 1.1 Caddy`), no preload/preconnect
  hints, no `font-display` because **no webfonts are loaded** — the site renders in the
  system sans stack.

## 3. Indexation and metadata

| Finding | Evidence |
| --- | --- |
| Crawl surface ≈ 2.2× the article count, and 14,463 tag URLs are advertised | 136 sitemaps: 60 post, 73 tag, 1 page, 1 category, 1 author |
| Tag archives are indexable **and** paginated | `/tag/ambiente/` → 200, `robots: follow, index`, self-canonical |
| Paginated archives are indexable with self-canonicals | `/categorie/attualita/page/2/`, `/tag/video/page/3/` → 200, self-canonical |
| Date archives indexable | `/2026/11/24/` → 200, `follow, index` |
| Author pages indexable, including generic ones | `/author/enricochille2/` → 200, index |
| No Google News sitemap | `/news-sitemap.xml` and `/sitemap-news.xml` → **404** |
| 9 of 93 sampled pages have **no `<h1>`** (≈10%) | `data/audit/sample.csv` |
| Structured data is generic, not journalistic | Types found: `Article`, `WebPage`, `WebSite`, `Organization`, `Person`, `ImageObject`, `CollectionPage`, `ProfilePage`, `VideoObject`, `SearchAction`; **no `NewsArticle`**, no `BreadcrumbList` on the sampled article |
| Category URLs are `/categorie/{slug}/` | `/attualita/` → 404; 301s exist for a few legacy paths |
| Security headers absent | no HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Permissions-Policy on HTML |
| No AI-crawler policy in `robots.txt` | only WordPress rules + sitemap |

## 4. Distribution and owned audience

Verified channel state (public data, 2026-11-25):

| Channel | Reach | State |
| --- | --- | --- |
| YouTube `UCf9ONyZWZ9NfdKDvJ6T2QZQ` | **27.3K subs, 8.6K videos** | Very active: **~4.3 uploads/day** (30 in 7 days), 30 playlists = 30 programmes, weekly live |
| Instagram `@teleambiente` | **102K followers**, 7,133 posts | Largest audience; posts embedded in articles |
| Facebook `/teleambiente` | **62,166 followers**, 8,080 "talking about" | Active (cadence UNVERIFIED) |
| Threads `@teleambiente` | 6,439 followers | Bio stale ("Ch 244", `teleambiente.it`) |
| LinkedIn `/company/teleambiente` | 1,441 followers | Listed 18 employees |
| Spotify show `76bnHjKVg1Ubk1KgRjF3nF` | — | **Dormant since 2023-07-28** |
| X `@teleambiente` | — | Abandoned (2021–22 content), still in schema `sameAs` |
| Telegram `t.me/teleambiente` | 9 subscribers | Abandoned **test** channel |
| TikTok `@teleambiente` | 27 followers | Squatted placeholder, not a real channel |
| WhatsApp channel | — | **Does not exist** |
| Newsletter | — | **Does not exist** (no form, no ESP) |

Structural gap: the site captures **nothing**. No email, no channel, no account, no
reasons to return — while YouTube publishes four videos a day that the site barely
surfaces and the Instagram audience (102K) is 8× the YouTube base and 100× any likely
web audience.

## 5. Video and live

- Programmes on air (from `/palinsesto-televisivo/`): A Tutto Mondo, Sulla Via della
  Natura, QuoVadis, Capire per Prevenire (+ Mattina), Vox Populi Roma, L'Architutto,
  plus TG Ambiente and EcoAgenda. Playlists map 1:1 to programmes.
- Live stream: self-hosted HLS, `https://64b16f23efbee.streamlock.net:443/teleambiente3/teleambiente3/playlist.m3u8`,
  **a single 1920×1080 @ 2.83 Mbps variant** — no adaptive ladder, no poster, no
  fallback. Player config still carries placeholder copy ("type your video title here",
  "Don't forget to like, comment, and subscribe for more fun episodes!").
- The site's `VideoObject` for the live page is named "Diretta **Straming**" (typo) and
  the page has **no `<h1>`**.
- Two live stacks coexist: the Wowza stream on the site and weekly YouTube Live — the
  site never embeds the YouTube live, so it loses chat, replay and YouTube's
  recommendation surface.
- Articles that accompany TV segments carry the YouTube embed (`youtube.com/embed/…`);
  the video hub they deserve does not exist.

## 6. Commercial surface

- The only commercial door is `/scriveteci/` with a dropdown: *Informazioni
  Commerciali / Partnership / Telemarketing*.
- No `/pubblicita/`, `/media-kit/`, `/press/`, `/advertising/` (all 404).
- No display or programmatic ads detected on Home, hub or article templates.
- No newsletter sponsorship product, no partner page, no case studies, no audience
  numbers published.
- Company: Multi Media Coop SCARL, Via Galilei 55, 00185 Roma, P.IVA 09740661005;
  11 staff and ~$5.6M revenue are **LinkedIn estimates**, not audited figures.

## 7. Brand and legacy

- Mission since 1991: *"informare per un mondo sostenibile"*; 11-person team;
  DTT ch. 221 nationally, ch. 18 in Lazio/Umbria.
- Logo palette: green `#2CAD00`, blue `#005CA5`, white. The site uses these as Elementor
  defaults only — there is no typographic identity (system sans), no editorial
  hierarchy, no consistent image treatment.
- `teleambiente.it` (Wayback coverage 2001–2014) now 301s to `teleambiente.tv`; the `.tv`
  archive only starts in 2025 → a recent domain move whose redirects must be audited
  before the next cutover. The legacy domain is still referenced in social bios.

## 8. What this means (priority order)

1. **Payload is the emergency.** 16.7 MB home on mobile is a Discover/News killer; an
   image pipeline alone recovers most of the Core Web Vitals gap.
2. **Crawl budget is spent on tag pages.** 14,463 advertised tag URLs + paginated
   archives for 11.9k articles; consolidate into 8 hubs and make tags metadata.
3. **No owned audience.** Newsletter + WhatsApp + a return-visit reason are v1
   requirements, not growth experiments.
4. **Video is under-monetised and under-distributed.** The organisation already
   produces ~4 videos/day; the site should be the canonical home of that library.
5. **News/Discover plumbing is missing** while the publisher already appears in Google
   News RSS — the fix is a news sitemap and `NewsArticle` schema.
6. **Commercial surface is invisible** to a brand buyer: no media kit, no audience
   numbers, no productised packages.
7. **Migration is tractable**: clean article HTML, stable slugs, 5 pages, 51
   categories → the risk is in URLs, media and workflow, not in content extraction.
8. **Identity needs a design system**, not a reskin: typography, hierarchy, image
   treatment, live states, accessibility (WCAG 2.2 AA).
9. **Legacy/redirect debt** from `.it` → `.tv` must be closed in the same migration.
10. **Governance gap**: no measurement beyond GA4 (`G-J85DWXR9TH`), no consent-mode
    events for video/live/newsletter, so growth targets have no baseline yet.

## 9. Limits of this audit

- No access to GA4/Search Console yet: traffic, query mix, Discover presence and
  conversion rates are **not** measured here. The baseline lands at M1 as
  `data/baseline/` once access is granted.
- Social cadence/engagement for FB, IG, Threads, LinkedIn is **UNVERIFIED** (only
  follower counts are public).
- Lighthouse/CrUX numbers require a local Chrome run (PageSpeed API quota was
  exhausted); the weight table above is the substitute evidence until then.
- DTT audience (Auditel) for ch. 221 / ch. 18 is not public — it can only come from the
  broadcaster.
