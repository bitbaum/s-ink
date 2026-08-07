'use client';

import { useCallback, useState } from 'react';

import { Lightbox } from '@/components/Lightbox';
import { SectionHead } from '@/components/SectionHead';
import type { Dictionary } from '@/lib/i18n';
import type { Work } from '@/lib/works';
import styles from './Gallery.module.css';

/**
 * The portfolio grid.
 *
 * Tiles are buttons, not links: there is no per-piece page to navigate to, and
 * a button is what actually opens the viewer. Each carries HUD corner brackets
 * that draw themselves on hover — the detail that ties the grid to the
 * instrument-panel language of the hero.
 */
export function Gallery({ t, works }: { t: Dictionary; works: Work[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setOpen((i) => (i === null ? i : (i + dir + works.length) % works.length)),
    [works.length],
  );

  return (
    <section id="work" className={`shell ${styles.section}`}>
      <SectionHead
        index={t.sections.work.index}
        title={t.sections.work.title}
        note={`${String(works.length).padStart(2, '0')} ${t.hero.pieces}`}
      />

      <ul className={styles.grid}>
        {works.map((work, i) => (
          <li
            key={work.id}
            className={`reveal ${styles.cell}`}
            data-shape={work.shape}
            // Stagger within a row of three; a longer cascade just feels slow.
            style={{ '--reveal-delay': `${(i % 3) * 90}ms` } as React.CSSProperties}
          >
            <button
              type="button"
              className={styles.tile}
              onClick={() => setOpen(i)}
              aria-label={work.alt}
            >
              <span className={styles.frame}>
                {/* eslint-disable-next-line @next/next/no-img-element -- pre-processed
                    fixed-size WebP; the optimiser would re-encode an optimal asset. */}
                <img
                  src={work.thumb}
                  alt={work.alt}
                  loading={i < 3 ? 'eager' : 'lazy'}
                  decoding="async"
                  className={styles.image}
                />
                <span className={styles.brackets} aria-hidden="true">
                  <i /> <i /> <i /> <i />
                </span>
              </span>

              <span className={styles.meta}>
                <span className={`micro ${styles.index}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={styles.title}>{work.title}</span>
                <span className={`micro ${styles.placement}`}>
                  {work.style} / {work.placement}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open !== null ? (
        <Lightbox t={t} works={works} index={open} onClose={close} onStep={step} />
      ) : null}
    </section>
  );
}
