import deCH from './dictionaries/de-CH';
import en from './dictionaries/en';
import fr from './dictionaries/fr';
import ja from './dictionaries/ja';
import ko from './dictionaries/ko';
import tr from './dictionaries/tr';
import zh from './dictionaries/zh';
import { type Locale } from './locales';
import type { Dictionary } from './types';

/**
 * Statically imported rather than dynamically loaded: seven small objects, and
 * the whole site is prerendered, so there is nothing to defer — a dynamic
 * import would only add a failure mode.
 */
const DICTIONARIES: Record<Locale, Dictionary> = {
  en,
  'de-CH': deCH,
  fr,
  tr,
  zh,
  ja,
  ko,
};

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export type { Dictionary };
export { LOCALES, DEFAULT_LOCALE, HTML_LANG, isLocale } from './locales';
export type { Locale } from './locales';
