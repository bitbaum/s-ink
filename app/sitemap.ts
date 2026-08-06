import type { MetadataRoute } from 'next';

import { HTML_LANG, LOCALES } from '@/lib/i18n/locales';
import { SITE } from '@/lib/site';

/**
 * One entry per locale, each declaring the others as alternates.
 *
 * Without this the six non-default languages are reachable only through the
 * switcher, which a crawler has no reason to exercise — they would simply never
 * be indexed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    LOCALES.map((l) => [HTML_LANG[l], `${SITE.url}/${l}`]),
  );

  return LOCALES.map((locale) => ({
    url: `${SITE.url}/${locale}`,
    changeFrequency: 'monthly' as const,
    priority: locale === 'en' ? 1 : 0.8,
    alternates: { languages },
  }));
}
