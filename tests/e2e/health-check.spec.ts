/**
 * Health Check E2E Test
 * 
 * Story: 1.6 - Health Check Endpoint
 * Priority: P0 (Critical)
 * 
 * Tests the /api/health endpoint for deployment validation.
 */

import { test, expect } from '@playwright/test';
import { getTestConfig } from '../support/factories/config-factory';

test.describe('[1.6] Health Check API (P0)', () => {
  test('[1.6-E2E-001] should return 200 OK with valid response', async ({ request }) => {
    // GIVEN: Health check endpoint exists
    const { baseURL } = getTestConfig();

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

  test('[1.6-E2E-002] should respond quickly (warm)', async ({ request }) => {
    // GIVEN: Health check endpoint exists
    const { baseURL } = getTestConfig();

    // WHEN: Health check is requested
    const startTime = Date.now();
    const response = await request.get(`${baseURL}/api/health`);
    const responseTime = Date.now() - startTime;

    // THEN: Response is fast (<100ms target, <1000ms acceptable)
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(1000); // Acceptable for warm instance
  });
});

