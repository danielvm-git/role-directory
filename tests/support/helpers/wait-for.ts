/**
 * Wait Helpers
 * 
 * Deterministic waiting utilities to replace hard waits (sleep).
 * Knowledge Base: bmad/bmm/testarch/knowledge/timing-debugging.md
 * 
 * NEVER use hard waits like `await page.waitForTimeout(5000)`.
 * Always wait for specific conditions.
 */

import { Page, Locator } from '@playwright/test';

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

