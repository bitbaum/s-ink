import { SectionHead } from '@/components/SectionHead';
import { STYLES } from '@/lib/site';
import styles from './Styles.module.css';

/** What he does, as a numbered index. Four rows, four short lines, no prose. */
export function Styles() {
  return (
    <section id="styles" className={`shell ${styles.section}`}>
      <SectionHead index="02 / Styles" title="What he does" />

      <ul className={styles.list}>
        {STYLES.map((item, i) => (
          <li
            key={item.n}
            className={`reveal ${styles.row}`}
            style={{ '--reveal-delay': `${i * 70}ms` } as React.CSSProperties}
          >
            <span className={`micro ${styles.n}`}>{item.n}</span>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.note}>{item.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
