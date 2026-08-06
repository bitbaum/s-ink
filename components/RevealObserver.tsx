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
    const targets = [...document.querySelectorAll<HTMLElement>('.reveal')];
    const pending = new Set(targets);

    const show = (el: HTMLElement) => {
      el.dataset.visible = 'true';
      pending.delete(el);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement);
          // One-shot: re-animating on scroll-up is noise, not delight.
          io.unobserve(entry.target);
        }
      },
      // Fire a little before the element's top edge arrives, so the wipe has
      // finished by the time it is properly in view.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    );

    targets.forEach((el) => io.observe(el));

    // Safety net. IntersectionObserver reports once per animation frame, so an
    // element that enters and leaves between two frames is never reported at
    // all — a fast flick, a hash jump, or browser scroll restoration all do
    // this. Because the reveal is one-shot, a miss is not a late animation: it
    // is content that stays invisible forever, which is exactly how the
    // clip-path bug blanked the page. This sweeps anything the reader has
    // already scrolled to, so a missed frame costs an animation, never content.
    let queued = false;
    const sweep = () => {
      queued = false;
      for (const el of [...pending]) {
        // Same trigger line as the observer's -12% bottom margin.
        if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
          show(el);
          io.unobserve(el);
        }
      }
      if (pending.size === 0) stop();
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(sweep);
    };
    const stop = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      io.disconnect();
      stop();
    };
  }, []);

  return null;
}
