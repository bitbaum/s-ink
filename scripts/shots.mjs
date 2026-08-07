/**
 * Render the site headlessly and write screenshots for design review.
 *
 * Deliberately not a project dependency: this is a design tool, run by hand
 * against a local server, and adding Playwright to package.json would drag a
 * browser download into every install and every CI run for the sake of it.
 * Point PW at any checkout that already has Playwright installed.
 *
 * Usage: PW=/path/to/node_modules/playwright node scripts/shots.mjs [baseUrl] [outDir]
 */
// Playwright ships CommonJS, so importing it from an ESM script yields the
// module on `.default` when resolved by path but as named exports when resolved
// by package name. Accept either.
const pw = await import(process.env.PW ?? 'playwright');
const { chromium } = pw.chromium ? pw : pw.default;

const base = process.argv[2] ?? 'http://localhost:4019';
const out = process.argv[3] ?? '/tmp';

const SHOTS = [
  { name: 'desktop-hero', w: 1440, h: 900, y: 0 },
  { name: 'desktop-work', w: 1440, h: 900, y: 1150 },
  { name: 'desktop-work2', w: 1440, h: 900, y: 2600 },
  { name: 'desktop-work3', w: 1440, h: 900, y: 4200 },
  { name: 'desktop-reel', w: 1440, h: 900, y: 6100 },
  { name: 'desktop-styles', w: 1440, h: 900, y: 7000 },
  { name: 'desktop-studio', w: 1440, h: 900, y: 7900 },
  { name: 'desktop-book', w: 1440, h: 900, y: 8700 },
  { name: 'mobile-hero', w: 390, h: 844, y: 0 },
  { name: 'mobile-work', w: 390, h: 844, y: 1000 },
  { name: 'mobile-book', w: 390, h: 844, y: 12000 },
];

const browser = await chromium.launch();
for (const s of SHOTS) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h } });
  // The page scrolls smoothly, which is right for a reader and wrong for a
  // camera: scrollTo() then returns before the page has gone anywhere, so the
  // shutter fires mid-glide and catches half-revealed tiles.
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; }' });

  // Walk down to the target rather than jumping. Jumping straight to `y` leaves
  // every lazy image above it un-requested, so the tiles photograph BLANK on a
  // page that is perfectly fine in a real browser — a false bug that has been
  // chased more than once. Stepping also lets the one-shot reveal animations
  // fire, which a jump past them skips entirely.
  await page.evaluate(async (y) => {
    for (let at = 0; at < y; at += 500) {
      window.scrollTo(0, at);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, y);
  }, s.y);

  // Wait on the page's own state rather than on a guessed delay: every image in
  // view decoded, and every reveal finished rather than merely started.
  await page.waitForFunction(() => {
    const imagesReady = [...document.images].every((i) => !i.complete || i.naturalWidth > 0);
    const revealsSettled = [...document.querySelectorAll('.reveal')].every((el) => {
      const r = el.getBoundingClientRect();
      // Only demand a settled opacity from elements that are actually due to
      // reveal — same trigger line the observer uses. An element peeking in at
      // the very bottom edge is correctly still hidden, and waiting on it hangs.
      const due = r.bottom > 0 && r.top < window.innerHeight * 0.88;
      return !due || getComputedStyle(el).opacity === '1';
    });
    return imagesReady && revealsSettled;
  }, { timeout: 15000 });

  // Finally wait for text to stop moving. The wordmark scrambles itself on load,
  // so a shot taken the moment the images are ready catches it mid-flight and
  // photographs "5Z / AAA" where the brand should be. Watching the text rather
  // than naming the component keeps this honest for anything animated later.
  await page.waitForFunction(() => {
    const now = document.body.innerText;
    const w = /** @type {any} */ (window);
    const stable = w.__prevText === now ? (w.__stableFor ?? 0) + 1 : 0;
    w.__prevText = now;
    w.__stableFor = stable;
    return stable >= 3;
  }, { timeout: 15000, polling: 150 });

  await page.screenshot({ path: `${out}/${s.name}.jpg`, quality: 88, type: 'jpeg' });
  await page.close();
  console.log(s.name);
}
await browser.close();
