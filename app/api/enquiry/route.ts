import { NextResponse, type NextRequest } from 'next/server';

import {
  AGE_FIELD,
  ENQUIRY_FIELDS,
  formatEnquiry,
  looksAutomated,
  REFERENCES,
  TRAPS,
  validateEnquiry,
  type EnquiryValues,
} from '@/lib/enquiry';
import { mailConfigured, sendEnquiry, type Attachment } from '@/lib/mail';
import { SITE } from '@/lib/site';

/** Reads a multipart body, so it cannot be prerendered. */
export const dynamic = 'force-dynamic';

/**
 * One IP, five enquiries an hour.
 *
 * In memory on purpose: this is a single systemd process, and a Redis for a
 * one-artist portfolio would be more moving parts than the thing it protects.
 * It resets on deploy, which is the correct trade — a restart briefly
 * forgiving a spammer is better than a booking refused because a store was
 * unreachable.
 */
const RATE = { max: 5, windowMs: 60 * 60 * 1000 };
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  // Sweep other IPs while we are here; without this the map is a slow leak.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE.windowMs)) hits.delete(key);
    }
  }
  if (recent.length >= RATE.max) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function clientIp(request: NextRequest): string {
  // Caddy sits in front, so the socket address is always the proxy.
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: NextRequest) {
  if (!mailConfigured()) {
    // Say so plainly rather than accepting a message nothing will carry. The
    // form reveals the address instead, so the enquiry still has a route out.
    return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
  }

  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ ok: false, error: 'rateLimited' }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'badRequest' }, { status: 400 });
  }

  // Silent traps. A bot that filled the hidden field, or completed the form
  // faster than a person could type, gets a 200 and no email: telling it why
  // would only help it try again.
  const automated = looksAutomated(
    String(form.get(TRAPS.honeypot) ?? ''),
    Number(form.get(TRAPS.elapsed)),
  );
  if (automated) return NextResponse.json({ ok: true });

  const values = Object.fromEntries(
    ENQUIRY_FIELDS.map((f) => [f.id, String(form.get(f.id) ?? '')]),
  ) as EnquiryValues;

  // The same validator the browser ran. Client-side checks are a courtesy; this
  // is the one that counts, because anything can POST here.
  const errors = validateEnquiry(values, form.get(AGE_FIELD) === 'on');
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, error: 'invalid', fields: errors }, { status: 400 });
  }

  const attachments: Attachment[] = [];
  for (const file of form.getAll(REFERENCES.field)) {
    if (!(file instanceof File) || file.size === 0) continue;
    if (attachments.length >= REFERENCES.max) break;
    if (file.size > REFERENCES.maxBytes) {
      return NextResponse.json({ ok: false, error: 'fileTooLarge' }, { status: 413 });
    }
    if (!(REFERENCES.accept as readonly string[]).includes(file.type)) {
      return NextResponse.json({ ok: false, error: 'fileType' }, { status: 415 });
    }
    attachments.push({
      filename: file.name || `reference-${attachments.length + 1}`,
      content: Buffer.from(await file.arrayBuffer()).toString('base64'),
    });
  }

  const locale = String(form.get('locale') ?? 'en');
  const result = await sendEnquiry({
    // His own inbox rule can key off this; the name is in it so the subject
    // line alone is enough to triage without opening anything.
    subject: `${SITE.name} enquiry — ${values.name}`,
    text: formatEnquiry(values, locale),
    replyTo: values.email,
    attachments,
  });

  if (!result.ok) {
    // Log the whole enquiry, not just the failure. The send is the only copy in
    // flight, so without this a bad API key silently costs him the booking —
    // journald keeps it until someone can forward it by hand.
    console.error(
      '[enquiry] send failed:',
      result.reason,
      '\n',
      formatEnquiry(values, locale),
    );
    return NextResponse.json({ ok: false, error: 'sendFailed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
