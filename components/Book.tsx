import { ContactActions } from '@/components/ContactActions';
import type { Dictionary } from '@/lib/i18n';
import { LINKS } from '@/lib/site';
import styles from './Book.module.css';

/**
 * The one thing the site is for.
 *
 * No contact form: he takes work through DMs, so a form would be a slower path
 * to the same inbox and one more thing that can silently fail. Destinations are
 * driven entirely by LINKS — while that is empty the section still stands on
 * its own, stating what to send rather than showing a link that goes nowhere.
 */
export function Book({ t }: { t: Dictionary }) {
  return (
    <section id="book" className={styles.section}>
      <div className={`shell ${styles.inner}`}>
        <div className={`reveal ${styles.headline}`}>
          <span className={`micro ${styles.tag}`}>{t.sections.book.index}</span>
          <h2 className={styles.title}>
            {t.book.titleA}
            <br />
            <span className={styles.outline}>{t.book.titleB}</span>
          </h2>
          <p className={styles.sub}>{t.book.sub}</p>
        </div>

        <div className={styles.side}>
          {/* The checklist sits above the button on purpose: by the time the
              visitor reaches the CTA they know what to put in the message, and
              the pre-filled body then matches what they just read. */}
          <ol className={`reveal ${styles.brief}`}>
            <li className={`micro ${styles.briefHead}`}>{t.book.send}</li>
            {t.book.brief.map((item, i) => (
              <li key={item} className={styles.briefItem}>
                <span className={`micro ${styles.n}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {item}
              </li>
            ))}
          </ol>

          <div className="reveal">
            <ContactActions t={t} />
          </div>

          {/* Secondary destinations — Instagram and the like. Email is the
              booking route, so these sit below it and only appear once real
              handles are configured in lib/site.ts. */}
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
          ) : null}
        </div>
      </div>
    </section>
  );
}
