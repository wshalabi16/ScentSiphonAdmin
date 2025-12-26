import { NextResponse } from 'next/server';
import { rateLimiter } from './lib/rateLimiter';

export async function proxy(request) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    try {
      // Get IP address - take first IP from X-Forwarded-For (actual client)
      const forwarded = request.headers.get('x-forwarded-for');
      const ip = forwarded
        ? forwarded.split(',')[0].trim()  // First IP in chain = actual client
        : request.ip || '127.0.0.1';

      // Check rate limit
      const { success, limit, reset, remaining } = await rateLimiter.limit(ip);

      if (!success) {
        // Rate limit exceeded
        return new NextResponse(
          JSON.stringify({
            error: 'Too many requests. Please try again later.'
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': reset.toString(),
              'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
            },
          }
        );
      }

      // Rate limit OK - add headers and continue
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', reset.toString());

      return response;
    } catch (error) {
      // If rate limiting fails (e.g., Upstash down), deny request for security
      console.error('Rate limiting error:', error);
      return new NextResponse(
        JSON.stringify({
          error: 'Service temporarily unavailable. Please try again later.'
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  }

  // Not an API route - allow through
  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: '/api/:path*',
};
