import { ScrambleText } from '@/components/ScrambleText';
import { buildMailto } from '@/lib/contact';
import type { Dictionary } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import { PORTRAIT_SRC } from '@/lib/works';
import styles from './Hero.module.css';

/**
 * First screen: the wordmark over Sami at the machine.
 *
 * The corner blocks are deliberately instrument-panel — a count, a status, the
 * artist. They fill the frame with information rather than with a paragraph,
 * which is the brief: he is laconic, so the page states facts.
 */
export function Hero({ t, pieceCount }: { t: Dictionary; pieceCount: number }) {
  return (
    <section id="top" className={styles.hero}>
      <div className={styles.backdrop} aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-processed
            fixed-size WebP; the optimiser would only re-encode an optimal asset. */}
        <img src={PORTRAIT_SRC} alt="" width={1500} height={938} fetchPriority="high" />
      </div>
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      <div className={`shell ${styles.inner}`}>
        <p className={`micro ${styles.eyebrow}`}>
          <span className={styles.rule} aria-hidden="true" />
          {t.tagline}
        </p>

        <h1 className={styles.name}>
          <span className={styles.line}>
            <ScrambleText text={SITE.markTop} />
          </span>
          <span className={`${styles.line} ${styles.outline}`}>
            <ScrambleText text={SITE.markBottom} delay={240} />
          </span>
        </h1>

        {/* The action, on the first screen. Everything below it is evidence for
            the decision this button asks the visitor to make. */}
        <a className={styles.cta} href={buildMailto(t)}>
          {t.hero.cta}
          <span className={styles.ctaArrow} aria-hidden="true">
            →
          </span>
        </a>
      </div>

      <div className={styles.corners} aria-hidden="true">
        <span className={`micro ${styles.tl}`}>{SITE.artist}</span>
        <span className={`micro ${styles.tr}`}>
          {String(pieceCount).padStart(2, '0')} {t.hero.pieces}
        </span>
        <span className={`micro ${styles.bl}`}>{t.hero.appointment}</span>
      </div>

      <a href="#work" className={`micro ${styles.scroll}`}>
        {t.hero.scroll}
        <span className={styles.scrollLine} aria-hidden="true" />
      </a>
    </section>
  );
}
