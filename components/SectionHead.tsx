import styles from './SectionHead.module.css';

/**
 * Every section opens the same way: a mono index, a rule across the width, the
 * title, and an optional right-aligned note. One component so the rhythm cannot
 * drift between sections.
 */
export function SectionHead({
  index,
  title,
  note,
}: {
  index: string;
  title: string;
  note?: string;
}) {
  return (
    <div className={`reveal ${styles.head}`}>
      <div className={styles.top}>
        <span className={`micro ${styles.index}`}>{index}</span>
        <span className={styles.rule} aria-hidden="true" />
        {note ? <span className="micro">{note}</span> : null}
      </div>
      <h2 className={styles.title}>{title}</h2>
    </div>
  );
}
