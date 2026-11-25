# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase: Next.js 16 (App Router) + TypeScript + Tailwind 4, reading the
current WordPress REST API through a content adapter. Target platform for the
production build (decided, Gate 2 pending): Next.js + Sanity (EU) + Vercel, images via
Sanity's CDN. The live site is untouched during this phase.

## Users

- **Primary:** Italian readers and viewers who care about the environment and their
  territory — 35–64, core in Lazio and Umbria, national reach through DTT channel 221.
  They arrive from television, Google/Discover, Instagram (102K) and YouTube (27.3K).
  Their job: understand what is happening to their environment and territory, and know
  what they can watch now.
- **Secondary:** local decision-makers, associations, schools and institutions who use
  TeleAmbiente as a record of what happens in Rome and Lazio.
- **Commercial (later):** green brands, utilities, parks and waste companies who buy
  sponsorship; not a design target in v1, but the surfaces must be able to carry them.

## Product Purpose

The canonical digital home of an environmental TV newsroom: the place where the channel
can be watched, its journalism read, and its programmes returned to — so a TV-first
publisher stops losing its audience at the edge of the screen. Success means an owned
audience (returning readers, newsletter), credible reach (search, Discover, AI answers)
and, later, a monetisable surface.

## Positioning

Video-first environmental accountability from Rome and Lazio with national reach: the
only Italian green publisher that can put the territory on camera, with a live channel
and thirty programme brands behind every story.

## Operating Context

- Cooperative of ~11 people in Rome (Multi Media Coop SCARL); ~4–5 editorial staff.
- ~139 articles per month, 11,917 in the archive since 2017; ~4.3 YouTube uploads/day.
- The broadcast schedule structures the working day; the site must follow it, not fight it.
- DTT ch. 221 nationally, ch. 18 in Lazio/Umbria; live HLS stream already exists.
- Current CMS: WordPress 7 + Elementor; migration is planned, not yet executed.

## Capabilities and Constraints

- **Every existing article URL is permanent** (`https://teleambiente.tv/{slug}/`).
- Content source for this build: WordPress REST, read-only, behind an adapter.
- Italian only. No paywall, no programmatic ads sold in v1.
- Live video: single-bitrate HLS source; the player must degrade gracefully.
- Search, schedule, programme pages, video library, article pages, hubs.
- Accessibility floor: WCAG 2.2 AA.

## Brand Commitments

- Name **TeleAmbiente**; existing logo (green `#2CAD00`, blue `#005CA5`).
- Mission since 1991: *"informare per un mondo sostenibile"*.
- Channel numbers: **221** (national DTT), **18** (Lazio/Umbria).
- Programme names and schedule: A Tutto Mondo, Sulla Via della Natura, QuoVadis,
  Capire per Prevenire, Vox Populi Roma, L'Architutto, TG Ambiente, EcoAgenda.

## Evidence on Hand

- 11,917 real articles (clean HTML bodies), 47,038 media items, 51 categories.
- Live HLS stream, schedule page, 30 YouTube playlists / 8.6K videos, staff bios.
- Absent and not to be invented: newsletter list, audience/ratings numbers, media kit,
  a licensed photo library, partner case studies.

## Product Principles

1. **Show, don't claim.** Video and field reporting are the proof; text introduces them.
2. **The channel is a utility.** What is on now, what is on tonight, what can I catch up
   on — answer before asking for attention.
3. **Read like a newspaper, not a blog.** One lead, visible hierarchy, no card soup.
4. **Territory over generic green.** Rome and Lazio are the beat, not a backdrop.
5. **Own the audience.** Every surface offers a reason to come back tomorrow.

## Accessibility & Inclusion

WCAG 2.2 AA: one `<h1>` per page, visible focus, 44 px targets, no colour-only meaning,
captions and transcripts for video in the production phase.
