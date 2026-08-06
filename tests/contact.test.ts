import { describe, expect, it } from 'vitest';

import { buildMailto, EMAIL } from '@/lib/contact';
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

  it('asks for the three things needed to quote a piece', () => {
    const t = getDictionary('en');
    for (const item of t.book.brief) {
      expect(t.contact.mailBody.toLowerCase()).toContain(item.toLowerCase().split(' ')[0]);
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
