'use client';

import { useEffect, useRef, useState } from 'react';

// Uppercase letters, digits and slashes only. Block-drawing characters were
// tried first and are wrong here: they render as solid rectangles far taller
// than the surrounding caps, so the wordmark jumps around while it resolves.
const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/\\#*';

/**
 * Resolves text out of a field of noise, one character at a time.
 *
 * The hero name is the only thing on the first screen; a plain fade would be
 * inert. This decodes instead — the machine-readout gesture the rest of the
 * page's mono labels are already implying.
 *
 * The real string is always in the DOM (rendered, then overwritten on mount) so
 * screen readers and crawlers see the name, never the noise.
 */
export function ScrambleText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [display, setDisplay] = useState(text);
  const raf = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Characters lock in left-to-right; each takes FRAMES_PER_CHAR frames to
    // settle, and every unsettled character re-rolls on every frame.
    const FRAMES_PER_CHAR = 3;
    let frame = 0;

    const tick = () => {
      const settled = Math.floor(frame / FRAMES_PER_CHAR);
      setDisplay(
        text
          .split('')
          .map((ch, i) => {
            if (i < settled || ch === ' ') return ch;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(''),
      );
      frame += 1;
      if (settled < text.length) raf.current = requestAnimationFrame(tick);
      else setDisplay(text);
    };

    // Both the initial noise fill and the animation start are deferred into the
    // timer callback. Blanking the text synchronously here would be a cascading
    // render, and the server already rendered the real name — letting it show
    // for a frame before the scramble takes over costs nothing.
    timer.current = setTimeout(() => {
      setDisplay(text.replace(/\S/g, GLYPHS[0]));
      raf.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      cancelAnimationFrame(raf.current);
      clearTimeout(timer.current);
    };
  }, [text, delay]);

  return (
    <>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{text}</span>
    </>
  );
}
