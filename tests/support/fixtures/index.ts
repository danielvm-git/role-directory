/* eslint-disable react-hooks/rules-of-hooks -- Playwright fixtures use a `use` callback param, not React hooks */
/**
 * Playwright Fixture Architecture
 * 
 * Pattern: Pure function → fixture → mergeTests
 * Knowledge Base: bmad/bmm/testarch/knowledge/fixture-architecture.md
 * 
 * This file extends Playwright's base test with custom fixtures
 * that provide auto-cleanup and reusable test infrastructure.
 */

import { test as base, expect } from '@playwright/test';
import { UserFactory } from './factories/user-factory';

/**
 * Custom Test Fixtures
 * 
 * Add your fixtures here. Each fixture will be automatically set up
 * before each test and cleaned up after.
 */
type TestFixtures = {
  userFactory: UserFactory;
};

/**
 * Extended Test with Custom Fixtures
 * 
 * Import this `test` function instead of @playwright/test's `test`
 * to get access to custom fixtures with auto-cleanup.
 * 
 * Example:
 *   import { test, expect } from '../support/fixtures';
 *   
 *   test('my test', async ({ page, userFactory }) => {
 *     const user = await userFactory.createUser();
 *     // test code...
 *   });
 */
export const test = base.extend<TestFixtures>({
  userFactory: async ({}, useFixture) => {
    const factory = new UserFactory();
    await useFixture(factory);
    await factory.cleanup(); // Auto-cleanup after test
  },
});

// Re-export expect for convenience
export { expect };

