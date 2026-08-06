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
  await page.goto(base, { waitUntil: 'networkidle' });
  // Reveal animations are one-shot on scroll; jump, then let them finish.
  await page.evaluate((y) => window.scrollTo(0, y), s.y);
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${out}/${s.name}.jpg`, quality: 88, type: 'jpeg' });
  await page.close();
  console.log(s.name);
}
await browser.close();
