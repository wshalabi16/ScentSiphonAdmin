import { NextResponse } from 'next/server';
import { rateLimiter } from './lib/rateLimiter';

export async function middleware(request) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    try {
      // Get IP address
      const ip = request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip') ||
                 '127.0.0.1';

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
      // If rate limiting fails (e.g., Upstash down), allow request through
      console.error('Rate limiting error:', error);
      return NextResponse.next();
    }
  }

  // Not an API route - allow through
  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: '/api/:path*',
};
