import { NextResponse, type NextRequest } from 'next/server';

import { isLocale } from '@/lib/i18n/locales';
import { pickLocale } from '@/lib/i18n/negotiate';
import { NAV_IDS } from '@/lib/site';

/**
 * Puts every visitor on a real page in their own language.
 *
 * Two jobs. A bare `/` goes to the best-matching language — the original
 * reason this file exists. And a path with no locale on the front (`/book`,
 * `/work`) is sent to that section rather than to a 404: those are the URLs
 * people type from memory and shorten by hand when they pass the site on, and
 * on a one-page site there is always somewhere sensible to put them.
 *
 * A visitor who has picked a language explicitly is never bounced out of it —
 * anything already carrying a valid locale falls straight through.
 */
export function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);

  // Already carrying a language — leave it alone.
  if (isLocale(segments[0] ?? '')) return NextResponse.next();

  const isSection = segments.length === 1 && (NAV_IDS as readonly string[]).includes(segments[0]);
  // Everything else genuinely does not exist, and saying so is the honest
  // answer: bouncing every unknown URL to the front page is a soft 404, which
  // search engines treat as a lie and which leaves a real 404 page unreachable.
  if (segments.length > 0 && !isSection) return NextResponse.next();

  const locale = pickLocale(request.headers.get('accept-language'));
  const url = new URL(`/${locale}`, request.url);
  if (isSection) url.hash = segments[0];
  return NextResponse.redirect(url);
}

export const config = {
  // Everything except Next's own assets and anything with a file extension —
  // which is what keeps the media in public/work and the generated robots.txt,
  // sitemap.xml and icons out of the redirect. `/work` is both a section anchor
  // and the media directory, so extension is the only safe discriminator.
  matcher: '/((?!_next/|.*\\.).*)',
};
