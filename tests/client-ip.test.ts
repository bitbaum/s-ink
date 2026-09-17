import { describe, expect, it } from 'vitest';

import { clientIp } from '@/lib/client-ip';

const requestWith = (headers: Record<string, string>) => ({ headers: new Headers(headers) });

/**
 * The enquiry throttle is only as good as its key. Caddy APPENDS the real peer
 * address to X-Forwarded-For, so the rightmost hop is the only one we wrote;
 * everything to its left is whatever the sender typed. Keying on the first hop
 * handed a spammer a fresh bucket on every request.
 */
describe('clientIp', () => {
  it('takes the last hop, not the caller-supplied first one', () => {
    expect(clientIp(requestWith({ 'x-forwarded-for': '192.0.2.10, 198.51.100.9' }))).toBe(
      '198.51.100.9',
    );
  });

  it('ignores a spoofed leading value: every variation keys the same bucket', () => {
    const keys = ['1.1.1.1', '2.2.2.2', '3.3.3.3'].map((spoofed) =>
      clientIp(requestWith({ 'x-forwarded-for': `${spoofed}, 198.51.100.9` })),
    );

    expect(new Set(keys)).toEqual(new Set(['198.51.100.9']));
  });

  it('trims whitespace around the trusted hop', () => {
    expect(clientIp(requestWith({ 'x-forwarded-for': '192.0.2.10 ,  198.51.100.9  ' }))).toBe(
      '198.51.100.9',
    );
  });

  it('uses a single hop as-is', () => {
    expect(clientIp(requestWith({ 'x-forwarded-for': '198.51.100.9' }))).toBe('198.51.100.9');
  });

  it('falls back to x-real-ip, then to "unknown"', () => {
    expect(clientIp(requestWith({ 'x-real-ip': '172.16.0.1' }))).toBe('172.16.0.1');
    expect(clientIp(requestWith({}))).toBe('unknown');
  });
});
