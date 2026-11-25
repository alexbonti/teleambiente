# teleambiente — agent field guide

Read this first, then `docs/WORKLOG.md` for what has already been done and decided.
If this guide disagrees with scripts or tests, trust the executable source and fix the guide.

## What this is

`TODO(verify)`: product definition is still being decided (as of 2026-11-25 the repo
contained only a two-line README). Do not assume a stack or a scope from the repo name
alone. The name matches the Italian environmental broadcaster TeleAmbiente
(teleambiente.tv); confirm with the owner whether this project serves that brand, an
environmental-data product, or something else before scaffolding.

- Owner: Alessio Bonti (`alexbonti` on GitHub).
- Stack: undecided — pick in the first scope decision and record why in `docs/WORKLOG.md`.
- Entry points: none yet.
- Primary outputs: none yet.

## Commands

Nothing is installable or runnable yet. When the first code lands, replace this block
with the real commands and delete the TODO:

```bash
TODO(verify): install command
TODO(verify): dev / run command
TODO(verify): typecheck command
TODO(verify): test command
TODO(verify): build command
TODO(verify): lint command
```

End-to-end truth will be the test + build pair; note anything slow or requiring services.

## Read order by task

| Task | Read first |
| --- | --- |
| Understand what has been done / why | `docs/WORKLOG.md` (newest entries are at the bottom) |
| Add the first code | this file, then `docs/WORKLOG.md` — confirm scope before creating structure |
| Ship a task | `docs/WORKLOG.md` "Entry format" section, then the last 3 entries |

## Architecture map

Empty. Add one row per area as soon as directories exist; this table is a map of
responsibilities, not a file inventory.

| Path / area | Responsibility |
| --- | --- |
| `docs/` | Agent memory: worklog and future deep docs |

## Hard contracts

1. **Memory is mandatory.** Every completed task ends with an entry appended to
   `docs/WORKLOG.md` (format below) *and*, if a command, path, contract or trap changed,
   an edit to this guide — in the same change, before reporting back. A task without a
   worklog entry is not done.
2. **Worklog is append-only.** Never edit or delete past entries to make history look
   tidier. Supersede a wrong entry with a new one that says `Supersedes: <date> — <title>`.
3. **No unverified claims.** Only write that a check passed if it was actually run; record
   the command and its result. Otherwise write `not run`.
4. **Record decisions with reasons.** A choice that a future agent could reasonably
   reverse (stack, data source, schema, dependency) needs one line of *why* in the entry.
5. **No secrets, credentials, customer data or machine-specific absolute paths** in the
   repo or in memory files.
6. **Scope before structure.** Do not scaffold a framework before the product scope is
   agreed and recorded in the worklog.

## Conventions

- Keep memory files in `docs/` so the root stays clean.
- One task = one worklog entry. If a task spans several sessions, extend the open entry
  rather than starting a new one.
- Absolute truth for "what is the current state" is the newest worklog entry plus the
  real files — chat history is not memory.

## Verification

- Fast loop: none yet (no code).
- Before handoff or milestone: re-read the newest worklog entry, run the commands this
  guide lists, and correct anything stale.
- Last verified 2026-11-25: repo is greenfield; nothing to run.

## Gotchas

- The repo was empty apart from `README.md` at kickoff, so every command in this guide is
  a placeholder — do not copy them as if they work.
- `README.md` is a stub (`# teleambiente` / `ta`); do not treat it as documentation.
- The local directory is a fresh clone on `main`; there are no other branches.
- Do not invent a product from the repo name — scope is pending explicit confirmation.

## Recent milestones (newest first, max 5)

- 2026-11-25 — Repo cloned; agent memory initialized (`AGENTS.md` + `docs/WORKLOG.md`).

## Docs index

- `README.md` — stub, to be written once the product is defined.
- `docs/WORKLOG.md` — append-only task history, decisions and open threads. Start here
  when picking up work.
- Deep docs (design, architecture, ADRs): none yet; add and point here as they appear.

## Keeping this guide useful

Target 120–180 lines. Update at every milestone and delete stale detail instead of
growing the file. Deep design belongs in `docs/`; this guide is the map, the contracts
and the traps.
