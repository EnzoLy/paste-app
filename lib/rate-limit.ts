/**
 * Simple in-memory rate limiting
 * For production, consider using Redis or a dedicated rate limiting service
 */

const rateLimit = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if a request is rate limited
 * @param identifier - Unique identifier (e.g., IP address or user ID)
 * @param limit - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimit.get(identifier);

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  if (!record || now > record.resetAt) {
    // Create new record or reset expired one
    rateLimit.set(identifier, {
      count: 1,
      resetAt: now + windowMs
    });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, record] of rateLimit.entries()) {
    if (now > record.resetAt) {
      rateLimit.delete(key);
    }
  }
}

/**
 * Get IP address from headers (works with Vercel, Cloudflare, etc.)
 */
export function getClientIdentifier(headers: Headers): string {
  const ip =
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    'unknown';

  return ip;
}
