import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';

import { DEFAULT_LOCALE } from '@/lib/i18n/locales';
import { SITE } from '@/lib/site';
import styles from './global-not-found.module.css';
import './globals.css';

/**
 * The 404 for URLs that match no route at all.
 *
 * This exists as `global-not-found` rather than `not-found` because the root
 * layout lives inside `app/[locale]` — an unmatched URL has no locale, so there
 * is no layout to compose a 404 from and Next was falling back to its own
 * unstyled error page: white, system-font, and the only page on the site that
 * did not look like the site.
 *
 * It renders its own document and imports its own styles, because it bypasses
 * the layout entirely. English only: a request that matched nothing carries no
 * locale to translate into, and guessing one to apologise in is not worth a
 * seven-way string.
 */
const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: `404 — ${SITE.name}`,
  description: 'This page does not exist.',
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={display.variable}>
      <body>
        <main className={styles.page}>
          <p className="micro">{SITE.name}</p>
          <p className={styles.code}>404</p>
          <p className={styles.note}>
            Nothing here. The work, and the way to book it, are on the front page.
          </p>
          <a className={styles.home} href={`/${DEFAULT_LOCALE}`}>
            {SITE.name}
            <span aria-hidden="true">→</span>
          </a>
        </main>
      </body>
    </html>
  );
}
