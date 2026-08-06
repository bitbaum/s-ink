'use client';

import { useEffect, useRef, useState } from 'react';

import { buildMailto, EMAIL } from '@/lib/contact';
import type { Dictionary } from '@/lib/i18n';
import styles from './ContactActions.module.css';

/**
 * The booking control: one big mail button, and the raw address for anyone who
 * would rather type it themselves.
 *
 * The button opens a message that is already written — subject and a short
 * checklist body, in the visitor's language — because the gap between "I'll
 * email him later" and a half-finished draft is where most enquiries die. The
 * copy button exists for the case a mailto: is useless: a shared computer, a
 * webmail-only visitor, or a phone with no mail client configured.
 */
export function ContactActions({ t }: { t: Dictionary }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is permission-gated and blocked outright in some browsers.
      // The address is on screen next to the button, so failing quietly leaves
      // the visitor no worse off than before they clicked.
    }
  };

  return (
    <div className={styles.actions}>
      <a className={styles.primary} href={buildMailto(t)}>
        <span className={styles.primaryLabel}>{t.contact.cta}</span>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </a>

      <div className={styles.row}>
        <a className={`micro ${styles.address}`} href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
        <button type="button" className={`micro ${styles.copy}`} onClick={copy}>
          {copied ? t.contact.copied : t.contact.copy}
        </button>
      </div>
    </div>
  );
}
