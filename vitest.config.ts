import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { loadEnv } from 'vite';

/**
 * Vitest Configuration for role-directory
 * 
 * Used for: Unit tests, Component tests, API tests
 * Architecture Reference: docs/test-design-epic-1.md
 */

export default defineConfig(({ mode }) => {
  // Load .env.local for testing
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/support/setup.ts'],
      // Make environment variables available in tests
      env,
    // Only run unit tests (exclude E2E tests which use Playwright)
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    exclude: [
      'node_modules/',
      'tests/e2e/**',
      'tests/support/**',
      '.next/',
      'out/',
      '*.config.*',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '.next/',
        'out/',
        '*.config.*',
      ],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});

