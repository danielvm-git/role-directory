/**
 * Vitest Setup File
 * 
 * Runs before all tests for global configuration
 */

import '@testing-library/jest-dom';
import { config } from 'dotenv';
import path from 'path';

// Load .env.local for testing (enables database tests)
config({ path: path.resolve(process.cwd(), '.env.local') });

// Extend expect matchers
import { expect, beforeEach, afterEach } from 'vitest';

// Global test setup (if needed)
beforeEach(() => {
  // Reset mocks, clear state, etc.
});

afterEach(() => {
  // Cleanup after each test
});

