import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Standardized API error handler wrapper with structured logging
 * Catches all errors and returns consistent error responses
 * Logs all requests for audit trail
 */
export function apiErrorHandler(handler, actionName) {
  return async (request) => {
    const startTime = Date.now();
    let session = null;
    let userEmail = 'unauthenticated';

    try {
      // Get session for logging
      session = await getServerSession(authOptions);
      userEmail = session?.user?.email || 'unauthenticated';
    } catch (sessionError) {
      // Don't fail the request if session fetch fails
      console.error('Failed to fetch session for logging:', sessionError);
    }

    try {
      const result = await handler(request);
      const duration = Date.now() - startTime;

      // Get IP address
      const ip = request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip') ||
                 'unknown';

      // Log successful request
      console.info(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        action: actionName || extractActionFromUrl(request.url),
        method: request.method,
        path: new URL(request.url).pathname,
        userId: userEmail,
        ip: ip,
        duration: `${duration}ms`,
        status: result.status || 200,
      }));

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const ip = request.headers.get('x-forwarded-for') ||
                 request.headers.get('x-real-ip') ||
                 'unknown';

      // Log error with full details
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        action: actionName || extractActionFromUrl(request.url),
        method: request.method,
        path: new URL(request.url).pathname,
        userId: userEmail,
        ip: ip,
        duration: `${duration}ms`,
        errorType: error.name,
        errorMessage: error.message,
        errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      }));

      // Mongoose validation error
      if (error.name === 'ValidationError') {
        return NextResponse.json({
          error: 'Validation failed',
          details: Object.values(error.errors).map(e => e.message)
        }, { status: 400 });
      }

      // Mongoose cast error (invalid ObjectId)
      if (error.name === 'CastError') {
        return NextResponse.json({
          error: 'Invalid ID format'
        }, { status: 400 });
      }

      // Mongoose duplicate key error
      if (error.code === 11000) {
        return NextResponse.json({
          error: 'Duplicate entry',
          details: 'A record with this value already exists'
        }, { status: 409 });
      }

      // Generic error
      return NextResponse.json({
        error: 'Internal server error'
      }, { status: 500 });
    }
  };
}

/**
 * Extract action name from URL path
 */
function extractActionFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split('/').filter(Boolean);
    return parts.join('_').toUpperCase() || 'UNKNOWN';
  } catch {
    return 'UNKNOWN';
  }
}
