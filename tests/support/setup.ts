/**
 * Vitest Setup File
 * 
 * Runs before all tests for global configuration
 */

import '@testing-library/jest-dom';

// Extend expect matchers
import { expect, beforeEach, afterEach } from 'vitest';

// Global test setup (if needed)
beforeEach(() => {
  // Reset mocks, clear state, etc.
});

afterEach(() => {
  // Cleanup after each test
});

