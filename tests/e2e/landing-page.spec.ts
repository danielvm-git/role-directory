/**
 * Landing Page E2E Test
 * 
 * Story: 1.1 - Project Initialization and Structure
 * Priority: P1 (High)
 * 
 * Tests the basic landing page renders correctly.
 */

import { test, expect } from '../support/fixtures';

test.describe('[1.1] Landing Page (P1)', () => {
  test('[1.1-E2E-001] should display Hello World', async ({ page }) => {
    // GIVEN: User navigates to landing page
    await page.goto('/');

    // THEN: Page title is correct
    await expect(page).toHaveTitle(/role.directory/i);

    // AND: Hello World content is visible
    await expect(page.locator('text=Hello World')).toBeVisible();
  });

  test('[1.1-E2E-002] should load without errors', async ({ page }) => {
    // Track console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // GIVEN: User navigates to landing page
    await page.goto('/');

    // THEN: No console errors are logged
    expect(errors).toEqual([]);
  });

  test('[1.1-E2E-003] should have proper meta tags', async ({ page }) => {
    // GIVEN: User navigates to landing page
    await page.goto('/');

    // THEN: Viewport meta tag exists (responsive design)
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
  });
});

