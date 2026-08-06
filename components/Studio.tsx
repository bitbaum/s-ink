import { SectionHead } from '@/components/SectionHead';
import { SITE, STUDIO } from '@/lib/site';
import type { Work } from '@/lib/works';
import styles from './Studio.module.css';

/**
 * The facts, as a spec sheet.
 *
 * Key/value rows rather than an "about" paragraph: everything a visitor
 * actually needs before messaging him is six lines long, and writing it as
 * prose would only pad it out.
 */
export function Studio({ plate }: { plate?: Work }) {
  return (
    <section id="studio" className={`shell ${styles.section}`}>
      <SectionHead index="03 / Studio" title="Details" note={SITE.name} />

      <div className={styles.layout}>
        <dl className={`reveal ${styles.spec}`}>
          {STUDIO.map((row) => (
            <div className={styles.row} key={row.k}>
              <dt className={`micro ${styles.key}`}>{row.k}</dt>
              <dd className={styles.value}>{row.v}</dd>
            </div>
          ))}
        </dl>

        {plate ? (
          <figure className={`reveal ${styles.plate}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- pre-processed
                fixed-size WebP; the optimiser would re-encode an optimal asset. */}
            <img src={plate.thumb} alt={plate.alt} loading="lazy" decoding="async" />
            <figcaption className={`micro ${styles.plateCaption}`}>
              {plate.title} / {plate.placement}
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
