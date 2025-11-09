/**
 * Test Configuration Factory
 * 
 * Centralizes environment variable access for test suite.
 * Provides type-safe configuration with validation and clear error messages.
 * 
 * **Why This Exists:**
 * - Eliminates hardcoded environment variable access in tests
 * - Single source of truth for test configuration
 * - Type-safe access to configuration values
 * - Clear error messages when required config is missing
 * 
 * **Usage:**
 * ```typescript
 * // For tests that work with any base URL
 * import { getTestConfig } from '../support/factories/config-factory';
 * const { baseURL } = getTestConfig();
 * 
 * // For tests that require production config
 * import { requireProductionConfig } from '../support/factories/config-factory';
 * const { productionURL, gcpAuthToken } = requireProductionConfig();
 * ```
 */

/**
 * Test Configuration Interface
 */
export interface TestConfig {
  /** Base URL for local/staging tests (default: http://localhost:3000) */
  baseURL: string;
  
  /** Production URL (optional, required for production tests) */
  productionURL?: string;
  
  /** GCP Auth Token (optional, required for production tests) */
  gcpAuthToken?: string;
  
  /** Database URL for integration tests (optional) */
  databaseURL?: string;
  
  /** Test Database URL (optional, alternative to databaseURL) */
  testDatabaseURL?: string;
}

/**
 * Get Test Configuration
 * 
 * Returns test configuration with sensible defaults.
 * Safe to use in any test - missing optional values are undefined.
 * 
 * @returns TestConfig with all configuration values
 * 
 * @example
 * ```typescript
 * const { baseURL } = getTestConfig();
 * const response = await request.get(`${baseURL}/api/health`);
 * ```
 */
export function getTestConfig(): TestConfig {
  return {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    productionURL: process.env.PRODUCTION_URL,
    gcpAuthToken: process.env.GCP_AUTH_TOKEN,
    databaseURL: process.env.DATABASE_URL,
    testDatabaseURL: process.env.TEST_DATABASE_URL,
  };
}

/**
 * Require Production Configuration
 * 
 * Returns production-specific configuration.
 * Throws error if required production values are missing.
 * 
 * @returns Production config with required fields
 * @throws Error if PRODUCTION_URL or GCP_AUTH_TOKEN are not set
 * 
 * @example
 * ```typescript
 * const { productionURL, gcpAuthToken } = requireProductionConfig();
 * const response = await request.get(`${productionURL}/api/health`, {
 *   headers: { 'Authorization': `Bearer ${gcpAuthToken}` }
 * });
 * ```
 */
export function requireProductionConfig(): Required<Pick<TestConfig, 'productionURL' | 'gcpAuthToken'>> {
  const config = getTestConfig();
  
  if (!config.productionURL || !config.gcpAuthToken) {
    throw new Error(
      'Production tests require PRODUCTION_URL and GCP_AUTH_TOKEN environment variables.\n' +
      'Set them before running production verification tests:\n' +
      '  PRODUCTION_URL="https://your-service.run.app"\n' +
      '  GCP_AUTH_TOKEN="your-token-here"\n' +
      'Or skip production tests with: npm run test:e2e -- --grep-invert="Production"'
    );
  }
  
  return {
    productionURL: config.productionURL,
    gcpAuthToken: config.gcpAuthToken,
  };
}

/**
 * Require Database Configuration
 * 
 * Returns database configuration for integration tests.
 * Throws error if neither DATABASE_URL nor TEST_DATABASE_URL are set.
 * 
 * @returns Database URL
 * @throws Error if no database URL is configured
 * 
 * @example
 * ```typescript
 * const databaseURL = requireDatabaseConfig();
 * const sql = neon(databaseURL);
 * ```
 */
export function requireDatabaseConfig(): string {
  const config = getTestConfig();
  
  const dbUrl = config.testDatabaseURL || config.databaseURL;
  
  if (!dbUrl) {
    throw new Error(
      'Integration tests require DATABASE_URL or TEST_DATABASE_URL environment variable.\n' +
      'Set it before running integration tests:\n' +
      '  DATABASE_URL="postgresql://user:pass@host/db"\n' +
      'Or skip integration tests: npm run test:unit'
    );
  }
  
  return dbUrl;
}

/**
 * Validate URL Format
 * 
 * Validates that a URL string has correct format.
 * Useful for additional validation in tests.
 * 
 * @param url - URL string to validate
 * @returns true if valid, false otherwise
 * 
 * @example
 * ```typescript
 * const { baseURL } = getTestConfig();
 * if (!validateURL(baseURL)) {
 *   throw new Error('Invalid BASE_URL format');
 * }
 * ```
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get Environment Name
 * 
 * Returns the current test environment based on configuration.
 * Useful for conditional test logic.
 * 
 * @returns 'local' | 'staging' | 'production'
 */
export function getEnvironment(): 'local' | 'staging' | 'production' {
  const config = getTestConfig();
  
  if (config.productionURL && config.baseURL.includes(config.productionURL)) {
    return 'production';
  }
  
  if (config.baseURL.includes('localhost') || config.baseURL.includes('127.0.0.1')) {
    return 'local';
  }
  
  return 'staging';
}

