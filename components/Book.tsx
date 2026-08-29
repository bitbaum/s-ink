import { BookingForm } from '@/components/BookingForm';
import { ContactActions } from '@/components/ContactActions';
import type { Dictionary, Locale } from '@/lib/i18n';
import { LINKS } from '@/lib/site';
import styles from './Book.module.css';

/**
 * The one thing the site is for.
 *
 * The enquiry is taken here rather than handed to a mail client. Reference
 * images are the substance of a tattoo enquiry and a `mailto:` cannot carry
 * one, so the old button asked people to leave, find their photos, and come
 * back — which most of them did not.
 *
 * There is no numbered "what to send" checklist any more: the form's own
 * fields ask for exactly those things, and a list that repeats the labels
 * beside it is just the same instruction given twice.
 */
export function Book({ t, locale }: { t: Dictionary; locale: Locale }) {
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
          <div className="reveal">
            <BookingForm t={t} locale={locale} />
          </div>

          {/* Kept as a second route, not a competing one. Some people simply
              prefer their own mail client, and a form that is the only way in
              is a form whose failure is total. */}
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
                    <span className={`micro ${styles.n}`}>{String(i + 1).padStart(2, '0')}</span>
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
