import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for role-directory
 * 
 * Architecture Reference: docs/test-design-epic-1.md
 * Knowledge Base: bmad/bmm/testarch/knowledge/playwright-config.md
 */

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Timeouts (stricter in CI to catch slow tests early)
  timeout: process.env.CI ? 45 * 1000 : 60 * 1000, // Test timeout: 45s in CI, 60s local
  expect: {
    timeout: 15 * 1000, // Assertion timeout: 15s
  },

  // Fail fast: Stop on first failure in CI (saves time and resources)
  maxFailures: process.env.CI ? 1 : undefined,

  // Slow test reporting: Warn if tests are too slow
  reportSlowTests: {
    max: 5, // Report top 5 slowest tests
    threshold: 30 * 1000, // Warn if test takes >30s
  },

  use: {
    // Base URL from environment or default to local dev server
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Failure artifacts (only on failure to reduce storage)
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Action and navigation timeouts
    actionTimeout: 15 * 1000, // 15s
    navigationTimeout: 30 * 1000, // 30s

    // Launch options
    launchOptions: {
      slowMo: process.env.CI ? 0 : 100, // No slowMo in CI for faster execution
    },
  },

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  // Multi-browser testing
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment for multi-browser testing (slower, but more thorough)
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Dev server configuration (optional - runs app before tests)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for Next.js to start
  },
});

