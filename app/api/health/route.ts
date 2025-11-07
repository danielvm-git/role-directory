import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * 
 * Public endpoint that returns application health status.
 * Used by:
 * - GitHub Actions deployment workflow (Story 1.5)
 * - Cloud Run health monitoring
 * - Manual verification and monitoring systems
 * 
 * Response format:
 * - 200 OK: { status: "ok", timestamp: "ISO 8601" }
 * - 500 Error: { status: "error", timestamp: "ISO 8601", database?: "disconnected" }
 * 
 * Performance targets:
 * - Warm request: <100ms
 * - Cold start: <3 seconds
 * 
 * Security: No authentication required (public endpoint)
 */
export async function GET() {
  try {
    // Basic health response
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };

    // Optional: Database check (Epic 2+)
    // Uncomment after Epic 2 when database module exists
    // try {
    //   const { query } = await import('@/lib/db');
    //   await Promise.race([
    //     query('SELECT 1'),
    //     new Promise((_, reject) => 
    //       setTimeout(() => reject(new Error('Database timeout')), 2000)
    //     )
    //   ]);
    //   response.database = 'connected';
    // } catch (dbError) {
    //   console.error('Database health check failed:', dbError);
    //   return NextResponse.json(
    //     {
    //       status: 'error',
    //       timestamp: new Date().toISOString(),
    //       database: 'disconnected'
    //     },
    //     { status: 500 }
    //   );
    // }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // Log error server-side only (do not expose details to client)
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

