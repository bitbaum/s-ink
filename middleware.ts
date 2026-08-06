import { NextResponse, type NextRequest } from 'next/server';

import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n/locales';

/**
 * Sends a bare `/` to the visitor's best-matching language.
 *
 * Only the root is redirected — every other path already carries its locale, so
 * this never intercepts a normal page view, and a visitor who picks a language
 * explicitly is never bounced back out of it.
 */
export function middleware(request: NextRequest) {
  const preferred = pickLocale(request.headers.get('accept-language'));
  return NextResponse.redirect(new URL(`/${preferred}`, request.url));
}

function pickLocale(header: string | null): string {
  if (!header) return DEFAULT_LOCALE;

  // Parse "de-CH,de;q=0.9,en;q=0.8" into tags ordered by descending quality.
  const tags = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { tag: tag.toLowerCase(), q: q ? Number(q.split('=')[1]) : 1 };
    })
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

export const config = { matcher: '/' };
