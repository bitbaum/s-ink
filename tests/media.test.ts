import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import manifest from '@/content/works.json';
import en from '@/lib/i18n/dictionaries/en';
import { getReels, getWorks, PORTRAIT_SRC } from '@/lib/works';

const PUBLIC = join(process.cwd(), 'public');
const asFile = (url: string) => join(PUBLIC, url.replace(/^\//, ''));

/**
 * A missing export renders as an empty tile: the build succeeds, the page looks
 * finished, and the hole is only visible to whoever scrolls that far. Cheap to
 * assert, invisible to every other check.
 */
describe('media exports', () => {
  const works = getWorks(en);

  it('exports both sizes for every work', () => {
    for (const work of works) {
      expect(existsSync(asFile(work.src)), `missing ${work.src}`).toBe(true);
      expect(existsSync(asFile(work.thumb)), `missing ${work.thumb}`).toBe(true);
    }
  });

  it('exports a clip and poster for every reel', () => {
    for (const reel of getReels()) {
      expect(existsSync(asFile(reel.src)), `missing ${reel.src}`).toBe(true);
      expect(existsSync(asFile(reel.poster)), `missing ${reel.poster}`).toBe(true);
    }
  });

  it('exports the hero portrait', () => {
    expect(existsSync(asFile(PORTRAIT_SRC))).toBe(true);
  });

  it('has unique work ids', () => {
    const ids = manifest.works.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps every crop inside the frame', () => {
    for (const work of [...manifest.works, manifest.portrait]) {
      const [x, y] = work.focus;
      expect(x, `${work.id} focus x`).toBeGreaterThanOrEqual(0);
      expect(x, `${work.id} focus x`).toBeLessThanOrEqual(1);
      expect(y, `${work.id} focus y`).toBeGreaterThanOrEqual(0);
      expect(y, `${work.id} focus y`).toBeLessThanOrEqual(1);
      expect(work.zoom, `${work.id} zoom`).toBeGreaterThanOrEqual(1);
    }
  });

  it('gives every work a descriptive alt text', () => {
    for (const work of works) {
      expect(work.alt.length, `${work.id} alt too short`).toBeGreaterThan(20);
      expect(work.alt).toContain(work.title);
    }
  });
});
