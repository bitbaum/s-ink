import { EMAIL } from '@/lib/contact';

/**
 * Sending an enquiry on. Server-only.
 *
 * Resend's REST API over plain `fetch` rather than an SDK: the whole surface
 * used here is one POST, and a dependency for that would be more code to
 * update than to write. `from` must be a domain verified in the Resend
 * account, which is why it is configuration and not a constant.
 *
 * `replyTo` is the point of the whole thing — the mail arrives from the site
 * but replying goes straight to the visitor, so answering is one keypress and
 * the thread lives in his normal inbox rather than in a dashboard he would
 * have to remember to check.
 */

export interface Attachment {
  filename: string;
  content: string; // base64
}

export type SendResult = { ok: true } | { ok: false; reason: string };

/** Absent configuration is a deployment state, not an error — callers degrade. */
export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.BOOKING_FROM);
}

/**
 * Where enquiries land. Defaults to his address; `BOOKING_TO` exists so the
 * send path can be exercised for real without putting test mail in the inbox
 * of the person who has to read it.
 */
function recipient(): string {
  return process.env.BOOKING_TO || EMAIL;
}

export async function sendEnquiry(opts: {
  subject: string;
  text: string;
  replyTo: string;
  attachments: Attachment[];
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM;
  if (!key || !from) return { ok: false, reason: 'not-configured' };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [recipient()],
        reply_to: opts.replyTo,
        subject: opts.subject,
        text: opts.text,
        attachments: opts.attachments,
      }),
      // A visitor is watching a spinner; failing fast and showing the address
      // beats holding the page open while an upstream hangs.
      signal: AbortSignal.timeout(20_000),
    });

    if (response.ok) {
      // Log the provider's id, never the message. It is the only handle that
      // can answer "he says he never got it" later, and it carries no personal
      // data — the enquiry itself is only ever logged when a send has failed.
      const { id } = (await response.json().catch(() => ({}))) as { id?: string };
      console.info('[enquiry] sent', id ?? '(no id)');
      return { ok: true };
    }
    // Read the body: Resend explains refusals (unverified sender, size) here,
    // and without it every failure looks the same in the logs.
    return { ok: false, reason: `${response.status} ${(await response.text()).slice(0, 300)}` };
  } catch (error) {
    return { ok: false, reason: error instanceof Error ? error.message : 'unknown' };
  }
}
