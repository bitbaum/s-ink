/**
 * Typed access to the portfolio manifest.
 *
 * content/works.json is the SSOT shared with scripts/process-media.py: the
 * script crops and grades from it, the site renders from it. Adding a piece is
 * one entry there plus a re-run of the script — no component changes.
 */
import manifest from '@/content/works.json';

export type Shape = 'portrait' | 'wide' | 'square';

export interface Work {
  id: string;
  title: string;
  placement: string;
  style: string;
  shape: Shape;
  featured: boolean;
  /** Processed exports written by scripts/process-media.py. */
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

export const WORKS: Work[] = manifest.works.map((w) => ({
  id: w.id,
  title: w.title,
  placement: w.placement,
  style: w.style,
  shape: (w.shape ?? 'portrait') as Shape,
  featured: 'featured' in w && Boolean(w.featured),
  src: `/work/${w.id}.webp`,
  thumb: `/work/${w.id}-thumb.webp`,
  alt: `${w.style} tattoo by Sami Sami at S.Ink — ${w.title.toLowerCase()}, ${w.placement.toLowerCase()}`,
}));

export const REELS: Reel[] = manifest.reels.map((r) => ({
  id: r.id,
  title: r.title,
  src: `/work/${r.id}.mp4`,
  poster: `/work/${r.id}-poster.webp`,
}));
