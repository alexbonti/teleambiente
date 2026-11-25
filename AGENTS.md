# teleambiente — agent field guide

Rebuild of **TeleAmbiente** (teleambiente.tv), the Italian environmental TV channel
(DTT ch. 221 national, ch. 18 Lazio/Umbria, on air since 1991), as a video-first
newsroom with an owned audience. Read this first, then `docs/WORKLOG.md`; if this guide
disagrees with a script or test, trust the executable source and fix the guide.

## What this is

Phase 1 = **audit → strategy → design → prototype**. The live site is untouched: no
deploys, no DNS, no CMS purchase before Gate 2. The repository holds the audit
evidence, the design system and a Next.js prototype that renders real content from the
current WordPress API.

- Stack: Next.js 16.4.6 · React 19.3.1 · TypeScript 6.0.3 · Tailwind 4.3.5 · Zod 4.6.7 ·
  hls.js 1.7 · Vitest 5.1.2 · pnpm 11.5 workspace (`app/` is the only package).
- Entry points: `app/src/app` (routes) · `app/src/components` (shell + schedule UI) ·
  `app/src/lib/content` (content adapter) · `app/src/lib/schedule.ts` (broadcast grid) ·
  `scripts/audit` (evidence crawlers) · `scripts/dev/shot.mjs` (render checks).
- Primary outputs: the prototype, `data/audit/*` (committed evidence), `docs/*`, and
  `docs/design/screens/*.jpg` (rendered templates).

## Commands

Verified 2026-11-25 on Node 24.15.0 / pnpm 11.5.0:

```bash
pnpm install            # ~20 s; caches stay inside the repo (see .npmrc)
pnpm dev                # http://localhost:3000
pnpm typecheck          # tsc --noEmit, clean
pnpm test               # vitest run — 32 tests / 3 files
pnpm lint               # eslint (flat config), clean
pnpm build              # next build (Turbopack), 25 routes
pnpm audit:all          # crawl.mjs + weight.mjs -> data/audit/*; ~3 min, needs network

node scripts/dev/shot.mjs <url> <out.png> [width] [height] [--full]   # needs a server
# CDP render check: writes the screenshot and prints viewport/scrollWidth/h1Count/overflow
# plus any console errors (hydration mismatches show up there, not in the image).

# GitHub Pages preview (static export; also what CI runs)
node scripts/dev/build-search-index.mjs            # -> app/public/search-index.json
STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/teleambiente pnpm build   # -> app/out
# Chrome 158 ignores --window-size with --screenshot: this is the only reliable way to
# see the 390 px layout. It drives the system Chrome with a repo-local profile.
```

Installs: run them from `app/` with `--config.store-dir=$PWD/../.cache/pnpm-home/store`
when `pnpm --filter` complains about the store; the root `.npmrc` points `store-dir` at
`.cache/pnpm-home/store` because the sandbox cannot write `$HOME`.

End-to-end truth is `pnpm typecheck && pnpm test && pnpm lint && pnpm build`. The audit
scripts are the truth for every figure in `docs/audit/`: never hand-edit numbers there.

## Read order by task

| Task | Read first |
| --- | --- |
| What the current site actually is | `docs/audit/digital-footprint.md`, then `data/audit/summary.json` |
| Competitive/market context | `docs/audit/benchmark.md` |
| Build or change a template | `docs/design/visual-direction.md` → `app/PRODUCT.md` → `app/src/components/story.tsx` + `globals.css` |
| Anything that depends on "now" | `app/src/lib/clock.ts` + `app/src/lib/use-now.ts` (the clock is client-side by contract) |
| Change the schedule / live utility | `app/src/lib/schedule.ts` (grid + helpers) → `app/src/components/programme-grid.tsx` |
| Change the content source (WP → CMS) | `app/src/lib/content/index.ts` + `wp.ts` (the adapter is the seam) |
| Plan the migration / URLs | `docs/tech/architecture.md`, `docs/design/ia-and-content-model.md` |
| Pick up any work | `docs/WORKLOG.md` — newest entry at the bottom |

## Architecture map

| Path / area | Responsibility |
| --- | --- |
| `app/src/app` | Routes: `/` front page, `/[slug]` article, `/temi/[slug]` hub, `/tv/diretta`, `/tv/palinsesto`, `/tv/programmi/[slug]`, `/cerca`, `/chi-siamo`, `not-found`. |
| `app/src/components` | Shell (`site-header`, `primary-nav`, `on-air-bar`, `site-footer`), story units, `programme-grid`, `live-player` (client, hls.js on intent). |
| `app/src/lib/schedule.ts` | The broadcast grid as editorial data + Rome-time helpers (`currentSlot`, `nextSlot`, `upcomingSlots`, `slotsForDay`). Client views (`on-air-bar`, `on-air-panel`, `programme-grid`, `live-page-body`) read it through `useRomeNow`. |
| `app/src/app/globals.css` | The design system: palette, type scale, `.label`, `.channel-badge`, `.prose-tv`, focus/selection/scrollbar theming, the single motion moment. |
| `app/src/fonts` | Self-hosted variable Archivo + Source Serif 4 (OFL); `app/src/app/icon.svg` is the favicon. |
| `scripts/dev/shot.mjs` | CDP screenshot + layout probe (also console errors) used to verify templates at 1440 and 390 px. |
| `scripts/dev/build-search-index.mjs` | Builds `app/public/search-index.json` (latest 1,000 posts) for the static preview's client-side search. |
| `app/src/lib/clock.ts` | The only place the render path reads the wall clock (`nowMs`), plus `floorToMinute` for stable snapshots. |
| `app/src/lib/asset.ts` | Prefixes public assets with `NEXT_PUBLIC_BASE_PATH` (next/image does not under `output: export`). |
| `.github/workflows/pages.yml` | Builds the static export and deploys it to GitHub Pages on every push to `main`. |
| `app/src/lib/content/types.ts` | Domain model (`Article`, `Author`, `HubRef`, `ContentImage`) — the template contract |
| `app/src/lib/content/wp.ts` | WordPress REST adapter: fetch + pure `mapWpPost` mapper |
| `app/src/lib/content/index.ts` | `content` switchboard — the only place a source is chosen |
| `app/src/lib/content/html.ts` | Entity decode, tag strip, YouTube id / first image extraction |
| `scripts/audit` | Reproducible crawlers: `crawl.mjs`, `weight.mjs`, shared `lib.mjs` |
| `data/audit` | Committed evidence: `urls.csv` (26,272 URLs), `sample.csv`, `summary.json`, `weight.json` |
| `docs/audit` | Digital-footprint audit + benchmark |
| `docs/strategy`, `docs/tech` | Strategy (M2), architecture & migration (M5) — still to be written |
| `.dsh/skills/` | Project agent tooling (unrelated to the product) |

## Hard contracts

1. **Memory is mandatory.** Every completed task appends an entry to
   `docs/WORKLOG.md`; if a command, path, contract or trap changed, update this guide in
   the same change. A task without a worklog entry is not done.
2. **Worklog is append-only.** Correct by adding a `Supersedes:` entry, never by editing
   history.
3. **No unverified claims.** Record the command and its result; otherwise write
   `not run`. Estimates get the word "estimate"; unverifiable facts get `UNVERIFIED`.
4. **Article URLs are permanent.** Every existing `https://teleambiente.tv/{slug}/` must
   keep resolving. Never change an article slug; new sections use new paths with 301s.
5. **Templates never call WordPress.** All content flows through
   `@/lib/content`. Swapping the source (M5) must not touch a template.
6. **Taxonomy rule.** Hubs are topics; `video`, `intervista`, `dossier`, `live` are
   formats. Never reintroduce format categories such as `Featured`, `Senza Categoria`,
   `Video`.
7. **Performance budget** (M4, not yet enforced — Lighthouse run pending): Home ≤ 1.5 MB
   images, JS ≤ 150 KB gzip, LCP < 2.0 s on throttled mobile 4G, CLS < 0.05.
8. **The schedule is editorial data.** `app/src/lib/schedule.ts` mirrors what the channel
   publishes; never invent a slot to fill an empty day, and keep the grid in Rome time.
9. **"Now" is computed in the browser.** Pages render a snapshot (`nowMs()`), client
   components correct it on mount and tick every 30 s. Never render on-air state that
   only the build could know; a static host would freeze it.
10. **One visual authority.** `docs/design/visual-direction.md` is the world; the palette and
   type tokens in `globals.css` are the implementation. Do not introduce a second accent,
   a display face from the category defaults, cards, shadows or gradients.
11. **Accessibility floor:** WCAG 2.2 AA — one `<h1>` per page, visible focus ring,
    44 px touch targets, no colour-only state. Brand green `#2CAD00` is graphic only
    (2.64:1); green text uses `#147A00` (4.91:1).
12. **No secrets, credentials, customer data or machine-specific absolute paths** in the
    repo, docs or data.
13. **Caches live in the repo.** The sandbox cannot write to `$HOME`; `.npmrc` pins the
    pnpm store and npm cache under `.cache/`. Do not "fix" that by deleting `.npmrc`.

## Conventions

- Everything the prototype shows comes from the real API; no lorem ipsum and no mock
  articles in shipped templates.
- `data/audit/*` is evidence, not scratch: regenerate with `pnpm audit:all` instead of
  editing.
- Docs are Italian-client-facing or English-engineering; keep quotes and numbers in the
  language of their source.
- One task = one worklog entry; extend an open entry rather than starting a new one.

## Verification

- Fast loop: `pnpm typecheck && pnpm test` (≈ 5 s).
- Before handoff/milestone: `pnpm lint && pnpm build && pnpm audit:all`; then re-read the
  newest worklog entry and correct anything stale in this guide.
- Last verified 2026-11-25: typecheck clean, 32/32 tests pass, lint clean, both builds pass
  (server: 25 routes; static export: 40 articles + 6 hubs + 12 programmes into `app/out`),
  `impeccable detect` returns no findings, CDP checks show no horizontal overflow, one
  `<h1>` per template and no console errors at 390 and 1440 px.

## Gotchas

- **TypeScript 7 breaks lint.** `typescript-eslint` refuses TS ≥ 7 (`does not support TS
  7.0`), so `typescript` is pinned to 6.0.3. Do not bump without checking that
  `eslint-config-next` supports it.
- **`npm`/`pnpm` without the repo-local cache fail** (`EACCES` on `~/.npm`): keep
  `.npmrc` and run installs from the repo root. `pnpm install` also appends
  `minimumReleaseAgeExclude` entries to `pnpm-workspace.yaml` — commit them.
- **Every build fetches the live WordPress API** (no ISR declared; pages render per
  request in the server build, at build time in the export). Offline builds yield the
  fallback UI — `page.tsx` catches the error on purpose.
- **The host WAF (BitNinja) rate-limits.** Audit scripts use concurrency ≤ 6 with a
  delay; keep it polite.
- **Category URLs live at `/categorie/{slug}/`.** `/attualita/` is a 404; do not infer
  paths from category slugs.
- **PageSpeed Insights API quota is exhausted** for this project: measure with local
  Lighthouse/Chrome instead, or the weight tables in `data/audit/weight.json`.
- **Sitemap counts ≠ content counts**: 26,272 URLs advertised = 11,744 posts + 14,463 tag
  URLs + 47 categories + 5 pages + 13 authors. The API reports 11,917 posts and 43,950
  tags; treat the sitemap as the crawl surface, not the archive.
- `docs/audit/` numbers are dated 2026-11-25 — re-run `pnpm audit:all` before quoting
  them later.
- **Chrome headless needs a repo-local profile**: `--user-data-dir=$PWD/.cache/chrome-*`,
  otherwise it fails with "Failed to create a unique user data directory". `--screenshot`
  also ignores `--window-size` on Chrome 158 — use `scripts/dev/shot.mjs`.
- **`pnpm --filter app <cmd>` can fail with a store-location mismatch** after switching
  `.npmrc`; run the command from `app/` with an explicit `--config.store-dir`.
- **Segment configs must be literals.** `export const revalidate = process.env.X ? false : 300`
  fails the build ("Invalid segment configuration export"). That is why no page declares
  `revalidate` any more: caching returns with the Vercel/CMS target (M5).
- **The Pages preview is a static export** (`STATIC_EXPORT=true`): no ISR, no server
  functions, no image optimizer, articles limited to the latest 40 via
  `generateStaticParams`, search from a generated JSON index. The server build stays the
  default so nothing here leaks into production.
- **WordPress sends no CORS header**, so the browser cannot query the REST API from a
  static host; that is why search ships an index instead of calling the API.
- **WordPress bodies repeat the excerpt as the first block** (sometimes an `<h4>`), embed
  Instagram blockquotes that die without their script, and auto-excerpts end in `[...]`:
  `stripLeadingDek` / `replaceSocialEmbeds` / `cleanDek` in `content/html.ts` exist for this
  and are unit-tested. Do not remove them to "simplify" the article template.

## Recent milestones (newest first, max 5)

- 2026-11-25 — GitHub Pages preview live: dual build (server default / static export),
  client-side clock, static search index, deploy workflow.
- 2026-11-25 — M4: "Guida TV" design system and the 8-template prototype (home, article,
  hub, live, schedule, programme, search, about) on the live WordPress API; 32 tests.
- 2026-11-25 — M0+M1: Next.js prototype scaffold with a WordPress content adapter,
  reproducible audit harness, digital-footprint and benchmark docs.
- 2026-11-25 — Product scope agreed: rebrand/rebuild teleambiente.tv + business strategy.
- 2026-11-25 — Repo cloned; agent memory initialized (`AGENTS.md` + `docs/WORKLOG.md`).

## Docs index

- `README.md` — what the repo is, layout, quick start.
- `docs/WORKLOG.md` — append-only task history, decisions and open threads.
- `docs/audit/digital-footprint.md` — measured state of the current site (evidence).
- `docs/audit/benchmark.md` — Italian environmental media peers + market data.
- `docs/design/visual-direction.md` — the committed visual world: palette with contrast,
  type, composition, signature interaction, what would break it.
- `docs/design/screens/*.jpg` — rendered home, live, schedule, hub and mobile.
- `app/PRODUCT.md` — product truth captured for the Impeccable flow (users, positioning,
  constraints, brand commitments).
- `docs/strategy/`, `docs/tech/` — filled at M2 and M5 (M4 built the design).
- Deep design docs: none yet; add and point here as they appear.

## Keeping this guide useful

Target 120–180 lines. Update at every milestone; delete stale detail instead of growing
the file. Deep design belongs in `docs/`; this guide is the map, the contracts and the
traps.
