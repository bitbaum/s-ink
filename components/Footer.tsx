import type { Dictionary } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import styles from './Footer.module.css';

/**
 * No year in the copyright line, deliberately.
 *
 * The page is prerendered, so `new Date()` freezes at build time: a portfolio
 * that nobody redeploys for a year would spend that year quietly displaying the
 * wrong one. A notice without a year is equally valid and cannot go stale.
 */
export function Footer({ t }: { t: Dictionary }) {
  return (
    <footer className={styles.footer}>
      <div className={`shell ${styles.inner}`}>
        <span className="micro">© {SITE.name}</span>
        <span className="micro">{SITE.artist}</span>
        <a className={`micro ${styles.link}`} href="#top">
          {t.footer.backToTop}
        </a>
      </div>
    </footer>
  );
}
