'use client';

import { useId, useRef, useState } from 'react';

import { EMAIL } from '@/lib/contact';
import {
  AGE_FIELD,
  elapsedSince,
  ENQUIRY_FIELDS,
  REFERENCES,
  TRAPS,
  validateEnquiry,
  type EnquiryErrors,
  type EnquiryValues,
} from '@/lib/enquiry';
import type { Dictionary, Locale } from '@/lib/i18n';
import styles from './BookingForm.module.css';

/**
 * Booking without leaving the page.
 *
 * A `mailto:` was the previous answer and it loses enquiries three ways: it
 * cannot carry the reference images that *are* the enquiry, it does nothing at
 * all for a visitor with no mail client configured, and it hands the visitor
 * off to another app at the exact moment they had decided to act.
 *
 * Deliberate choices, each one a place these forms usually go wrong:
 *
 * - **Labels above inputs, never placeholders as labels.** A placeholder
 *   disappears the moment you type, so the field you are filling becomes the
 *   field you cannot identify.
 * - **Validate on submit and on blur, never on keystroke.** Telling someone
 *   their email is invalid while they are still typing it is noise.
 * - **The same validator runs on the server.** This one is a courtesy.
 * - **Nothing typed is ever lost.** On failure the fields keep their values and
 *   the address appears, so a bad deploy costs a click, not a booking.
 * - **No CAPTCHA.** It taxes every real visitor to inconvenience a bot. A
 *   hidden field and a minimum fill time catch the drive-by traffic this site
 *   will actually see, and cost a person nothing.
 */
export function BookingForm({ t, locale }: { t: Dictionary; locale: Locale }) {
  const formRef = useRef<HTMLFormElement>(null);
  const uid = useId();
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [files, setFiles] = useState<string[]>([]);
  // Set once on mount. Only ever subtracted from a later reading of the *same*
  // clock — the duration is what crosses the wire, never this value.
  const [startedAt] = useState(() => Date.now());

  const fieldId = (name: string) => `${uid}-${name}`;

  const readValues = (form: HTMLFormElement) => {
    const data = new FormData(form);
    return Object.fromEntries(
      ENQUIRY_FIELDS.map((f) => [f.id, String(data.get(f.id) ?? '')]),
    ) as EnquiryValues;
  };

  const revalidate = () => {
    const form = formRef.current;
    if (!form) return;
    // Only ever *clears* errors while typing. A field that has not been
    // submitted yet has nothing to be wrong about.
    setErrors((prev) => {
      if (Object.keys(prev).length === 0) return prev;
      const data = new FormData(form);
      return validateEnquiry(readValues(form), data.get(AGE_FIELD) === 'on');
    });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const found = validateEnquiry(readValues(form), data.get(AGE_FIELD) === 'on');
    setErrors(found);
    if (Object.keys(found).length > 0) {
      // Move the reader to the problem instead of leaving them to hunt for it.
      const first = Object.keys(found)[0];
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    // Elapsed, not a timestamp: the server must never compare its clock to the
    // visitor's — see TRAPS.elapsed.
    data.set(TRAPS.elapsed, String(elapsedSince(startedAt)));
    data.set('locale', locale);
    setState('sending');

    try {
      const response = await fetch('/api/enquiry', { method: 'POST', body: data });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fields?: EnquiryErrors;
      };
      if (response.ok && body.ok) {
        setState('sent');
        return;
      }
      if (body.fields) setErrors(body.fields);
      setState('failed');
      setFailure(body.error === 'rateLimited' ? t.booking.errors.rateLimited
        : body.error === 'fileTooLarge' || body.error === 'fileType'
          ? t.booking.errors.fileRejected
          : t.booking.errors.failed);
    } catch {
      setState('failed');
      setFailure(t.booking.errors.failed);
    }
  };

  const [failure, setFailure] = useState('');

  if (state === 'sent') {
    return (
      <div className={styles.sent} role="status">
        <p className={styles.sentTitle}>{t.booking.sentTitle}</p>
        <p className={styles.sentBody}>{t.booking.sentBody}</p>
      </div>
    );
  }

  return (
    <form ref={formRef} className={styles.form} onSubmit={onSubmit} noValidate>
      {ENQUIRY_FIELDS.map((field) => {
        const error = errors[field.id];
        const hint = field.id in t.booking.hints
          ? t.booking.hints[field.id as keyof typeof t.booking.hints]
          : undefined;
        const describedBy = [hint && `${fieldId(field.id)}-hint`, error && `${fieldId(field.id)}-err`]
          .filter(Boolean)
          .join(' ');

        return (
          <p key={field.id} className={styles.field} data-wide={field.kind === 'text'}>
            <label className={`micro ${styles.label}`} htmlFor={fieldId(field.id)}>
              {t.booking.fields[field.id]}
            </label>

            {field.kind === 'text' ? (
              <textarea
                id={fieldId(field.id)}
                name={field.id}
                className={styles.input}
                rows={4}
                maxLength={field.max}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy || undefined}
                onBlur={revalidate}
                onChange={revalidate}
              />
            ) : (
              <input
                id={fieldId(field.id)}
                name={field.id}
                className={styles.input}
                // `type="email"` is what gives a phone the @ keyboard.
                type={field.kind === 'email' ? 'email' : 'text'}
                maxLength={field.max}
                autoComplete={'autoComplete' in field ? field.autoComplete : undefined}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy || undefined}
                onBlur={revalidate}
                onChange={revalidate}
              />
            )}

            {hint ? (
              <span id={`${fieldId(field.id)}-hint`} className={`micro ${styles.hint}`}>
                {hint}
              </span>
            ) : null}
            {error ? (
              <span id={`${fieldId(field.id)}-err`} className={`micro ${styles.error}`}>
                {t.booking.errors[error]}
              </span>
            ) : null}
          </p>
        );
      })}

      <p className={styles.field} data-wide="true">
        <label className={`micro ${styles.label}`} htmlFor={fieldId(REFERENCES.field)}>
          {t.booking.references}
        </label>
        <input
          id={fieldId(REFERENCES.field)}
          name={REFERENCES.field}
          className={styles.file}
          type="file"
          multiple
          accept={REFERENCES.accept.join(',')}
          onChange={(e) => setFiles([...(e.target.files ?? [])].slice(0, REFERENCES.max).map((f) => f.name))}
        />
        <span className={`micro ${styles.hint}`}>{t.booking.referencesHint}</span>
        {files.length > 0 ? (
          <span className={`micro ${styles.files}`}>{files.join(' · ')}</span>
        ) : null}
      </p>

      <label className={styles.age} data-invalid={errors[AGE_FIELD] ? true : undefined}>
        <input type="checkbox" name={AGE_FIELD} onChange={revalidate} />
        <span>{t.booking.age}</span>
      </label>

      {/* The trap. Off-screen rather than display:none, because some bots skip
          hidden inputs; aria-hidden and tabIndex keep it away from real users. */}
      <input
        className={styles.trap}
        type="text"
        name={TRAPS.honeypot}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <button type="submit" className={styles.submit} disabled={state === 'sending'}>
        {state === 'sending' ? t.booking.sending : t.booking.submit}
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      </button>

      {state === 'failed' ? (
        <p className={styles.failure} role="alert">
          {failure}{' '}
          <a href={`mailto:${EMAIL}`} className={styles.failureLink}>
            {EMAIL}
          </a>
        </p>
      ) : null}

      <p className={`micro ${styles.privacy}`}>{t.booking.privacy}</p>
    </form>
  );
}
