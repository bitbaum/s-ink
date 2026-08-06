/**
 * The translation contract.
 *
 * Every locale file implements this exactly, so adding a string means adding it
 * here first and letting TypeScript point at the seven files that now fail to
 * compile. That is the whole reason this is a typed object and not JSON: a
 * missing translation is a build error, never a blank space on the page.
 */
export interface Dictionary {
  /** Native name, shown in the language switcher. */
  localeLabel: string;
  role: string;
  tagline: string;
  nav: { work: string; styles: string; studio: string; book: string };
  hero: { cta: string; pieces: string; appointment: string; scroll: string };
  sections: {
    work: { index: string; title: string };
    styles: { index: string; title: string };
    studio: { index: string; title: string };
    book: { index: string };
  };
  ticker: string[];
  /** Four entries, in the same order as STYLE_IDS. */
  styles: { title: string; note: string }[];
  /** Six rows, in the same order as STUDIO_ROWS. */
  studio: { k: string; v: string }[];
  reel: { tag: string; lead: string };
  book: {
    titleA: string;
    titleB: string;
    sub: string;
    send: string;
    brief: string[];
  };
  contact: {
    /** Primary button. */
    cta: string;
    copy: string;
    copied: string;
    /** Pre-filled mail subject and body — see buildMailto in lib/contact.ts. */
    mailSubject: string;
    mailBody: string;
  };
  footer: { backToTop: string };
  /** Vocabulary shared with content/works.json, keyed by its English values. */
  labels: {
    placements: Record<string, string>;
    workStyles: Record<string, string>;
    /** Keyed by work id, so renaming a title never breaks the lookup. */
    workTitles: Record<string, string>;
  };
}
