'use client';

import { useEffect, useRef } from 'react';

import type { Work } from '@/lib/works';
import styles from './Lightbox.module.css';

/**
 * Full-bleed viewer for a single piece.
 *
 * Hand-rolled rather than pulled from a package: the whole requirement is one
 * image, two arrows and a caption, and a dependency would arrive with its own
 * theme to fight. Keyboard (←/→/Esc), backdrop click, scroll lock and focus
 * return are all handled here.
 */
export function Lightbox({
  works,
  index,
  onClose,
  onStep,
}: {
  works: Work[];
  index: number;
  onClose: () => void;
  onStep: (dir: 1 | -1) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const work = works[index];

  useEffect(() => {
    // Return focus to whatever opened the viewer once it closes, or the reader
    // is dumped back at the top of the document.
    const opener = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    };
    document.addEventListener('keydown', onKey);

    // Compensate for the vanishing scrollbar so the page behind does not jump.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const { overflow, paddingRight } = document.body.style;
    document.body.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      opener?.focus?.();
    };
  }, [onClose, onStep]);

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`${work.title} — ${work.style}, ${work.placement}`}
      tabIndex={-1}
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.bar}>
        <span className={`micro ${styles.counter}`}>
          {String(index + 1).padStart(2, '0')}
          <span className={styles.slash}>/</span>
          {String(works.length).padStart(2, '0')}
        </span>
        <button type="button" className={`micro ${styles.close}`} onClick={onClose}>
          Close <span aria-hidden="true">✕</span>
        </button>
      </div>

      <figure className={styles.figure}>
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-processed
            fixed-size WebP; the optimiser would re-encode an optimal asset. */}
        <img
          key={work.id}
          src={work.src}
          alt={work.alt}
          className={styles.image}
          decoding="async"
        />
        <figcaption className={styles.caption}>
          <span className={styles.title}>{work.title}</span>
          <span className="micro">
            {work.style} / {work.placement}
          </span>
        </figcaption>
      </figure>

      <button
        type="button"
        className={`${styles.arrow} ${styles.prev}`}
        onClick={() => onStep(-1)}
        aria-label="Previous piece"
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        type="button"
        className={`${styles.arrow} ${styles.next}`}
        onClick={() => onStep(1)}
        aria-label="Next piece"
      >
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
