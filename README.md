# teleambiente

Rebuild of **TeleAmbiente** (teleambiente.tv) — the Italian environmental TV channel
(DTT ch. 221 national, ch. 18 Lazio/Umbria, broadcasting since 1991) — as a video-first
environmental newsroom with an owned audience.

This repository is the new platform, currently in **Phase 1: audit → strategy → design →
prototype** (see `AGENTS.md`). The live site is untouched during this phase: nothing here
is deployed to `teleambiente.tv`.

## Layout

| Path | What it is |
| --- | --- |
| `app/` | Next.js 16 prototype of the new front end: design system, 8 templates (TypeScript, Tailwind 4) |
| `docs/` | Agent memory and deep docs: audit, strategy, design, tech |
| `data/` | Captured audit evidence (CSV/JSON) — committed on purpose |
| `scripts/audit/` | Reproducible crawlers that produce `data/` and the audit numbers |

## The prototype

A working front end that reads the live WordPress API through an adapter, so the design
is judged on real articles, real hubs and the real broadcast grid.

| Route | Template |
| --- | --- |
| `/` | Front page: lead story, on-air panel, ruled news bands, video rail, hubs |
| `/[slug]` | Article: breadcrumb, dek, byline, video-first media, 68ch prose, related |
| `/temi/[slug]` | Hub (Attualità, Roma & Lazio, Animali, Clima, Inquinamento, Video) |
| `/tv/diretta` | Live HLS player with off-air slate, now/next, the week ahead |
| `/tv/palinsesto` | Week grid (weekday rail + time column) and programme index |
| `/tv/programmi/[slug]` | Programme page: hosts, slots, playlist, linked stories |
| `/cerca` | Archive search |
| `/chi-siamo`, 404 | About and not-found |

**Live preview:** <https://alexbonti.github.io/teleambiente/> — a static export of the same
templates, rebuilt on every push to `main` by `.github/workflows/pages.yml`. It is a
preview, not production: no ISR, and it ships the latest 40 articles (search covers the
latest 1,000) because a static host cannot render the whole 11.9k archive on demand.

Rendered at 1440 and 390 px: [`docs/design/screens/`](docs/design/screens). The visual
world and its rules are in [`docs/design/visual-direction.md`](docs/design/visual-direction.md);
product truth is in [`app/PRODUCT.md`](app/PRODUCT.md).

## Start here

- `AGENTS.md` — the field guide: commands, map, hard contracts, gotchas.
- `docs/WORKLOG.md` — append-only task history: what was done, decided and verified.
- `docs/audit/digital-footprint.md` — the measured state of the current site.
- `docs/audit/benchmark.md` — Italian peers and market context.
- `docs/design/visual-direction.md` — the committed design direction.
- `docs/strategy/`, `docs/tech/` — business strategy, KPIs, architecture and migration
  plan (M2 and M5, still to be written).

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm typecheck && pnpm test && pnpm build
pnpm audit:all      # refresh data/audit/* from teleambiente.tv

# static export, served from /teleambiente/ like GitHub Pages
node scripts/dev/build-search-index.mjs
STATIC_EXPORT=true NEXT_PUBLIC_BASE_PATH=/teleambiente pnpm build   # -> app/out

# rendered-template check (needs a server in another shell)
node scripts/dev/shot.mjs http://localhost:3000/ .cache/home.png 390 1800
```

## Ground rules

1. Article URLs are permanent: every existing `https://teleambiente.tv/{slug}/` keeps
   resolving. Never change an article slug.
2. `docs/WORKLOG.md` is append-only; every completed task appends one entry.
3. No secrets, credentials or customer data in this repository.
4. The schedule is editorial data (`app/src/lib/schedule.ts`): mirror what the channel
   publishes, never invent a slot to fill an empty day.
