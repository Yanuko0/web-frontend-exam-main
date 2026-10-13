import { clientKey, createRateLimiter } from './rateLimit';

const limiter = createRateLimiter();

/**
 * Wraps an API route so that:
 * - only GET is allowed;
 * - each client is rate limited (429 + Retry-After);
 * - unexpected errors answer a generic 500 (no stack traces or internals);
 * - the response carries an explicit Cache-Control (`cache`, default no-store).
 */
export default function getOnly(resolve, { cache = 'no-store', limit = limiter } = {}) {
  return (req, res) => {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const verdict = limit(clientKey(req));
    if (!verdict.allowed) {
      res.setHeader('Retry-After', String(verdict.retryAfter));
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    try {
      const first = (value) => (Array.isArray(value) ? value[0] : value);
      const query = Object.fromEntries(
        Object.entries(req.query).map(([key, value]) => [key, first(value)]),
      );
      const result = resolve(query);
      res.setHeader('Cache-Control', cache);
      if (result === null) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.status(200).json(result);
    } catch (error) {
      // Log on the server only; the client gets nothing about the cause.
      // eslint-disable-next-line no-console
      console.error('API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
