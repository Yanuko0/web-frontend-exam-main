import getOnly from './handler';
import { createRateLimiter } from './rateLimit';

const createRes = () => {
  const res = {
    headers: {},
    setHeader: jest.fn((key, value) => { res.headers[key] = value; }),
    status: jest.fn(() => res),
    json: jest.fn(() => res),
  };
  return res;
};

const open = () => createRateLimiter({ limit: 1000 });

describe('getOnly', () => {
  it('rejects non-GET methods', () => {
    const res = createRes();
    getOnly(() => ({}), { limit: open() })({ method: 'POST', query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.headers.Allow).toBe('GET');
  });

  it('passes the first value of repeated query params and disables caching by default', () => {
    const res = createRes();
    const resolve = jest.fn(() => ({ ok: true }));
    getOnly(resolve, { limit: open() })({ method: 'GET', query: { id: ['1', '2'] } }, res);
    expect(resolve).toHaveBeenCalledWith({ id: '1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.headers['Cache-Control']).toBe('no-store');
  });

  it('uses the cache policy given by the route', () => {
    const res = createRes();
    getOnly(() => ({}), { cache: 'public, max-age=60', limit: open() })({ method: 'GET', query: {} }, res);
    expect(res.headers['Cache-Control']).toBe('public, max-age=60');
  });

  it('answers 404 when nothing is found', () => {
    const res = createRes();
    getOnly(() => null, { limit: open() })({ method: 'GET', query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('answers 429 with Retry-After when a client sends too many requests', () => {
    const handler = getOnly(() => ({}), { limit: createRateLimiter({ limit: 1 }) });
    handler({ method: 'GET', query: {}, headers: {} }, createRes());
    const res = createRes();
    handler({ method: 'GET', query: {}, headers: {} }, res);
    expect(res.status).toHaveBeenCalledWith(429);
    expect(Number(res.headers['Retry-After'])).toBeGreaterThan(0);
  });

  it('hides internal errors behind a generic 500', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = createRes();
    getOnly(() => { throw new Error('secret database password'); }, { limit: open() })(
      { method: 'GET', query: {} },
      res,
    );
    expect(res.status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(res.json.mock.calls)).not.toMatch(/secret|password|Error:/);
    spy.mockRestore();
  });
});
