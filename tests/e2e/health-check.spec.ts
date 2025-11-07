/**
 * Health Check E2E Test
 * 
 * Story: 1.6 - Health Check Endpoint
 * Priority: P0 (Critical)
 * 
 * Tests the /api/health endpoint for deployment validation.
 */

import { test, expect } from '@playwright/test';

test.describe('Health Check API', () => {
  test('should return 200 OK with valid response', async ({ request }) => {
    // GIVEN: Health check endpoint exists
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';

    // WHEN: Health check is requested
    const response = await request.get(`${baseURL}/api/health`);

    // THEN: Response is successful
    expect(response.status()).toBe(200);

    // AND: Response has correct structure
    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('timestamp');

    // AND: Timestamp is valid ISO 8601 format
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  test('should respond quickly (warm)', async ({ request }) => {
    // GIVEN: Health check endpoint exists
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';

    // WHEN: Health check is requested
    const startTime = Date.now();
    const response = await request.get(`${baseURL}/api/health`);
    const responseTime = Date.now() - startTime;

    // THEN: Response is fast (<100ms target, <1000ms acceptable)
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(1000); // Acceptable for warm instance
  });
});

