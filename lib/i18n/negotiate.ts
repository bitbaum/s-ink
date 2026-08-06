import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales';

/**
 * Picks the best supported locale for an `Accept-Language` header.
 *
 * Kept out of middleware.ts so it can be tested as the pure function it is —
 * the parsing is fiddly (quality values, base-language fallback) and it is the
 * only thing standing between a visitor and the wrong language.
 */
export function pickLocale(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  // "de-CH,de;q=0.9,en;q=0.8" → tags ordered by descending quality.
  const tags = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      const parsed = q ? Number(q.split('=')[1]) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isFinite(parsed) ? parsed : 0 };
    })
    .filter(({ tag }) => tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    const exact = LOCALES.find((l) => l.toLowerCase() === tag);
    if (exact) return exact;
    // "de-DE" and plain "de" both land on de-CH — the only German we ship.
    const base = tag.split('-')[0];
    const loose = LOCALES.find((l) => l.toLowerCase().split('-')[0] === base);
    if (loose) return loose;
  }
  return DEFAULT_LOCALE;
}
