'use client';

import { useEffect } from 'react';

/**
 * Drives every `.reveal` on the page from one IntersectionObserver.
 *
 * Mounted once in the layout so that each section can stay a server component:
 * a section only has to carry `className="reveal"`, not a client boundary and a
 * hook of its own.
 */
export function RevealObserver() {
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('.reveal');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((el) => (el.dataset.visible = 'true'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.visible = 'true';
          // One-shot: re-animating on scroll-up is noise, not delight.
          io.unobserve(entry.target);
        }
      },
      // Fire a little before the element's top edge arrives, so the wipe has
      // finished by the time it is properly in view.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
