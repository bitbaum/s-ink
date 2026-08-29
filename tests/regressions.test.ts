import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

/**
 * One test per bug that actually shipped here. Each of these was invisible to
 * the type checker, the linter and the build — they only showed up in a
 * browser, and two of them made whole sections of the page disappear.
 */
describe('regressions', () => {
  it('never clips a scroll-reveal element', () => {
    // Chromium computes intersection against the target's own clip, so an
    // element clipped to zero height never reports as intersecting: it hides
    // itself and can never be revealed. This blanked everything below the hero.
    const css = read('app/globals.css');
    const reveal = css.slice(css.indexOf('.js .reveal'));
    expect(reveal.slice(0, reveal.indexOf('}'))).not.toContain('clip-path');
  });

  it('ends the hero drift-in at the same opacity the image rests at', () => {
    // The animation runs with fill `both`, so the last keyframe wins over the
    // rule above it. A stale value here silently dims the hero and reads like a
    // CSS ordering bug rather than an animation one.
    const css = read('components/Hero.module.css');
    const imgOpacity = /\.backdrop img \{[^}]*opacity:\s*([\d.]+)/.exec(css)?.[1];
    const keyframeOpacity = /@keyframes drift-in \{[^@]*?to \{[^}]*opacity:\s*([\d.]+)/.exec(
      css,
    )?.[1];
    expect(imgOpacity).toBeDefined();
    expect(keyframeOpacity).toBe(imgOpacity);
  });

  it('keeps the browser theme colour in step with the page background', () => {
    // Two sources of truth for the same colour: the CSS token paints the page,
    // the metadata value paints the browser chrome around it. They drift apart
    // silently and only show up as a seam on mobile.
    const token = /--primitive-void:\s*(#[0-9a-f]{3,8})/i.exec(read('app/globals.css'))?.[1];
    const theme = /themeColor:\s*'(#[0-9a-f]{3,8})'/i.exec(read('app/[locale]/layout.tsx'))?.[1];
    expect(token).toBeDefined();
    expect(theme?.toLowerCase()).toBe(token?.toLowerCase());
  });

  it('packs the gallery grid densely', () => {
    // A two-column tile landing on the last free column wraps and leaves a hole
    // behind it. Dense packing backfills it and self-heals as pieces are added.
    expect(read('components/Gallery.module.css')).toContain('grid-auto-flow: dense');
  });

  it('backs the one-shot reveal with a scroll sweep', () => {
    // IntersectionObserver reports once per frame, so a fast scroll can carry an
    // element past the viewport without it ever being reported. The reveal never
    // re-runs, so a missed frame is permanently invisible content, not a late
    // animation. Measured: 21 of 35 targets stayed at opacity 0 after a fast
    // programmatic scroll of the whole page.
    const src = read('components/RevealObserver.tsx');
    expect(src).toContain("addEventListener('scroll'");
    expect(src).toContain('getBoundingClientRect');
  });

  it('puts the browser icon where Next actually looks for it', () => {
    // `favicon.ico` is only honoured at the top level of `app/`. It sat in
    // `app/[locale]/` for weeks, where Next silently ignores it: the live head
    // carried no icon link at all and /favicon.ico returned 404, so every tab
    // and bookmark showed a blank page glyph. `icon.*` is valid at any depth,
    // which is why the replacement is an SVG.
    expect(existsSync(join(process.cwd(), 'app/icon.svg'))).toBe(true);
    const strays = readdirSync(join(process.cwd(), 'app'), { recursive: true })
      .map(String)
      .filter((p) => p.endsWith('favicon.ico') && p !== 'favicon.ico');
    expect(strays).toEqual([]);
  });

  it('draws the icon in the same colours as the site', () => {
    // A favicon cannot read CSS variables, so scripts/make-icons.py copies the
    // three primitives by hand. This fails if the palette moves without them.
    const css = read('app/globals.css');
    const script = read('scripts/make-icons.py');
    for (const token of ['--primitive-void', '--primitive-bone', '--primitive-strobe']) {
      const hex = new RegExp(`${token}:\\s*(#[0-9a-f]{6})`, 'i').exec(css)?.[1];
      expect(hex).toBeDefined();
      expect(script.toLowerCase()).toContain(hex!.toLowerCase());
    }
  });

  it('serves a link preview in a format chat apps can render', () => {
    // WhatsApp and iMessage show no thumbnail at all for a WebP og:image, and
    // WhatsApp is the channel this artist sends his own link through — so the
    // one preview guaranteed to be seen was the one that silently failed.
    const src = read('lib/works.ts');
    const og = /OG_IMAGE = '([^']+)'/.exec(src)?.[1];
    expect(og).toBeDefined();
    expect(og).toMatch(/\.(jpg|jpeg|png)$/);
    expect(existsSync(join(process.cwd(), 'public', og!))).toBe(true);
  });

  it('keeps the viewer controls translatable', () => {
    // The lightbox is reached only by opening a piece, so its Close/Previous/
    // Next labels stayed English on a seven-language site without anyone
    // noticing — the i18n test only checks strings that are already in the
    // dictionary, and a hardcoded one never gets there.
    const src = read('components/Lightbox.tsx');
    expect(src).not.toMatch(/aria-label="/);
  });

  it('does not reference the retired orangecat subdomain as canonical', () => {
    expect(read('lib/site.ts')).toContain('https://sinktattoo.com');
    expect(read('lib/site.ts')).not.toContain('orangecat');
  });
});
