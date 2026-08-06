import type { Dictionary } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import styles from './Footer.module.css';

export function Footer({ t, year }: { t: Dictionary; year: number }) {
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.inner}`}>
        <span className="micro">
          © {year} {SITE.name}
        </span>
        <span className="micro">{SITE.artist}</span>
        <a className={`micro ${styles.link}`} href="#top">
          {t.footer.backToTop}
        </a>
      </div>
    </footer>
  );
}
