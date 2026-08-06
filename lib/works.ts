/**
 * Typed, localised access to the portfolio manifest.
 *
 * content/works.json is the SSOT shared with scripts/process-media.py: the
 * script crops and grades from it, the site renders from it. It stores English
 * vocabulary; the dictionary translates it, so adding a language never means
 * touching the manifest.
 */
import type { Dictionary } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import manifest from '@/content/works.json';

export type Shape = 'portrait' | 'wide' | 'square';

export interface Work {
  id: string;
  title: string;
  placement: string;
  style: string;
  shape: Shape;
  featured: boolean;
  src: string;
  thumb: string;
  alt: string;
}

export interface Reel {
  id: string;
  title: string;
  src: string;
  poster: string;
}

export const PORTRAIT_SRC = `/work/${manifest.portrait.id}.webp`;

export function getWorks(t: Dictionary): Work[] {
  return manifest.works.map((w) => {
    // Fall back to the manifest's English if a dictionary is missing an entry —
    // an untranslated label is a blemish, a blank one is a bug.
    const title = t.labels.workTitles[w.id] ?? w.title;
    const placement = t.labels.placements[w.placement] ?? w.placement;
    const style = t.labels.workStyles[w.style] ?? w.style;
    return {
      id: w.id,
      title,
      placement,
      style,
      shape: (w.shape ?? 'portrait') as Shape,
      featured: 'featured' in w && Boolean(w.featured),
      src: `/work/${w.id}.webp`,
      thumb: `/work/${w.id}-thumb.webp`,
      alt: `${style} — ${title}, ${placement}. ${SITE.artist}, ${SITE.name}`,
    };
  });
}

export function getReels(): Reel[] {
  return manifest.reels.map((r) => ({
    id: r.id,
    title: r.title,
    src: `/work/${r.id}.mp4`,
    poster: `/work/${r.id}-poster.webp`,
  }));
}
