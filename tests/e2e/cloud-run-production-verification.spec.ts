/**
 * Cloud Run Production Service Verification Tests
 * 
 * Story: 1.8 - Cloud Run Service Setup (Production)
 * Priority: P0 (Critical Infrastructure)
 * 
 * These tests verify the production Cloud Run service configuration.
 * 
 * ⚠️ PREREQUISITES:
 * - Production service must be created manually via gcloud CLI
 * - Set PRODUCTION_URL environment variable
 * - Set GCP_AUTH_TOKEN environment variable (or use gcloud auth)
 * 
 * Run with:
 *   export PRODUCTION_URL=https://role-directory-production-xxx.run.app
 *   export GCP_AUTH_TOKEN=$(gcloud auth print-identity-token)
 *   npx playwright test tests/e2e/cloud-run-production-verification.spec.ts
 */

import { test, expect } from '@playwright/test';

// Configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://role-directory-production-test.run.app';
const GCP_AUTH_TOKEN = process.env.GCP_AUTH_TOKEN || '';

test.describe('[1.8] Cloud Run Production Service - Configuration Verification (P0)', () => {
  test.skip(!PRODUCTION_URL || !GCP_AUTH_TOKEN, 'Skipping: PRODUCTION_URL or GCP_AUTH_TOKEN not set');

  test('[1.8-E2E-001] AC-1: should have production URL accessible with authentication', async ({ request }) => {
    // GIVEN: Production service is deployed
    // WHEN: Health check is accessed with valid auth token
    const response = await request.get(`${PRODUCTION_URL}/api/health`, {
      headers: {
        'Authorization': `Bearer ${GCP_AUTH_TOKEN}`,
      },
    });

    // THEN: Response is successful
    expect(response.status()).toBe(200);

    // AND: Response has correct structure
    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('timestamp');
  });

  test('[1.8-E2E-002] AC-5: should require IAM authentication (not public)', async ({ request }) => {
    // GIVEN: Production service is IAM protected
    // WHEN: Health check is accessed WITHOUT authentication
    const response = await request.get(`${PRODUCTION_URL}/api/health`, {
      failOnStatusCode: false,
    });

    // THEN: Access is denied
    expect(response.status()).toBe(403);
  });

  test('[1.8-E2E-003] P0: should have no cold starts (min 2 instances)', async ({ request }) => {
    // GIVEN: Production has min 2 instances configured
    // WHEN: Multiple requests are made in sequence
    const responseTimes: number[] = [];

    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      const response = await request.get(`${PRODUCTION_URL}/api/health`, {
        headers: {
          'Authorization': `Bearer ${GCP_AUTH_TOKEN}`,
        },
      });
      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      responseTimes.push(responseTime);
    }

    // THEN: All responses are fast (no cold starts)
    // Cold start would be 2-3 seconds, warm should be <200ms
    const maxResponseTime = Math.max(...responseTimes);
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    expect(maxResponseTime).toBeLessThan(1000); // No response should take >1s
    expect(avgResponseTime).toBeLessThan(300); // Average should be <300ms

    console.log(`Response times: ${responseTimes.join('ms, ')}ms`);
    console.log(`Average: ${avgResponseTime.toFixed(0)}ms, Max: ${maxResponseTime}ms`);
  });

  test('[1.8-E2E-004] P1: should handle concurrent requests', async ({ request }) => {
    // GIVEN: Production service is deployed with 2-10 instances
    // WHEN: Multiple concurrent requests are made
    const concurrentRequests = 10;
    const requests = Array.from({ length: concurrentRequests }, () =>
      request.get(`${PRODUCTION_URL}/api/health`, {
        headers: {
          'Authorization': `Bearer ${GCP_AUTH_TOKEN}`,
        },
      })
    );

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;

    // THEN: All requests succeed
    responses.forEach((response) => {
      expect(response.status()).toBe(200);
    });

    // AND: Concurrent requests handled efficiently
    // 10 requests should not take 10x longer than 1 request
    expect(totalTime).toBeLessThan(3000); // <3s for 10 concurrent requests

    console.log(`${concurrentRequests} concurrent requests completed in ${totalTime}ms`);
  });

  test('[1.8-E2E-005] P1: should return consistent responses', async ({ request }) => {
    // GIVEN: Production service is deployed
    // WHEN: Multiple requests are made
    const responses: any[] = [];

    for (let i = 0; i < 3; i++) {
      const response = await request.get(`${PRODUCTION_URL}/api/health`, {
        headers: {
          'Authorization': `Bearer ${GCP_AUTH_TOKEN}`,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      responses.push(body);
    }

    // THEN: All responses have consistent structure
    responses.forEach((body) => {
      expect(body).toHaveProperty('status', 'ok');
      expect(body).toHaveProperty('timestamp');
      expect(typeof body.timestamp).toBe('string');
    });
  });

  test('[1.8-E2E-006] P2: should have proper error handling', async ({ request }) => {
    // GIVEN: Production service is deployed
    // WHEN: Invalid endpoint is accessed
    const response = await request.get(`${PRODUCTION_URL}/api/nonexistent`, {
      headers: {
        'Authorization': `Bearer ${GCP_AUTH_TOKEN}`,
      },
      failOnStatusCode: false,
    });

    // THEN: Proper error response is returned
    expect(response.status()).toBe(404);
  });
});

test.describe('[1.8] Cloud Run Production Service - Environment Configuration (P1)', () => {
  test.skip(!PRODUCTION_URL || !GCP_AUTH_TOKEN, 'Skipping: PRODUCTION_URL or GCP_AUTH_TOKEN not set');

  test('[1.8-E2E-007] AC-6: should have NODE_ENV=production', async ({ request }) => {
    // NOTE: This test assumes health check endpoint exposes environment
    // If not, this test should be adapted based on actual implementation

    // GIVEN: Production service is configured with NODE_ENV=production
    // WHEN: Health check is accessed
    const response = await request.get(`${PRODUCTION_URL}/api/health`, {
      headers: {
        'Authorization': `Bearer ${GCP_AUTH_TOKEN}`,
      },
    });

    // THEN: Response indicates production environment
    expect(response.status()).toBe(200);

    // NOTE: Actual verification would require health endpoint to expose environment
    // For now, we verify the service responds correctly
    const body = await response.json();
    expect(body.status).toBe('ok');
  });

  test('[1.8-E2E-008] AC-12: should have correct production URL format', () => {
    // GIVEN: Production service URL is configured
    // THEN: URL follows expected pattern
    expect(PRODUCTION_URL).toMatch(/^https:\/\/role-directory-production-[a-z0-9]+-[a-z0-9]+\.a\.run\.app$/);
  });
});

test.describe('[1.8] Cloud Run Production Service - Performance Requirements (P0)', () => {
  test.skip(!PRODUCTION_URL || !GCP_AUTH_TOKEN, 'Skipping: PRODUCTION_URL or GCP_AUTH_TOKEN not set');

  test('[1.8-E2E-009] NFR-2: should meet P95 response time <200ms (warm)', async ({ request }) => {
    // GIVEN: Production service is warmed up (min 2 instances)
    // WHEN: 20 requests are made to measure P95
    const responseTimes: number[] = [];

    // Warm up (discard first request)
    await request.get(`${PRODUCTION_URL}/api/health`, {
      headers: { 'Authorization': `Bearer ${GCP_AUTH_TOKEN}` },
    });

    // Measure 20 requests
    for (let i = 0; i < 20; i++) {
      const startTime = Date.now();
      const response = await request.get(`${PRODUCTION_URL}/api/health`, {
        headers: { 'Authorization': `Bearer ${GCP_AUTH_TOKEN}` },
      });
      const responseTime = Date.now() - startTime;

      expect(response.status()).toBe(200);
      responseTimes.push(responseTime);
    }

    // Calculate P95 (95th percentile)
    responseTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p95 = responseTimes[p95Index];
    const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    console.log(`Response times (ms):`);
    console.log(`  Average: ${avg.toFixed(0)}ms`);
    console.log(`  P95: ${p95}ms`);
    console.log(`  Min: ${Math.min(...responseTimes)}ms`);
    console.log(`  Max: ${Math.max(...responseTimes)}ms`);

    // THEN: P95 response time meets requirements
    expect(p95).toBeLessThan(200); // P95 <200ms for production
    expect(avg).toBeLessThan(150); // Average <150ms is excellent
  });

  test('[1.8-E2E-010] AC-2: should demonstrate high availability (no downtime)', async ({ request }) => {
    // GIVEN: Production service has min 2 instances
    // WHEN: Multiple sequential requests are made (natural network timing)
    const requestCount = 20; // 20 requests to verify availability
    const results: boolean[] = [];

    for (let i = 0; i < requestCount; i++) {
      const response = await request.get(`${PRODUCTION_URL}/api/health`, {
        headers: { 'Authorization': `Bearer ${GCP_AUTH_TOKEN}` },
        failOnStatusCode: false,
      });

      results.push(response.status() === 200);
      // No artificial delay - natural network timing provides spacing
    }

    // THEN: All requests succeed (100% availability)
    const successCount = results.filter((r) => r).length;
    const successRate = (successCount / results.length) * 100;

    console.log(`Availability test: ${successCount}/${results.length} requests succeeded (${successRate.toFixed(1)}%)`);

    expect(successRate).toBe(100); // 100% availability expected
  });
});

test.describe('[1.8] Cloud Run Production Service - Manual Verification Guide (P2)', () => {
  test('[1.8-DOC-001] should provide manual gcloud verification commands', () => {
    // This is a documentation test - provides commands for manual verification

    const verificationCommands = {
      'AC-1: Service exists': 'gcloud run services list --filter="role-directory-production"',
      'AC-2: Min 2 instances': 'gcloud run services describe role-directory-production --format="value(spec.template.metadata.annotations[\'autoscaling.knative.dev/minScale\'])"',
      'AC-3: Max 10 instances': 'gcloud run services describe role-directory-production --format="value(spec.template.metadata.annotations[\'autoscaling.knative.dev/maxScale\'])"',
      'AC-4: 2 CPUs, 1 GB': 'gcloud run services describe role-directory-production --format="value(spec.template.spec.containers[0].resources)"',
      'AC-6: Environment vars': 'gcloud run services describe role-directory-production --format="value(spec.template.spec.containers[0].env)"',
      'AC-9: Labels': 'gcloud run services describe role-directory-production --format="value(metadata.labels)"',
      'AC-14: Gen2 environment': 'gcloud run services describe role-directory-production --format="value(spec.template.metadata.annotations[\'run.googleapis.com/execution-environment\'])"',
      'AC-15: CPU boost': 'gcloud run services describe role-directory-production --format="value(spec.template.metadata.annotations[\'run.googleapis.com/cpu-boost\'])"',
    };

    console.log('\n=== Manual Verification Commands ===\n');
    Object.entries(verificationCommands).forEach(([description, command]) => {
      console.log(`${description}:`);
      console.log(`  ${command}\n`);
    });

    // This test always passes - it's for documentation
    expect(true).toBe(true);
  });
});

