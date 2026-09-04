# S.Ink

Portfolio site for **S.Ink** — tattoo work by Sami Tutar. Fine line, blackwork,
lettering, ornamental. Available in seven languages.

Live: https://sinktattoo.com

## What it is

One page, deliberately terse. Sixteen pieces, two clips, a spec sheet and a way
to get in touch. The copy is short on purpose — the work carries the page.

```
app/globals.css     SSOT for every design token (colour, type, motion). Retheme here, nowhere else.
lib/site.ts         SSOT for every word the site says, plus booking destinations.
content/works.json  SSOT for the portfolio — shared by the site AND the media pipeline.
scripts/            Media processing and screenshot tooling.
components/         One component + one CSS module each. No design values inline.
```

## Media pipeline

The source photographs are phone snaps taken in whatever room the tattoo
happened in — orange parquet, blue cling film, a red hoodie, a keyboard. Shown
raw they read as a camera roll. `scripts/process-media.py` puts every frame
through one identical treatment — tight crop onto the ink, near-monochrome cold
duotone, S-curve contrast, vignette, grain — which is what makes sixteen
unrelated snapshots look like one body of work.

Cropping is data, not cleverness: each entry in `content/works.json` carries a
`focus` point and a `zoom`. Ink-detection heuristics were tried first and pick
the wrong subject whenever the background is dark.

```bash
# Originals are not in the repo; point at wherever they live.
MEDIA_SRC=~/Downloads/sami-photos pnpm run media

# Re-crop one piece: edit its focus/zoom in content/works.json, delete its
# exports from public/work/, re-run. Existing files are skipped, not rebuilt.
```

Adding a piece is one entry in `content/works.json` plus a re-run. No component
changes.

## Develop

```bash
pnpm install
pnpm run dev        # http://localhost:3000
pnpm run verify     # lint + typecheck + test + build — the same command CI runs
pnpm run test       # vitest only
```

### What the tests cover

Not coverage for its own sake — each suite closes a gap the type checker, the
linter and the build all miss:

- **i18n parity.** TypeScript guarantees every dictionary's *shape*, not its
  array *lengths*, and not that the label maps cover the vocabulary used in the
  manifest. A locale with three styles instead of four compiles perfectly and
  renders a gap.
- **Media exports.** A missing export renders as an empty tile: the build
  succeeds and the hole is only visible to whoever scrolls that far.
- **Regressions.** One test per bug that actually shipped here — see
  `tests/regressions.test.ts`. Each was invisible to every other check and two
  of them made whole sections of the page disappear.

Design review screenshots (needs a checkout that already has Playwright):

```bash
npm start &
PW=/path/to/node_modules/playwright/index.js node scripts/shots.mjs http://localhost:4019 /tmp
```

## Languages

Seven locales (`en`, `de-CH`, `fr`, `tr`, `zh`, `ja`, `ko`), each prerendered at
its own path. `lib/i18n/types.ts` is the contract: add a string there and
TypeScript points at the seven files that now fail to compile, so a missing
translation is a build error rather than a blank space on the page.

`/` redirects to the visitor's best match via `Accept-Language`.

## Booking

Email is the only booking route. The primary button opens a message with the
subject and a short checklist body already written, in the visitor's language —
the gap between "I'll email him later" and a half-finished draft is where most
enquiries die. Change the address in one place: `EMAIL` in `lib/contact.ts`.

## Still open

- **Social links.** `LINKS` in `lib/site.ts` is empty, so no Instagram appears.
  Add a handle there and it shows up in the nav and the Book section
  automatically.
- **Location.** Deliberately absent — no city is stated anywhere, and the
  structured data carries no address rather than a guessed one.

## Notes

- No cookies, no analytics, no third-party requests. Fonts are self-hosted by
  `next/font`.
- Client photographs are cropped to the tattoo, which also keeps faces and
  incidental bystanders out of frame. One supplied clip was unrelated footage of
  people in a garden and is not used.

## Gotchas

- **Never put `clip-path` on a `.reveal` element.** Chromium computes
  intersection against the target's own clip, so an element clipped to zero
  height never reports as intersecting — it hides itself and can then never be
  revealed. The scroll reveal uses opacity and transform only.
- The gallery grid uses `grid-auto-flow: dense` so a two-column tile landing on
  the last free column backfills instead of leaving a hole.
