import { describe, expect, it } from 'vitest';

import { buildMailto, EMAIL } from '@/lib/contact';
import { ENQUIRY_FIELDS, looksAutomated, validateEnquiry } from '@/lib/enquiry';
import { getDictionary, LOCALES } from '@/lib/i18n';
import { pickLocale } from '@/lib/i18n/negotiate';

describe('mailto', () => {
  it.each(LOCALES)('%s produces a usable pre-filled message', (locale) => {
    const href = buildMailto(getDictionary(locale));
    expect(href.startsWith(`mailto:${EMAIL}?`)).toBe(true);
    expect(href).toContain('subject=');
    expect(href).toContain('body=');
    // "+" for space is legal in a query string but several mail clients render
    // it literally in the body, which looks like a broken template.
    expect(href).not.toContain('+');
  });

  it('round-trips the subject and body for the visitor', () => {
    const t = getDictionary('en');
    const query = new URLSearchParams(buildMailto(t).split('?')[1]);
    expect(query.get('subject')).toBe(t.contact.mailSubject);
    expect(query.get('body')).toBe(t.contact.mailBody);
  });

  it('still asks for the three things needed to quote a piece', () => {
    // The form asks structurally; this is the fallback path, where the same
    // three have to survive as prose. If they drift apart, the visitor who
    // picks the email route sends a message he cannot price.
    const t = getDictionary('en');
    for (const cue of ['reference', 'placement', 'size']) {
      expect(t.contact.mailBody.toLowerCase()).toContain(cue);
    }
  });
});

describe('enquiry validation', () => {
  const valid = {
    name: 'Ada',
    email: 'ada@example.com',
    idea: 'Fine line moth, wings open',
    placement: 'Forearm',
    size: '12 cm',
  };

  it('accepts a complete enquiry', () => {
    expect(validateEnquiry(valid, true)).toEqual({});
  });

  it('refuses to send without the age confirmation', () => {
    // Tattooing a minor is the one input here with consequences beyond a bad
    // booking, so it is required on the server and not only in the checkbox.
    expect(validateEnquiry(valid, false)).toEqual({ age: 'required' });
  });

  it.each(ENQUIRY_FIELDS.map((f) => f.id))('requires %s', (id) => {
    expect(validateEnquiry({ ...valid, [id]: '   ' }, true)).toHaveProperty(id, 'required');
  });

  it('rejects an address that is not one', () => {
    expect(validateEnquiry({ ...valid, email: 'ada@example' }, true)).toHaveProperty(
      'email',
      'email',
    );
  });

  it('never treats a fast-running visitor clock as a bot', () => {
    // The first version of the trap sent the render timestamp and let the
    // server subtract it from its own clock. A phone running a few minutes
    // fast then produced a negative elapsed time, which read as "too fast",
    // and the enquiry was silently dropped while the visitor was shown
    // "Sent." — a lost booking that looks exactly like a delivered one.
    // Measured against a real request during the build: a nanosecond-scale
    // value made every submission vanish, including empty ones.
    expect(looksAutomated('', -300_000)).toBe(false);
    expect(looksAutomated('', Number.NaN)).toBe(false);
    // Absent field: Number('') is 0, which must not read as instant.
    expect(looksAutomated('', 12_000)).toBe(false);
  });

  it('still catches the bots the trap is actually for', () => {
    expect(looksAutomated('Acme Ltd', 60_000)).toBe(true);
    expect(looksAutomated('', 400)).toBe(true);
  });

  it('bounds every field so a paste cannot become the payload', () => {
    for (const field of ENQUIRY_FIELDS) {
      const over = { ...valid, [field.id]: 'a'.repeat(field.max + 1) };
      expect(validateEnquiry(over, true)).toHaveProperty(field.id, 'tooLong');
    }
  });
});

describe('locale negotiation', () => {
  it('falls back to the default when there is no header', () => {
    expect(pickLocale(null)).toBe('en');
    expect(pickLocale('')).toBe('en');
  });

  it('matches an exact locale', () => {
    expect(pickLocale('de-CH')).toBe('de-CH');
    expect(pickLocale('ko')).toBe('ko');
  });

  it('matches a base language to the variant we ship', () => {
    expect(pickLocale('de')).toBe('de-CH');
    expect(pickLocale('de-DE,de;q=0.9')).toBe('de-CH');
  });

  it('respects quality ordering rather than header order', () => {
    expect(pickLocale('xx;q=1.0,ja;q=0.9,en;q=0.8')).toBe('ja');
    expect(pickLocale('en;q=0.2,fr;q=0.9')).toBe('fr');
  });

  it('ignores languages we do not ship', () => {
    expect(pickLocale('pt-BR,es;q=0.9')).toBe('en');
  });

  it('survives a malformed header instead of throwing', () => {
    expect(() => pickLocale(';;;q=')).not.toThrow();
    expect(pickLocale(';;;q=')).toBe('en');
  });
});
