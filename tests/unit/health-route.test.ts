/**
 * Health Check Route Unit Test
 * 
 * Story: 1.6 - Health Check Endpoint
 * Priority: P1 (High)
 * 
 * Tests the health check route handler logic.
 */

import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('[1.6] Health Check Route (P1)', () => {
  it('[1.6-UNIT-001] should return 200 OK with status "ok"', async () => {
    // GIVEN: Health check route is invoked
    const response = await GET();

    // THEN: Response is successful
    expect(response.status).toBe(200);

    // AND: Response has correct structure
    const body = await response.json();
    expect(body).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
    });
  });

  it('[1.6-UNIT-002] should return valid ISO 8601 timestamp', async () => {
    // GIVEN: Health check route is invoked
    const response = await GET();
    const body = await response.json();

    // THEN: Timestamp is valid ISO 8601 format
    const timestamp = new Date(body.timestamp);
    expect(timestamp.toISOString()).toBe(body.timestamp);
    
    // AND: Timestamp is recent (within last second)
    expect(timestamp.getTime()).toBeGreaterThan(Date.now() - 1000);
  });

  it('[1.6-UNIT-003] should be fast (<10ms)', async () => {
    // GIVEN: Health check route is invoked
    const startTime = performance.now();
    await GET();
    const duration = performance.now() - startTime;

    // THEN: Response is very fast (unit test, no network)
    expect(duration).toBeLessThan(10); // <10ms for unit test
  });

  it('[1.6-UNIT-004] should return same structure on multiple calls', async () => {
    // GIVEN: Health check is called multiple times
    const responses = await Promise.all([
      GET(),
      GET(),
      GET(),
    ]);

    // THEN: All responses have consistent structure
    for (const response of responses) {
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('status', 'ok');
      expect(body).toHaveProperty('timestamp');
      expect(typeof body.timestamp).toBe('string');
    }
  });
});

