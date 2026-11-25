/**
 * SafeSteps Server-Side In-Memory Rate Limiter
 *
 * NOTE:
 * This in-memory rate limiter is designed for Level 1 single-instance deployments.
 * This is for Level 1 only and a shared store (e.g. Redis, Upstash, or Memcached)
 * is needed on multiple servers or distributed serverless environments to maintain
 * consistent rate limiting state across instances.
 */

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory sliding window store: IP -> RateLimitRecord
const ipStore = new Map<string, RateLimitRecord>();

// Configuration: 15 requests per 60 seconds (1 minute)
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 15;

// Periodically clean up stale entries (every 5 minutes) to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);
      if (record.timestamps.length === 0) {
        ipStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number; // Unix timestamp in ms when oldest request expires
}

/**
 * Extracts client IP safely from request headers with reliable fallback.
 */
export function getClientIp(headers: Headers): string {
  try {
    const xForwardedFor = headers.get("x-forwarded-for");
    if (xForwardedFor) {
      // First IP in comma-separated chain is the client IP
      const firstIp = xForwardedFor.split(",")[0]?.trim();
      if (firstIp) return firstIp;
    }

    const xRealIp = headers.get("x-real-ip");
    if (xRealIp && xRealIp.trim()) {
      return xRealIp.trim();
    }

    const cfConnectingIp = headers.get("cf-connecting-ip");
    if (cfConnectingIp && cfConnectingIp.trim()) {
      return cfConnectingIp.trim();
    }
  } catch {
    // Never crash on header parsing failure
  }

  return "127.0.0.1";
}

/**
 * Checks and records a request for the given IP address using a sliding window.
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  let record = ipStore.get(ip);

  if (!record) {
    record = { timestamps: [] };
    ipStore.set(ip, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS) {
    const oldestTimestamp = record.timestamps[0] || now;
    const resetTime = oldestTimestamp + WINDOW_MS;

    return {
      allowed: false,
      remaining: 0,
      resetTime,
    };
  }

  // Record this request
  record.timestamps.push(now);

  const remaining = MAX_REQUESTS - record.timestamps.length;
  const oldestTimestamp = record.timestamps[0] || now;
  const resetTime = oldestTimestamp + WINDOW_MS;

  return {
    allowed: true,
    remaining,
    resetTime,
  };
}
