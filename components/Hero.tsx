import { ScrambleText } from '@/components/ScrambleText';
import { SITE } from '@/lib/site';
import styles from './Hero.module.css';

/**
 * First screen: the wordmark, at the largest size the viewport allows, over the
 * strongest piece in the portfolio.
 *
 * The corner blocks are deliberately instrument-panel — a count, a status, the
 * artist. They fill the frame with information rather than with a paragraph,
 * which is the brief: he is laconic, so the page states facts.
 */
export function Hero({ pieceCount }: { pieceCount: number }) {
  return (
    <section id="top" className={styles.hero}>
      <div className={styles.backdrop} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-processed
            fixed-size WebP; the optimiser would only re-encode an optimal asset. */}
        <img src="/work/owl.webp" alt="" width={1500} height={937} fetchPriority="high" />
      </div>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      <div className={`shell ${styles.inner}`}>
        <p className={`micro ${styles.eyebrow}`}>
          <span className={styles.rule} aria-hidden="true" />
          {SITE.tagline}
        </p>

        <h1 className={styles.name}>
          <span className={styles.line}>
            <ScrambleText text={SITE.markTop} />
          </span>
          <span className={`${styles.line} ${styles.outline}`}>
            <ScrambleText text={SITE.markBottom} delay={240} />
          </span>
        </h1>
      </div>

      <div className={styles.corners} aria-hidden="true">
        <span className={`micro ${styles.tl}`}>{SITE.artist}</span>
        <span className={`micro ${styles.tr}`}>
          {String(pieceCount).padStart(2, '0')} pieces
        </span>
        <span className={`micro ${styles.bl}`}>By appointment / No walk-ins</span>
      </div>

      <a href="#work" className={`micro ${styles.scroll}`}>
        Scroll
        <span className={styles.scrollLine} aria-hidden="true" />
      </a>
    </section>
  );
}
