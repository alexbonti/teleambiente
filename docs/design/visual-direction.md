# Visual direction — "Guida TV"

The design record for the new TeleAmbiente prototype. Read this before changing a
template; `app/PRODUCT.md` holds the product truth, this file holds the visual one.

## The brief it answers

A 34-year-old environmental TV channel (DTT 221 nationally, 18 in Lazio/Umbria) needs a
digital home that a television audience can use without being taught. The owner named
the first experience to get right: **live TV and the schedule as a real utility**. The
explicit anti-goal: **"generic news template"** — endless cards, interchangeable hero,
no point of view.

## The world

Not a green lifestyle magazine. The reference is the **Italian listings magazine and the
broadcast slate**: a page that already knows what time it is, what is on channel 221, and
what happened on the ground in Rome this morning. Newsprint, ink, one signal colour, a
time column that never lies.

Why this world and not "environmental media": every Italian competitor in the benchmark
is a magazine or a portal. A *guida TV* is the one vernacular the incumbent already owns
— the channel, the grid, the programme brands — and nobody in the category is using it.

## Palette (committed, not themed)

| Token | Value | Role | Contrast on paper |
| --- | --- | --- | --- |
| `--color-paper` | `#F3F2EC` | ground | — |
| `--color-paper-deep` | `#E9E7DC` | panels, tints | — |
| `--color-ink` | `#14160F` | text, rules, dark blocks | 16.26:1 |
| `--color-ink-soft` | `#4B4E42` | secondary text, metadata | 7.59:1 |
| `--color-signal` | `#2CAD00` | on-air dot, underline, graphic only | 2.64:1 — never text |
| `--color-signal-ink` | `#147A00` | "in onda" text, hover fills, selection | 4.91:1 |
| `--color-channel` | `#005CA5` | links, channel identity | 6.09:1 |
| `--color-signal-tint` | `#E4F2D9` | newsletter band | ink 15.63:1 |

Green `#2CAD00` is the brand's own green, sampled from the logo. It is graphic only —
dots, underlines, fills — because it does not clear 4.5:1 as text; the darker `#147A00`
carries the word "in onda".

## Type

- **Archivo** (variable, self-hosted, wght 100–900 + wdth 62–125): labels, datelines,
  navigation, headlines, timecodes. Condensed width is used for schedule times, so the
  grid reads like a printed listings column.
- **Source Serif 4** (variable, self-hosted): reading. `.prose-tv` is 19px / 1.62 on a 68ch
  measure; deks and standfirsts use it too, so the "reading voice" is distinct from the
  "channel voice".
- No display face from the category's usual list; no system font as the display voice.

## Composition

- 12-column page shell, max 82rem, hairline rules (`#CFCCBF`) doing the structural work.
- **The weekday rail**: schedule surfaces put the day name in a fixed left column and the
  time in a fixed 3.5rem column, programmes as text — never cards.
- Headlines are tight and large (`.display-1` up to 3.9rem, tracking −0.035em); no
  eyebrows, no section numbers, no gradients, no shadows, no rounded corners.
- Images appear where they carry evidence (lead story, video rail, article lede) and are
  absent from list surfaces on purpose: this is a listings page, not a Pinterest board.

## Signature interaction

The **on-air marker**: a pulsing dot plus "in onda / fino alle HH:MM", server-rendered on
every page from the published grid in `Europe/Rome`, and mirrored inside the schedule by
the `oggi` marker on the current weekday. It is the only motion in the system, and it
disappears under `prefers-reduced-motion`. When nothing is on air the bar says so and
names the next programme — the honest state is part of the product.

## States the system must show

- live vs off-air vs "stream unreachable" (player), with a YouTube fallback path;
- current day, current slot, past slots (muted), empty days (lunedì/domenica, stated as
  unpublished, never invented);
- active nav section (`aria-current`), hover fills in ink, visible focus ring in channel
  blue, themed selection, caret and scrollbars;
- empty hub, empty programme ("nessun articolo collegato"), search with no results.

## What would break it

- Adding a card grid, a carousel, a "related articles" sidebar of thumbnails, or a
  gradient CTA — the world collapses into the generic template the owner rejected.
- Using green as body text or as a large fill behind text (contrast).
- Pretending the schedule has programmes it does not have.
- Introducing a second display typeface or a webfont stack from a CDN.

## Open

- `DESIGN.md` is not written yet; this file is the interim record. When the system stops
  moving, generate it from the built CSS rather than hand-writing a second source of truth.
- Contrast values above are computed from the tokens; re-check after any palette change.
