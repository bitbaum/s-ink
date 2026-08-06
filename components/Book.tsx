import { BRIEF, LINKS, SITE } from '@/lib/site';
import styles from './Book.module.css';

/**
 * The one thing the site is for.
 *
 * No contact form: he takes work through DMs, so a form would be a slower path
 * to the same inbox and one more thing that can silently fail. Destinations are
 * driven entirely by LINKS — while that is empty the section still stands on
 * its own, stating what to send rather than showing a link that goes nowhere.
 */
export function Book() {
  return (
    <section id="book" className={styles.section}>
      <div className={`shell ${styles.inner}`}>
        <div className={`reveal ${styles.headline}`}>
          <span className={`micro ${styles.tag}`}>04 / Book</span>
          <h2 className={styles.title}>
            DM to discuss
            <br />
            <span className={styles.outline}>your piece</span>
          </h2>
          <p className={styles.sub}>No walk-ins. By appointment only.</p>
        </div>

        <div className={styles.side}>
          <ol className={`reveal ${styles.brief}`}>
            <li className={`micro ${styles.briefHead}`}>Send</li>
            {BRIEF.map((item, i) => (
              <li key={item} className={styles.briefItem}>
                <span className={`micro ${styles.n}`}>{String(i + 1).padStart(2, '0')}</span>
                {item}
              </li>
            ))}
          </ol>

          {LINKS.length > 0 ? (
            <ul className={styles.cards}>
              {LINKS.map((d, i) => (
                <li
                  key={d.href}
                  className={`reveal ${styles.cardWrap}`}
                  style={{ '--reveal-delay': `${i * 110}ms` } as React.CSSProperties}
                >
                  <a
                    className={styles.card}
                    href={d.href}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <span className={`micro ${styles.n}`}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className={styles.label}>{d.label}</span>
                    <span className={`micro ${styles.handle}`}>{d.handle}</span>
                    <span className={styles.note}>{d.note}</span>
                    <span className={styles.arrow} aria-hidden="true">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`reveal ${styles.wordmark}`} aria-label={SITE.name}>
              {SITE.name}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
