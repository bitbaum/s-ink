'use client';

import { useEffect, useState } from 'react';

import { LINKS, NAV, SITE } from '@/lib/site';
import styles from './Nav.module.css';

/**
 * Fixed hairline nav.
 *
 * Two behaviours worth the client boundary: it goes opaque once you leave the
 * hero (over pure black the bar is otherwise invisible), and it marks the
 * section you are currently in — the only navigational feedback on a one-page
 * site.
 */
export function Nav() {
  const [stuck, setStuck] = useState(false);
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV.map((n) => document.getElementById(n.id)).filter(
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
          <span className={`micro ${styles.brandRole}`}>{SITE.role}</span>
        </a>

        <nav aria-label="Sections">
          <ul className={styles.links}>
            {NAV.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`micro ${styles.link}`}
                  data-active={active === item.id}
                >
                  {item.label}
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
          </ul>
        </nav>
      </div>
    </header>
  );
}
