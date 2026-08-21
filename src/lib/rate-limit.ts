/**
 * Simple in-memory sliding-window rate limiter.
 * For production, swap this with Redis-backed limiting (e.g. @upstash/ratelimit).
 */

type Entry = { timestamps: number[] };

const buckets = new Map<string, Entry>();

/** Clean up old entries periodically (max 1000 buckets). */
function evict() {
  if (buckets.size > 1000) {
    const now = Date.now();
    for (const [key, entry] of buckets) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < 60_000);
      if (entry.timestamps.length === 0) buckets.delete(key);
    }
  }
}

/**
 * Check whether the given key has exceeded `max` requests within `windowMs`.
 * Returns `{ allowed: true }` or `{ allowed: false, retryAfterMs }`.
 */
export function rateLimit(
  key: string,
  max: number,
  windowMs: number,
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const now = Date.now();
  const entry = buckets.get(key) ?? { timestamps: [] };

  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= max) {
    const oldest = entry.timestamps[0]!;
    const retryAfterMs = oldest + windowMs - now;
    buckets.set(key, entry);
    evict();
    return { allowed: false, retryAfterMs: Math.ceil(retryAfterMs) };
  }

  entry.timestamps.push(now);
  buckets.set(key, entry);
  evict();
  return { allowed: true };
}

/**
 * Extract a rate-limit key from a Request (IP + optional extra salt).
 * Falls back to a random value when headers are unavailable.
 */
export function rateLimitKey(request: Request, salt: string): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  return `${salt}:${ip}`;
}
