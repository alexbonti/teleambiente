# teleambiente

Rebuild of **TeleAmbiente** (teleambiente.tv) — the Italian environmental TV channel
(DTT ch. 221 national, ch. 18 Lazio/Umbria, broadcasting since 1991) — as a video-first
environmental newsroom with an owned audience.

This repository is the new platform, currently in **Phase 1: audit, strategy, design**
(see `AGENTS.md`). The live site is untouched during this phase.

## Layout

| Path | What it is |
| --- | --- |
| `app/` | Next.js 16 prototype of the new front end (TypeScript, Tailwind 4) |
| `docs/` | Agent memory and deep docs: audit, strategy, design, tech |
| `data/` | Captured audit evidence (CSV/JSON) — committed on purpose |
| `scripts/audit/` | Reproducible crawlers that produce `data/` and the audit numbers |

## Start here

- `AGENTS.md` — the field guide: commands, map, hard contracts, gotchas.
- `docs/WORKLOG.md` — append-only task history: what was done, decided and verified.
- `docs/audit/digital-footprint.md` — the measured state of the current site.
- `docs/strategy/business-strategy.md` — positioning, growth model, KPIs.
- `docs/design/ia-and-content-model.md` — new IA, taxonomy and URL policy.
- `docs/tech/architecture.md` — target platform and migration plan.

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm typecheck && pnpm test && pnpm build
pnpm audit:all      # refresh data/audit/* from teleambiente.tv
```

## Ground rules

1. Article URLs are permanent: every existing `https://teleambiente.tv/{slug}/` keeps
   resolving. Never change an article slug.
2. `docs/WORKLOG.md` is append-only; every completed task appends one entry.
3. No secrets, credentials or customer data in this repository.
