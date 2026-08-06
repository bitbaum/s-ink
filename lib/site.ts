/**
 * SSOT for everything the site says.
 *
 * Copy lives here, not in components. The register is deliberately terse — he
 * is laconic, and the work is meant to carry the page. If a line here reads
 * like marketing, it is wrong.
 */

export const SITE = {
  /** Studio wordmark. Rendered as two stacked lines in the hero: "S." / "INK". */
  name: 'S.Ink',
  markTop: 'S.',
  markBottom: 'Ink',
  artist: 'Sami Sami',
  role: 'Tätowierer',
  tagline: 'Fine line · Blackwork',
  url: 'https://sink.orangecat.ch',
  description:
    'S.Ink — tattoo studio by Sami Sami. Fine-line and blackwork: animals, ornamental, lettering. By appointment.',
} as const;

/**
 * Outbound booking destinations.
 *
 * Empty until real handles are confirmed. The Book section iterates this, so a
 * handle added here appears on the page and nowhere else needs touching — and
 * an empty map ships no dead links, which on a booking page is the one thing
 * worse than shipping no links at all.
 */
export const LINKS: { label: string; handle: string; href: string; note: string }[] = [];

export const NAV = [
  { id: 'work', label: 'Work' },
  { id: 'styles', label: 'Styles' },
  { id: 'studio', label: 'Studio' },
  { id: 'book', label: 'Book' },
] as const;

/** The marquee strip. Short nouns only — it scrolls, nobody reads a sentence. */
export const TICKER = [
  'Blackwork',
  'Fine line',
  'Lettering',
  'Ornamental',
  'Cover-up',
  'Freehand',
] as const;

export const STYLES = [
  { n: '01', title: 'Blackwork', note: 'Solid fill. Hard edges.' },
  { n: '02', title: 'Fine line', note: 'One needle. No filler.' },
  { n: '03', title: 'Lettering', note: 'Script, character, name.' },
  { n: '04', title: 'Ornamental', note: 'Heritage geometry.' },
] as const;

/** Rendered as a spec sheet — key/value rows, no prose. */
export const STUDIO = [
  { k: 'Artist', v: SITE.artist },
  { k: 'Booking', v: 'By appointment' },
  { k: 'Walk-ins', v: 'No' },
  { k: 'Styles', v: 'Blackwork · Fine line' },
  { k: 'Languages', v: 'DE-CH · FR · EN · TR · ZH · JA · KO' },
  { k: 'Contact', v: 'DM' },
] as const;

/** What a first message should contain. Used by the Book section. */
export const BRIEF = ['Reference', 'Placement', 'Rough size'] as const;
