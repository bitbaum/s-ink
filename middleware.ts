import { NextResponse, type NextRequest } from 'next/server';

import { pickLocale } from '@/lib/i18n/negotiate';

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

export const config = { matcher: '/' };
