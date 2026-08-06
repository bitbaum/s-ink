/** SSOT for which locales exist. Everything else derives from this list. */
export const LOCALES = ['en', 'de-CH', 'fr', 'tr', 'zh', 'ja', 'ko'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** `lang` attribute per locale — not always the same string as the URL segment. */
export const HTML_LANG: Record<Locale, string> = {
  en: 'en',
  'de-CH': 'de-CH',
  fr: 'fr',
  tr: 'tr',
  zh: 'zh-Hans',
  ja: 'ja',
  ko: 'ko',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
