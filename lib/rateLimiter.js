import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Create rate limiter
// 50 requests per 10 seconds per IP (more reasonable for admin dashboard)
export const rateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(50, '10 s'),
  analytics: true,
  prefix: 'scent-siphon-admin',
});

// Helper function to check rate limit
export async function checkRateLimit(request) {
  // Get IP address from request
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             '127.0.0.1';

  const { success, limit, reset, remaining } = await rateLimiter.limit(ip);

  return {
    success,
    limit,
    reset,
    remaining,
  };
}
