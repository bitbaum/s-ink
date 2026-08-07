'use client';

import { useEffect, useRef, useState } from 'react';

import { buildMailto, EMAIL } from '@/lib/contact';
import type { Dictionary } from '@/lib/i18n';
import styles from './ContactActions.module.css';

/**
 * The secondary route out: his address, for people who would rather use their
 * own mail client than the form above.
 *
 * It used to be the primary control and carried a large button; the form
 * replaced that. What is left is deliberately quiet — a labelled address, a
 * pre-written draft behind it, and a copy button for the case where `mailto:`
 * does nothing at all (a shared computer, a webmail-only visitor, a phone with
 * no mail client configured).
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
      <div className={styles.row}>
        <span className={`micro ${styles.orEmail}`}>{t.booking.orEmail}</span>
        <a className={`micro ${styles.address}`} href={buildMailto(t)}>
          {EMAIL}
        </a>
        <button type="button" className={`micro ${styles.copy}`} onClick={copy}>
          {copied ? t.contact.copied : t.contact.copy}
        </button>
      </div>
    </div>
  );
}
