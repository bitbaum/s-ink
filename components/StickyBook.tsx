'use client';

import { useEffect, useState } from 'react';

import type { Dictionary } from '@/lib/i18n';
import styles from './StickyBook.module.css';

/**
 * Persistent booking bar for small screens.
 *
 * On a phone the Book section is eight screens of scrolling away, and the whole
 * point of the page is to get a message sent. This keeps the action one thumb
 * press away from anywhere.
 *
 * It appears once past the hero (before that the hero's own button is on
 * screen) and hides again over the Book section, where it would sit on top of
 * the very control it duplicates.
 */
export function StickyBook({ t }: { t: Dictionary }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const book = document.getElementById('book');

    const update = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.9;
      const atBook = book ? book.getBoundingClientRect().top < window.innerHeight * 0.85 : false;
      setShown(pastHero && !atBook);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className={styles.bar} data-shown={shown} aria-hidden={!shown}>
      <a className={styles.button} href="#book" tabIndex={shown ? 0 : -1}>
        {t.hero.cta}
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </a>
    </div>
  );
}
