# S.Ink

Portfolio site for **S.Ink** — tattoo work by Sami Sami. Fine line, blackwork,
lettering, ornamental.

Live: https://sink.orangecat.ch

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
MEDIA_SRC=~/Downloads/sami-photos npm run media

# Re-crop one piece: edit its focus/zoom in content/works.json, delete its
# exports from public/work/, re-run. Existing files are skipped, not rebuilt.
```

Adding a piece is one entry in `content/works.json` plus a re-run. No component
changes.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
npm run verify     # lint + typecheck + build — the same command CI runs
```

Design review screenshots (needs a checkout that already has Playwright):

```bash
npm start &
PW=/path/to/node_modules/playwright/index.js node scripts/shots.mjs http://localhost:4019 /tmp
```

## Still open

- **Booking links.** `LINKS` in `lib/site.ts` is empty, so the Book section
  ships no outbound links — a dead link on a booking page is worse than none.
  Add a handle there and it appears in the nav and the Book section
  automatically. **The site currently has no way for anyone to actually reach
  him.**
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
