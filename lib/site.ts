/**
 * SSOT for the facts that do not change between languages.
 *
 * Anything a visitor reads as a sentence lives in lib/i18n/dictionaries/*
 * instead — if you are about to add an English string here, it belongs there.
 */

export const SITE = {
  /** Studio wordmark. Rendered as two stacked lines in the hero: "S." / "INK". */
  name: 'S.Ink',
  markTop: 'S.',
  markBottom: 'Ink',
  artist: 'Sami Tutar',
  url: 'https://sinktattoo.com',
} as const;

/**
 * Outbound booking destinations.
 *
 * Empty until real handles are confirmed. The Book section iterates this, so a
 * handle added here appears on the page and nowhere else needs touching — and
 * an empty list ships no dead links, which on a booking page is the one thing
 * worse than shipping no links at all.
 */
export const LINKS: { label: string; handle: string; href: string; note: string }[] = [];

/** Section ids — the anchor targets. Labels come from the dictionary. */
export const NAV_IDS = ['work', 'styles', 'studio', 'book'] as const;

export type NavId = (typeof NAV_IDS)[number];
