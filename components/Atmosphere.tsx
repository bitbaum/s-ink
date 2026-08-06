'use client';

import { useEffect, useRef } from 'react';

import styles from './Atmosphere.module.css';

/**
 * The fixed overlay that sits above everything: film grain, scanlines, and a
 * cursor-tracked glow.
 *
 * It is what keeps a page of pure #050507 from looking like an empty div — the
 * grain gives the black texture, the glow gives it depth. Pointer tracking is
 * written straight to a CSS custom property inside rAF, so the work happens on
 * the compositor and React never re-renders on mouse move.
 */
export function Atmosphere() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Touch has no hover, and reduced-motion users asked for less of exactly this.
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.setProperty('--x', `${e.clientX}px`);
        el.style.setProperty('--y', `${e.clientY}px`);
        el.dataset.active = 'true';
      });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.atmosphere} aria-hidden="true">
      <div ref={ref} className={styles.glow} />
      <div className={styles.scanlines} />
      <div className={styles.grain} />
    </div>
  );
}
