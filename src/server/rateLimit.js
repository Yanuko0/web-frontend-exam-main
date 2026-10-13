// A small in-memory, fixed-window rate limiter for the API routes.
// Note: state lives in one server process; with several instances (or
// serverless) each keeps its own counters, which is still a useful brake
// against scraping and accidental request loops.
export const DEFAULT_LIMIT = 120; // requests
export const DEFAULT_WINDOW_MS = 60 * 1000;

export function createRateLimiter({
  limit = DEFAULT_LIMIT,
  windowMs = DEFAULT_WINDOW_MS,
  now = Date.now,
} = {}) {
  const hits = new Map();

  return function check(key) {
    const time = now();
    const entry = hits.get(key);

    if (!entry || time >= entry.resetAt) {
      hits.set(key, { count: 1, resetAt: time + windowMs });
      // Drop expired entries now and then so the map cannot grow without bound.
      if (hits.size > 5000) {
        hits.forEach((value, mapKey) => {
          if (time >= value.resetAt) hits.delete(mapKey);
        });
      }
      return { allowed: true, remaining: limit - 1, retryAfter: 0 };
    }

    entry.count += 1;
    const allowed = entry.count <= limit;
    return {
      allowed,
      remaining: Math.max(0, limit - entry.count),
      retryAfter: allowed ? 0 : Math.ceil((entry.resetAt - time) / 1000),
    };
  };
}

/** Best-effort client address (first hop of x-forwarded-for, else the socket). */
export function clientKey(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return (first ? first.split(',')[0].trim() : req.socket?.remoteAddress) || 'unknown';
}
