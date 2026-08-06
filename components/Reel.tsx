import type { Dictionary } from '@/lib/i18n';
import { SITE } from '@/lib/site';
import type { Reel as ReelItem } from '@/lib/works';
import styles from './Reel.module.css';

/**
 * Two short clips panning across finished sleeves.
 *
 * Held deliberately small. They are phone video — soft, low-bitrate — and blown
 * up they would undercut the stills next to them; at this size the motion reads
 * as a monitor feed and the softness becomes part of the look. Muted, looping
 * and inline, so nothing ever demands the visitor's attention or their speakers.
 */
export function Reel({ t, reels }: { t: Dictionary; reels: ReelItem[] }) {
  if (reels.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={`shell ${styles.inner}`}>
        <div className={styles.label}>
          <span className={`micro ${styles.tag}`}>{t.reel.tag}</span>
          <p className={styles.lead}>{t.reel.lead}</p>
        </div>

        <ul className={styles.strip}>
          {reels.map((reel, i) => (
            <li
              key={reel.id}
              className={`reveal ${styles.item}`}
              style={{ '--reveal-delay': `${i * 120}ms` } as React.CSSProperties}
            >
              <video
                className={styles.video}
                src={reel.src}
                poster={reel.poster}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label={`${t.reel.tag} — ${SITE.artist}, ${SITE.name}`}
              />
              <span className={`micro ${styles.caption}`}>
                {String(i + 1).padStart(2, '0')} / {reel.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
