/**
 * Wait Helpers
 * 
 * Deterministic waiting utilities to replace hard waits (sleep).
 * Knowledge Base: bmad/bmm/testarch/knowledge/timing-debugging.md
 * 
 * NEVER use hard waits like `await page.waitForTimeout(5000)` or `setTimeout()`.
 * Always wait for specific conditions with retry logic.
 */

import { Page, Locator } from '@playwright/test';

/**
 * Wait for a condition to become true with polling
 * 
 * Replaces hard waits (setTimeout) with deterministic condition polling.
 * Retries the condition check at regular intervals until it passes or times out.
 * 
 * @param condition - Async function that returns true when condition is met
 * @param options - Configuration options
 * @returns Promise that resolves when condition is met
 * @throws Error if condition not met within timeout
 * 
 * @example
 * ```typescript
 * // Wait for database table to exist (replaces setTimeout)
 * await waitForCondition(
 *   async () => {
 *     const tables = await sql`SELECT tablename FROM pg_tables WHERE tablename = 'users'`;
 *     return tables.length > 0;
 *   },
 *   { timeout: 5000, interval: 100, errorMessage: 'Table not created' }
 * );
 * ```
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  options: {
    timeout?: number;
    interval?: number;
    errorMessage?: string;
  } = {}
): Promise<void> {
  const { timeout = 5000, interval = 100, errorMessage = 'Condition not met within timeout' } = options;
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return; // Success - condition met
    }
    
    // Wait before next attempt
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  // Timeout reached without condition being met
  throw new Error(`${errorMessage} (waited ${timeout}ms)`);
}

/**
 * Wait for network idle (no requests for specified time)
 * 
 * @param page - Playwright page
 * @param timeout - Max time to wait (ms)
 */
export async function waitForNetworkIdle(
  page: Page,
  timeout: number = 5000
): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for specific API response
 * 
 * @param page - Playwright page
 * @param urlPattern - URL pattern to match
 * @param timeout - Max time to wait (ms)
 */
export async function waitForApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout: number = 30000
): Promise<void> {
  await page.waitForResponse(urlPattern, { timeout });
}

/**
 * Wait for element to be stable (not moving/animating)
 * 
 * @param locator - Playwright locator
 * @param timeout - Max time to wait (ms)
 */
export async function waitForStable(
  locator: Locator,
  timeout: number = 5000
): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout });
  // Wait for animations to complete
  await locator.evaluate((el) => {
    return new Promise<void>((resolve) => {
      const observer = new IntersectionObserver(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
        observer.disconnect();
      });
      observer.observe(el);
    });
  });
}

