'use client';

import { useEffect, useState } from 'react';

import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import type { Dictionary, Locale } from '@/lib/i18n';
import { LINKS, NAV_IDS, SITE } from '@/lib/site';
import styles from './Nav.module.css';

/**
 * Fixed hairline nav.
 *
 * Two behaviours worth the client boundary: it goes opaque once you leave the
 * hero (over pure black the bar is otherwise invisible), and it marks the
 * section you are currently in — the only navigational feedback on a one-page
 * site.
 */
export function Nav({ t, locale }: { t: Dictionary; locale: Locale }) {
  const [stuck, setStuck] = useState(false);
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const io = new IntersectionObserver(
      (entries) => {
        // Pick the entry nearest the top of the viewport rather than the first
        // intersecting one; with tall sections several are on screen at once.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -60% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <header className={styles.nav} data-stuck={stuck}>
      <div className={styles.inner}>
        <a href="#top" className={styles.brand}>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.brandName}>{SITE.name}</span>
          <span className={`micro ${styles.brandRole}`}>{t.role}</span>
        </a>

        <nav aria-label={t.nav.work}>
          <ul className={styles.links}>
            {NAV_IDS.map((id) => (
              <li key={id}>
                {/* `location`, not `page`: this is a one-page site and the nav
                    tracks which SECTION is in view, which is exactly what
                    aria-current="location" means. "page" would claim a
                    navigation that never happens here. */}
                <a
                  href={`#${id}`}
                  className={`micro ${styles.link}`}
                  data-active={active === id}
                  aria-current={active === id ? 'location' : undefined}
                >
                  {t.nav[id]}
                </a>
              </li>
            ))}
            {/* Appears only once a real handle is configured — see lib/site.ts. */}
            {LINKS[0] ? (
              <li>
                <a
                  href={LINKS[0].href}
                  className={`micro ${styles.link} ${styles.external}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {LINKS[0].label}
                </a>
              </li>
            ) : null}
            <li>
              <LocaleSwitcher current={locale} />
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
