// Best-effort in-memory rate limiter.
//
// Limitation: this state lives in a single Node process's memory. On Vercel
// (and most serverless platforms) each invocation can run in a fresh
// process, so this does NOT provide a hard guarantee in production — it's
// a basic deterrent for a single long-running server (e.g. local dev, or a
// traditional Node host). For real protection in a serverless deployment,
// back this with a shared store such as Upstash Redis / Vercel KV.

const buckets = new Map();
const WINDOW_MS = 60_000;

function cleanup(now) {
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > WINDOW_MS) buckets.delete(key);
  }
}

/**
 * @param {string} key - identifies the caller/action, e.g. `report-submit:${token}`
 * @param {number} limit - max requests allowed per rolling window
 * @returns {boolean} true if the request is allowed, false if it should be rejected
 */
export function checkRateLimit(key, limit = 10) {
  const now = Date.now();
  if (buckets.size > 5000) cleanup(now);

  const entry = buckets.get(key);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    buckets.set(key, { windowStart: now, count: 1 });
    return true;
  }

  entry.count += 1;
  return entry.count <= limit;
}
