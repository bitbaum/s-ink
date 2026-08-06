import type { Dictionary } from '@/lib/i18n';

/** The one address the site books through. */
export const EMAIL = 'samitutar273@gmail.com';

/**
 * Builds a mailto: with the subject and body already written, in the visitor's
 * language.
 *
 * The difference between a bare address and this is the difference between
 * "I'll email him later" and a message that is two-thirds finished the moment
 * the client opens. It also means the enquiries that arrive already contain the
 * three things he needs to quote — reference, placement, size — instead of
 * "hey, how much for a tattoo".
 */
export function buildMailto(t: Dictionary): string {
  const params = new URLSearchParams({
    subject: t.contact.mailSubject,
    body: t.contact.mailBody,
  });
  // URLSearchParams encodes spaces as "+", which some mail clients render
  // literally in the body. %20 is understood everywhere.
  return `mailto:${EMAIL}?${params.toString().replace(/\+/g, '%20')}`;
}
