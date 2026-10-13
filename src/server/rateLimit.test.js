import { clientKey, createRateLimiter } from './rateLimit';

describe('createRateLimiter', () => {
  it('allows up to the limit and then blocks with a retry hint', () => {
    let time = 0;
    const check = createRateLimiter({ limit: 3, windowMs: 1000, now: () => time });
    expect(check('a').allowed).toBe(true);
    expect(check('a').allowed).toBe(true);
    expect(check('a')).toMatchObject({ allowed: true, remaining: 0 });
    time = 400;
    expect(check('a')).toMatchObject({ allowed: false, retryAfter: 1 });
  });

  it('counts each client separately', () => {
    const check = createRateLimiter({ limit: 1, windowMs: 1000, now: () => 0 });
    expect(check('a').allowed).toBe(true);
    expect(check('b').allowed).toBe(true);
    expect(check('a').allowed).toBe(false);
  });

  it('starts a fresh window after it expires', () => {
    let time = 0;
    const check = createRateLimiter({ limit: 1, windowMs: 1000, now: () => time });
    check('a');
    expect(check('a').allowed).toBe(false);
    time = 1000;
    expect(check('a').allowed).toBe(true);
  });
});

describe('clientKey', () => {
  it('uses the first x-forwarded-for hop, then the socket address', () => {
    expect(clientKey({ headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' } })).toBe('1.2.3.4');
    expect(clientKey({ headers: {}, socket: { remoteAddress: '::1' } })).toBe('::1');
    expect(clientKey({})).toBe('unknown');
  });
});
