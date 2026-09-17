/**
 * The address the enquiry throttle counts against.
 *
 * Take the LAST `X-Forwarded-For` hop, never the first. Caddy sits in front of
 * this app and APPENDS the real peer address to whatever header arrived, so
 * the rightmost entry is the only one we wrote — every entry to its left is a
 * string the caller typed. Reading `[0]` let a sender vary the leading value
 * on each request, land in a fresh bucket every time, and never be limited:
 * the throttle was decorative.
 *
 * It lives in lib/ rather than beside the route so a test can reach it without
 * adding a non-route export to app/api/enquiry/route.ts.
 */
export function clientIp(request: { headers: { get(name: string): string | null } }): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
