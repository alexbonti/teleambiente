# Worklog

Append-only task history for this repository. Any agent finishing a task adds an entry
here **before reporting back**, so the next agent can pick up without re-reading the code
or the chat.

- **Order:** chronological. Newest entries are at the **bottom**.
- **Never** edit or delete a past entry. To correct one, add a new entry starting with
  `Supersedes: <date> — <title of the wrong entry>`.
- **One task = one entry.** If a task continues across sessions, extend its entry
  (`## [open]`) instead of creating a new one.
- Keep it short and factual: what changed, how it was verified, what is still open.
  Never record secrets, tokens, customer data or machine-specific absolute paths.

## Entry format

```markdown
## YYYY-MM-DD — <short task title>

- Status: done | open | blocked
- Goal: <what the task was meant to achieve>
- Did: <changes made, 1–3 bullets>
- Files: <paths created/changed, or "none">
- Decided: <choices a future agent might reverse, and why — omit if none>
- Verified: <exact command + result, or "not run">
- Open / next: <remaining work, TODOs, questions for the owner>
```

---

## 2026-11-25 — Repo kickoff and agent memory

- Status: done
- Goal: Start work on `alexbonti/teleambiente` and set up persistent memory so every
  later agent inherits context.
- Did:
  - Cloned the repository into the working directory (`main` @ `93054f7`, "Initial
    commit"). The repo contained only a two-line `README.md` (`# teleambiente` / `ta`).
  - Created the agent field guide (`AGENTS.md`) and this worklog as the standing memory
    contract.
  - Verified local toolchain: Node v24.15.0, npm 11.12.1, pnpm 11.5.0, Python 3.9.6;
    `gh` authenticated as `alexbonti`.
- Files: `AGENTS.md`, `docs/WORKLOG.md`
- Decided: Memory lives in the repo (`AGENTS.md` + `docs/WORKLOG.md`) rather than in chat,
  so it survives sessions and is shared with other agents. Worklog is append-only with
  chronological entries.
- Verified: `git log --oneline` shows one commit; `git status` clean before these files.
  No application code exists, so no build/test commands apply.
- Open / next:
  - **Blocking:** product scope is not yet defined. Owner was asked for purpose, v1 scope,
    data/integrations and constraints; answered only "I'll describe it — something else".
    Do not scaffold until that description arrives.
  - Then: choose the stack, record the reason here, and write the first vertical slice.
  - `README.md` is still a stub and needs a real description once scope is known.

---

## 2026-11-25 — Satirical fake-news skill (`fake-news-comedy`)

- Status: done
- Goal: Build a reusable skill that turns a user-chosen trending topic into a funny,
  clearly labeled fake-news article, gated on two user checks: pick the topic, then
  approve the pitch before any writing happens.
- Did:
  - Added the project skill bundle `.dsh/skills/fake-news-comedy/`: `SKILL.md` (the two
    checkpoints, workflow, article skeleton, five self-checks, failure modes) plus
    `reference/research.md` (trend radar, search recipes, fact/fiction ledger, the
    "comedy seam"), `reference/craft.md` (headline formulas, quote ladder, escalation,
    kicker types, formats), `reference/safety.md` (satire labeling, real-vs-fake rules,
    punching up, actionable-content and raw-news rules) and `examples/worked-example.md`
    (a full trend → pitch → article pass).
  - Checkpoint 1 asks for the topic, or pitches three trending candidates when the user
    says "you pick". Checkpoint 2 shows a pitch card — real trend with link, the absurd
    premise, real facts kept vs fiction invented, format/language/length, risk check —
    and stops until the user approves. Writing starts only after that approval.
  - Updated `AGENTS.md`: architecture-map row for `.dsh/skills/`, a read-order row for
    using or editing project skills, and a milestone line.
  - Cold-run audit by a separate fresh-context agent (it loaded the skill through the
    `skill` tool, read all four reference files and dry-ran both checkpoints). Fixed its
    findings: the named-topic exception now says "go straight into research in that same
    turn" instead of colliding with "do not research in the same turn"; the shrunken
    pitch is defined as headline + trend/link + premise with format; a no-search/no-link
    fallback with evergreen labeling was added; the risk line now points at a five-item
    checklist in `reference/safety.md`; and `reference/craft.md` now asks for contrasting
    quote registers instead of one terse sentence everywhere.
- Files: `.dsh/skills/fake-news-comedy/SKILL.md`,
  `.dsh/skills/fake-news-comedy/reference/{research,craft,safety}.md`,
  `.dsh/skills/fake-news-comedy/examples/worked-example.md`, `AGENTS.md`,
  `docs/WORKLOG.md`
- Decided: The skill lives in this repo (`.dsh/skills/`, the project-scope root, with
  `user-invocable: true`) instead of the global `~/.dsh/skills/`, because the session
  sandbox only permits workspace writes; copy the directory to `~/.dsh/skills/` to make
  it available in every project. Left model-invocable so a plain request like "write an
  Onion-style piece" triggers it. Kept it out of the product architecture — it is
  tooling, not app scope.
- Verified: frontmatter parsed with the DSH loader's own `yaml` package and checked
  against the rules in `dsh-skill-filesystem` — `name: fake-news-comedy` matches
  `^[a-z0-9]+(-[a-z0-9]+)*$`, description non-empty (392 chars), 141-line file; no
  loader warnings. The session's live skill catalog refreshed twice (on creation and
  after the description edit) and listed `fake-news-comedy`, so `.dsh/skills/`
  discovery works without restarting the session. A fresh-context subagent then loaded
  the skill through the `skill` tool: it reported the skill listed and loadable, that
  Checkpoint 1 emits only the topic question, and that the write gate blocks until an
  explicit approval token — and its four reported gaps were fixed before this entry was
  closed.
- Open / next: product scope is still undefined; this skill is standalone tooling,
  unrelated to the app. Move it to `~/.dsh/skills/fake-news-comedy/` if the owner wants
  it in every project (requires approval outside the workspace).

## 2026-11-25 — M0 + M1: prototype scaffold, audit harness, digital-footprint audit

- Status: done
- Goal: Start Phase 1 of the TeleAmbiente rebuild — evidence first. Stand up the repo,
  make the current site's footprint reproducible, and publish the audit that drives the
  strategy and design.
- Did:
  - Agreed the engagement with the owner: revamp the website **and** the business
    strategy; migrate off WordPress; audience growth first; research/strategy/design
    before any production build. Full Phase 1 plan approved by the owner.
  - Scaffolded a pnpm workspace with one Next.js 16 app (`app/`): App Router,
    TypeScript, Tailwind 4 tokens seeded from the existing logo palette, ESLint flat
    config, Vitest.
  - Built the content seam: `app/src/lib/content/{types,html,wp,index}.ts` — Zod domain
    model, pure `mapWpPost`, WordPress REST adapter, single switchboard. Templates never
    touch the CMS, so the M5 migration is implementation-only.
  - Wrote the evidence harness: `scripts/audit/{lib,crawl,weight}.mjs` — parses the whole
    sitemap graph (136 child sitemaps), crawls a deterministic 93-page sample, and
    measures every asset of the five key templates.
  - Wrote the audit: `docs/audit/digital-footprint.md` (measured) and
    `docs/audit/benchmark.md` (Italian environmental media peers, verified market data,
    explicit UNVERIFIED list).
- Files: `package.json`, `pnpm-workspace.yaml`, `.npmrc`, `.gitignore`, `README.md`,
  `app/**` (config, `src/app`, `src/lib/content`), `scripts/audit/*`,
  `data/audit/{urls.csv,sample.csv,summary.json,weight.json}`,
  `docs/audit/{digital-footprint,benchmark}.md`, `AGENTS.md`, `docs/WORKLOG.md`
- Decided:
  - **Platform target: Next.js + Sanity (EU) + Vercel, images via Sanity CDN**, with a
    documented fallback (Payload 3 + Postgres + R2) decided at Gate 2. Why: an 11-person
    cooperative cannot carry a self-hosted CMS migration; the newsroom needs hosted
    editing, previews and roles; the image CDN solves 47k mis-sized assets at once.
  - **Prototype reads the live WordPress API** behind the adapter (not fixtures), so the
    design is validated against real articles, hubs and video.
  - **URL policy: article slugs unchanged**; `/categorie/*` → hubs, 5 page paths
    redirected, tags become metadata (`noindex`, out of sitemaps), date archives 410.
  - **TypeScript pinned to 6.0.3**, not 7.0.2: `typescript-eslint` refuses TS ≥ 7, and
    lint is a required gate.
  - **Package caches moved inside the repo** (`.npmrc`): the agent sandbox cannot write
    to `$HOME`, so default npm/pnpm caches fail with EACCES.
- Verified (2026-11-25, Node 24.15.0 / pnpm 11.5.0):
  - `pnpm typecheck` → clean; `pnpm test` → 7/7 pass; `pnpm lint` → clean;
    `pnpm build` → Turbopack build, 3 static routes, homepage prerendered from the real
    WordPress API.
  - `pnpm audit:all` → 136 child sitemaps, 26,272 advertised URLs (11,744 posts, 14,463
    tag URLs, 47 categories, 5 pages, 13 authors); 93/93 sampled pages HTTP 200; 9 pages
    missing `<h1>`; Home 152 requests / **16.67 MB** (99 images = 16.5 MB), hub 9.39 MB,
    live 7.24 MB, article 2.62 MB, schedule 2.11 MB.
  - Content inventory via WP API: 11,917 posts since 2017-08-01, 1,671 posts in the last
    12 months, 47,038 media, 43,950 tags, 51 categories, 16 users, 5 pages; post bodies
    are clean HTML (no Elementor in content).
  - Distribution: YouTube 27.3K subs / 8.6K videos / ~4.3 uploads per day; Instagram
    102K; Facebook 62,166; Spotify dormant since 2023-07-28; no newsletter, no WhatsApp.
- Open / next:
  - **Blocking for the baseline:** GA4 (`G-J85DWXR9TH`) and Search Console access. Until
    then `data/baseline/` is empty and every KPI is relative, not absolute.
  - Brand files needed: vector logo, font licences, programme logos, 10–15 usable photos.
  - Two interviews: director (positioning) and commercial lead (current partner deals).
  - M2: `docs/strategy/business-strategy.md` + `docs/strategy/kpis.md` → Gate 1.
  - M3: `docs/design/ia-and-content-model.md` + `data/redirects.csv` + validator.
  - Lighthouse numbers still missing (PageSpeed API quota exhausted) — run local
    Lighthouse before M4 budgets are enforced.

## 2026-11-25 — M4: "Guida TV" design system and the 8-template prototype

- Status: done (prototype), open threads below
- Goal: stop designing in documents and build the new TeleAmbiente — a real, mobile-first,
  Italian-language site on the existing Next.js shell, reading the live WordPress API,
  with the live channel and the schedule as its first-class utility (owner's priority).
- Did:
  - **Direction contract (Impeccable roll, direction scope, operate mode).** Visual world is
    drawn from the Italian *guida TV* and the broadcast slate, not from green-lifestyle
    imagery: newsprint ground, one ink, one signal green (`#2CAD00` graphic only), channel
    blue `#005CA5`; hairline rules as structure; a weekday rail and a fixed time column on
    schedule surfaces; no cards, no shadows, no gradients, no eyebrows.
  - **Design system in `app/src/app/globals.css`** (Tailwind 4 `@theme` tokens): paper/ink/
    signal/channel palette, `Archivo` (variable, width axis used for the listings voice) and
    `Source Serif 4` (reading) self-hosted from `app/src/fonts/`, `.display-1/2/3`, `.label`,
    `.channel-badge`, `.prose-tv` (68ch, 1.62), themed selection/caret/scrollbars/focus.
    One authored motion moment: the on-air dot pulse, disabled under reduced motion.
  - **Shell and templates.** `site-header` (dateline, 221/18 badges, wordmark, client nav with
    `aria-current`), `on-air-bar` (server-rendered "in onda / a seguire" from the grid in
    Europe/Rome), `site-footer`; routes `/` (front page: lead + on-air panel + ruled news
    bands + video rail + hubs + newsletter band), `/tv/diretta` (HLS player with hls.js
    loaded on intent, off-air slate, week list), `/tv/palinsesto` (week grid + programme
    index), `/tv/programmi/[slug]` (12 programmes, playlists), `/temi/[slug]` (6 hubs),
    `/[slug]` (article: breadcrumb, dek, byline, video-first media, sanitized prose, related),
    `/cerca`, `/chi-siamo`, `not-found`.
  - **Editorial data**: `app/src/lib/schedule.ts` encodes the published grid from
    `teleambiente.tv/palinsesto-televisivo/` (12 programmes, 13 slots, weekdays in Rome time)
    with honest empty days (lunedì, domenica) and the Wednesday 21:30 collision preserved.
  - **Content seam extended, templates untouched by WP**: `getArticlesByCategory`,
    `getCategoryBySlug`, `getHubs`, `searchArticles` added to the adapter and the
    `ContentSource` interface.
  - **Body hygiene** in `content/html.ts`, all unit-tested: `sanitizeHtml` (drops scripts,
    inline handlers, non-allowlisted iframes; keeps editorial figures), `cleanDek` (no
    mid-sentence deks), `stripLeadingDek` (no duplicated intro paragraph), `replaceSocialEmbeds`
    (dead Instagram blockquotes become links).
- Files: `app/PRODUCT.md`, `app/src/app/globals.css`, `app/src/fonts/*`, `app/src/app/*`
  (all templates above), `app/src/components/*` (7), `app/src/lib/{schedule,format,navigation}.ts`,
  `app/src/lib/content/{wp,index,html}.ts` + 2 test files, `app/public/brand/teleambiente-logo.webp`,
  `scripts/dev/shot.mjs`, `docs/design/visual-direction.md`, `docs/design/screens/*.jpg`.
- Decided:
  - **The schedule is the site's spine**, not a side page: on-air bar on every page, live page
    with week list, `oggi` marker in the grid. This follows the owner's answer ("Live TV +
    schedule as a real utility") and is what distinguishes the site from a generic news
    template.
  - **No cards, one accent, print grammar.** The listings-magazine world refuses the
    category default the owner named as the anti-goal ("generic news template").
  - **Video-first on article pages**: when a story ships a video, the video is the lede media
    and the featured image is skipped, so the same frame is never shown twice.
  - **Schedule is editorial data, not scraped**: it lives in `schedule.ts` until the CMS owns
    it; the UI states where the grid is empty instead of inventing slots.
  - **Screenshots are produced through CDP** (`scripts/dev/shot.mjs`) because Chrome 158's
    `--screenshot` ignores `--window-size`; the script also reports viewport/scroll width and
    `<h1>` count, which is how the mobile layout was verified.
- Verified (2026-11-25):
  - `pnpm typecheck` → clean; `pnpm test` → **32/32 pass** (3 files); `pnpm lint` → clean;
    `pnpm build` → 25 routes (SSG for 6 hubs + 12 programmes, ISR home/categories,
    on-demand articles).
  - CDP render check at 1440 and 390: `scrollWidth === viewport` (no horizontal overflow),
    exactly one `<h1>` on home, live, palinsesto, hub, article.
  - `impeccable detect --json src/app src/components src/app/globals.css` → `[]` (no findings).
  - Rendered with real content: 10+ live articles, real hubs and counts, real programme grid;
    on-air bar correctly reports "nessun programma in onda" at 15:47 and the next slot at 21:00.
- Open / next:
  - `DESIGN.md` still to be written from the built system (Impeccable `build-phase finish`).
  - Lighthouse/Web Vitals not measured on this build (PSI quota exhausted); the M4 budgets
    (JS ≤ 150 KB gzip, LCP < 2.0 s) are unproven until a local Lighthouse run.
  - Schedule needs newsroom confirmation: lunedì and domenica are empty in the published grid,
    and mercoledì 21:30 has two programmes (L'Architutto, Centomila Voci).
  - Newsletter form is inert on purpose (no list exists); search is WP full-text, not the
    future index; no analytics, no consent banner, no CMS yet.
  - Brand assets still missing: vector logo, programme logos, licensed photography.
