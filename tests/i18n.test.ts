import { describe, expect, it } from 'vitest';

import manifest from '@/content/works.json';
import { ENQUIRY_FIELDS } from '@/lib/enquiry';
import { getDictionary, LOCALES } from '@/lib/i18n';
import en from '@/lib/i18n/dictionaries/en';

/**
 * TypeScript guarantees every dictionary has the right SHAPE. It cannot
 * guarantee the arrays are the right LENGTH, or that the label maps actually
 * cover the vocabulary used in the manifest — a locale with three styles
 * instead of four, or a missing placement, compiles perfectly and renders a
 * gap. These tests cover exactly that blind spot.
 */
describe('dictionaries', () => {
  const dicts = LOCALES.map((l) => [l, getDictionary(l)] as const);

  it.each(dicts)('%s has the same array lengths as English', (_locale, t) => {
    expect(t.styles).toHaveLength(en.styles.length);
    expect(t.studio).toHaveLength(en.studio.length);
    expect(t.ticker.length).toBeGreaterThan(0);
  });

  it.each(dicts)('%s labels every field the enquiry form renders', (_locale, t) => {
    // The form renders straight from ENQUIRY_FIELDS, so a field added there
    // without a label would render a nameless box rather than fail to compile
    // — `Record<EnquiryFieldId, string>` catches a missing key, not an empty one.
    for (const field of ENQUIRY_FIELDS) {
      expect(t.booking.fields[field.id], `missing label: ${field.id}`).toBeTruthy();
    }
    for (const code of [
      'required',
      'email',
      'tooLong',
      'fileRejected',
      'rateLimited',
      'failed',
    ] as const) {
      expect(t.booking.errors[code], `missing error: ${code}`).toBeTruthy();
    }
  });

  it.each(dicts)('%s translates every placement used in the manifest', (_locale, t) => {
    const used = new Set(manifest.works.map((w) => w.placement));
    for (const placement of used) {
      expect(t.labels.placements[placement], `missing placement: ${placement}`).toBeTruthy();
    }
  });

  it.each(dicts)('%s translates every style used in the manifest', (_locale, t) => {
    const used = new Set(manifest.works.map((w) => w.style));
    for (const style of used) {
      expect(t.labels.workStyles[style], `missing style: ${style}`).toBeTruthy();
    }
  });

  it.each(dicts)('%s has a title for every work id', (_locale, t) => {
    for (const work of manifest.works) {
      expect(t.labels.workTitles[work.id], `missing title: ${work.id}`).toBeTruthy();
    }
  });

  it.each(dicts)('%s has no untranslated placeholder text', (_locale, t) => {
    // Catches a dictionary copy-pasted from English and half-edited.
    const flat = JSON.stringify(t);
    expect(flat).not.toMatch(/TODO|FIXME|XXX|Lorem/i);
  });

  it.each(dicts)('%s names itself in its own language', (_locale, t) => {
    expect(t.localeLabel.trim().length).toBeGreaterThan(0);
  });

  it('has a unique label per locale', () => {
    const labels = dicts.map(([, t]) => t.localeLabel);
    expect(new Set(labels).size).toBe(labels.length);
  });
});
