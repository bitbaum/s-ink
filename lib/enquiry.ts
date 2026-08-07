/**
 * SSOT for what a booking enquiry is.
 *
 * The form renders from this list and the API validates against it, so adding
 * a field is one entry here plus one label per language — nothing else. The
 * alternative, a form and a validator that each describe the fields in their
 * own words, is how a field ends up required in the browser and optional on
 * the server.
 *
 * The field set is deliberately the smallest one that lets him answer with a
 * price instead of a question. Every extra box costs enquiries, but leaving out
 * placement or size costs a whole round-trip on *every* enquiry — so those two
 * stay, as single-line inputs rather than hopeful hints inside a textarea.
 */

export const ENQUIRY_FIELDS = [
  { id: 'name', kind: 'line', required: true, max: 80, autoComplete: 'name' },
  { id: 'email', kind: 'email', required: true, max: 160, autoComplete: 'email' },
  { id: 'idea', kind: 'text', required: true, max: 2000 },
  { id: 'placement', kind: 'line', required: true, max: 80 },
  { id: 'size', kind: 'line', required: true, max: 60 },
] as const;

export type EnquiryFieldId = (typeof ENQUIRY_FIELDS)[number]['id'];

/** Reference photos. The single most useful thing a visitor can send. */
export const REFERENCES = {
  field: 'references',
  max: 3,
  /** 5 MB each, so three of them still clear Gmail's 25 MB ceiling. */
  maxBytes: 5 * 1024 * 1024,
  /** HEIC is here because that is what an unconverted iPhone photo actually is. */
  accept: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'],
} as const;

/** Trap fields. Never shown to a person — see the API route for how they are read. */
export const TRAPS = {
  /** A hidden input a human never sees and a naive bot always fills. */
  honeypot: 'company',
  /**
   * How long the form was open, measured **entirely in the browser**.
   *
   * The obvious version sends the render timestamp and lets the server compare
   * it against its own clock — which silently discards the enquiry of anyone
   * whose device clock runs fast, because the elapsed time comes out negative
   * and reads as "faster than a human could type". Phone clocks drift by
   * minutes; that failure would look exactly like a successful send to the
   * person it happened to. One clock, one subtraction, no skew.
   */
  elapsed: 'elapsedMs',
  minSeconds: 3,
} as const;

/**
 * How long since `start`, read from one clock.
 *
 * Lives here rather than in the component because React's purity rule forbids
 * impure calls during render and cannot tell an inline submit handler apart
 * from render code. The rule is right in general and this call is genuinely
 * safe — it only runs when someone presses Send — so the honest resolution is
 * to keep the clock read beside the trap logic it belongs to.
 */
export function elapsedSince(start: number): number {
  return Date.now() - start;
}

/**
 * Whether a submission looks automated. Fails *open*: a missing or nonsensical
 * duration is treated as human, because wrongly dropping a booking costs far
 * more than wrongly accepting a spam message someone can delete.
 */
export function looksAutomated(honeypot: string, elapsedMs: number): boolean {
  if (honeypot.trim() !== '') return true;
  return Number.isFinite(elapsedMs) && elapsedMs >= 0 && elapsedMs < TRAPS.minSeconds * 1000;
}

/** Confirms the visitor is old enough to be tattooed. Required everywhere he works. */
export const AGE_FIELD = 'age';

export type EnquiryValues = Record<EnquiryFieldId, string>;

export type EnquiryErrors = Partial<Record<EnquiryFieldId | typeof AGE_FIELD, 'required' | 'tooLong' | 'email'>>;

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * The one validator, run in the browser for feedback and on the server for
 * truth. Returns error *codes*, not sentences — the caller translates them, so
 * this file never has to know which language the visitor is reading.
 */
export function validateEnquiry(values: Partial<EnquiryValues>, ageConfirmed: boolean): EnquiryErrors {
  const errors: EnquiryErrors = {};

  for (const field of ENQUIRY_FIELDS) {
    const value = (values[field.id] ?? '').trim();
    if (!value) {
      if (field.required) errors[field.id] = 'required';
      continue;
    }
    if (value.length > field.max) errors[field.id] = 'tooLong';
    else if (field.kind === 'email' && !EMAIL_SHAPE.test(value)) errors[field.id] = 'email';
  }

  if (!ageConfirmed) errors[AGE_FIELD] = 'required';
  return errors;
}

/** The message he actually reads. Plain text: it is an enquiry, not a newsletter. */
export function formatEnquiry(values: EnquiryValues, locale: string): string {
  return [
    `Name:       ${values.name}`,
    `Email:      ${values.email}`,
    `Placement:  ${values.placement}`,
    `Size:       ${values.size}`,
    `Language:   ${locale}`,
    '',
    values.idea,
  ].join('\n');
}
