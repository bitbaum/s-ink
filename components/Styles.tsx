import { SectionHead } from '@/components/SectionHead';
import type { Dictionary } from '@/lib/i18n';
import styles from './Styles.module.css';

/** What he does, as a numbered index. Four rows, four short lines, no prose. */
export function Styles({ t }: { t: Dictionary }) {
  return (
    <section id="styles" className={`shell ${styles.section}`}>
      <SectionHead index={t.sections.styles.index} title={t.sections.styles.title} />

      <ul className={styles.list}>
        {t.styles.map((item, i) => (
          <li
            key={item.title}
            className={`reveal ${styles.row}`}
            style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}
          >
            <span className={`micro ${styles.n}`}>{String(i + 1).padStart(2, '0')}</span>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.note}>{item.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
