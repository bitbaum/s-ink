'use client';

import { useEffect, useRef, useState } from 'react';

import { getDictionary, LOCALES, type Locale } from '@/lib/i18n';
import styles from './LocaleSwitcher.module.css';

/**
 * Language menu.
 *
 * Plain anchors, not a router push: each locale is its own prerendered
 * document, so a normal navigation is both simpler and what a crawler needs to
 * see in order to index the other six.
 *
 * Every option is written in its own language — a Korean visitor should not
 * have to find "Korean" spelled in English.
 */
export function LocaleSwitcher({ current }: { current: Locale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={`micro ${styles.trigger}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {current}
        <span className={styles.caret} aria-hidden="true" />
      </button>

      {open ? (
        <ul className={styles.menu}>
          {LOCALES.map((locale) => (
            <li key={locale}>
              <a
                href={`/${locale}`}
                className={`micro ${styles.option}`}
                data-current={locale === current}
                hrefLang={locale}
              >
                <span className={styles.code}>{locale}</span>
                {getDictionary(locale).localeLabel}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
