import { SITE } from '@/lib/site';
import styles from './Footer.module.css';

export function Footer({ year }: { year: number }) {
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.inner}`}>
        <span className="micro">
          © {year} {SITE.name}
        </span>
        <span className="micro">{SITE.artist}</span>
        <a className={`micro ${styles.link}`} href="#top">
          Back to top
        </a>
      </div>
    </footer>
  );
}
