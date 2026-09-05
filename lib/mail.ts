import { sendMail, isMailConfigured, fromAddress, conventionalFrom } from '@bitbaum/mail-kit';
import { EMAIL } from '@/lib/contact';

/**
 * Sending an enquiry on. Server-only.
 *
 * The transport is @bitbaum/mail-kit — the fleet's one email layer (itself a
 * single POST to the Resend API, no SDK). Sender comes from `RESEND_FROM`
 * (the fleet's env SSOT), falling back to the fleet-conventional
 * `s-ink@fleetcrown.orangecat.ch` — the one domain verified in the account.
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
  return isMailConfigured();
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
  if (!isMailConfigured()) return { ok: false, reason: 'not-configured' };

  const result = await sendMail(
    {
      from: fromAddress() ?? conventionalFrom('S-ink'),
      to: recipient(),
      replyTo: opts.replyTo,
      subject: opts.subject,
      text: opts.text,
      attachments: opts.attachments,
    },
    // A visitor is watching a spinner; failing fast and showing the address
    // beats holding the page open while an upstream hangs.
    { timeoutMs: 20_000 },
  );

  if (result.sent) {
    // Log the provider's id, never the message. It is the only handle that
    // can answer "he says he never got it" later, and it carries no personal
    // data — the enquiry itself is only ever logged when a send has failed.
    console.info('[enquiry] sent', result.id);
    return { ok: true };
  }
  // mail-kit's error already carries the provider's explanation (unverified
  // sender, size) — without it every failure looks the same in the logs.
  return { ok: false, reason: result.error };
}
