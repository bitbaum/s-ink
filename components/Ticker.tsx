import { TICKER } from '@/lib/site';
import styles from './Ticker.module.css';

/**
 * Infinite marquee of disciplines — the flyer gesture, and the one moment of
 * continuous motion on the page.
 *
 * The list is rendered twice: the track scrolls exactly one copy's width and
 * resets, so the seam never shows. `aria-hidden` on the duplicate keeps screen
 * readers from hearing everything twice.
 */
export function Ticker() {
  return (
    <div className={styles.ticker}>
      <div className={styles.track}>
        {[0, 1].map((copy) => (
          <ul className={styles.list} key={copy} aria-hidden={copy === 1 || undefined}>
            {TICKER.map((word) => (
              <li key={word} className={styles.item}>
                <span className={styles.star} aria-hidden="true">
                  ✳
                </span>
                {word}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
