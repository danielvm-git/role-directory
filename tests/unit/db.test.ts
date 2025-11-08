import { describe, it, expect, beforeAll, beforeEach, vi, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Database Module Tests
 * 
 * These tests use Neon's Periodic Table sample data for integration testing.
 * Source: https://neon.com/docs/import/import-sample-data#periodic-table-data
 * 
 * The tests will automatically load the periodic table data if DATABASE_URL is available.
 * If DATABASE_URL is not set, tests will be skipped.
 * 
 * Run tests: npm run test:unit
 */

// Mock console methods to avoid noisy test output
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// DATABASE_URL availability will be checked in beforeAll after dotenv loads

// Helper function to load periodic table sample data
async function ensurePeriodicTableLoaded() {
  // Check DATABASE_URL at runtime (after dotenv loads)
  if (!process.env.DATABASE_URL) {
    return false;
  }

  try {
    const { query } = await import('@/lib/db');
    
    // Check if periodic_table exists
    const tableCheck = await query<{ exists: boolean }>(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'periodic_table')"
    );
    
    if (tableCheck[0].exists) {
      return true; // Already loaded
    }

    // Download and load periodic table data
    console.log('Loading Periodic Table sample data...');
    
    const sqlFile = path.join(process.cwd(), 'periodic_table.sql');
    
    // Download if not exists
    if (!fs.existsSync(sqlFile)) {
      execSync(
        'curl -o periodic_table.sql https://raw.githubusercontent.com/neondatabase/postgres-sample-dbs/main/periodic_table.sql',
        { stdio: 'ignore' }
      );
    }

    // Load data using psql
    const databaseUrl = process.env.DATABASE_URL;
    execSync(`psql "${databaseUrl}" -f periodic_table.sql -q`, { stdio: 'ignore' });
    
    console.log('✅ Periodic Table data loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load periodic table data:', error);
    return false;
  }
}

describe('Database Module', () => {
  let isDataLoaded = false;

  beforeAll(async () => {
    // Check DATABASE_URL at runtime (after dotenv loads in setup.ts)
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    
    // Debug: Check environment variables
    console.log('[DB Tests] DATABASE_URL available:', hasDatabaseUrl);
    console.log('[DB Tests] ALLOWED_EMAILS available:', !!process.env.ALLOWED_EMAILS);
    
    // Try to load periodic table data before running tests
    if (hasDatabaseUrl) {
      console.log('[DB Tests] Attempting to load periodic table data...');
      isDataLoaded = await ensurePeriodicTableLoaded();
      if (!isDataLoaded) {
        console.warn('⚠️  Database tests will be skipped: Failed to load periodic table data');
      } else {
        console.log('✅ Database tests enabled: Periodic table data loaded');
      }
    } else {
      console.log('ℹ️  Database tests skipped: DATABASE_URL not set in .env.local');
      console.log('   To enable these tests, add DATABASE_URL to .env.local');
      console.log('   Tests will automatically load Periodic Table sample data');
    }
  }, 30000); // 30 second timeout for data loading

  beforeEach(() => {
    // Clear console mocks before each test
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    // Verify console mocks are restored
    vi.clearAllMocks();
  });

  describe('query() - Basic Functionality', () => {
    it('should execute simple SELECT query', async () => {
      if (!isDataLoaded) {
        console.log('⏭️  Skipping: periodic table data not loaded');
        return;
      }
      const { query } = await import('@/lib/db');
      
      const result = await query('SELECT 1 as value');
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].value).toBe(1);
    });

    it('should execute query with parameterized values', async () => {
      const { query } = await import('@/lib/db');
      
      const result = await query('SELECT $1 as value', [42]);
      
      expect(result).toBeDefined();
      expect(result[0].value).toBe('42'); // PostgreSQL returns strings by default
    });

    it('should execute query with multiple parameters', async () => {
      const { query } = await import('@/lib/db');
      
      const result = await query(
        'SELECT $1 as num, $2 as str, $3 as bool',
        [123, 'test', true]
      );
      
      expect(result[0].num).toBe('123'); // PostgreSQL returns strings
      expect(result[0].str).toBe('test');
      expect(result[0].bool).toBe('true'); // PostgreSQL returns strings
    });

    it('should return empty array for queries with no results', async () => {
      const { query } = await import('@/lib/db');
      
      const result = await query('SELECT 1 WHERE false');
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return PostgreSQL version', async () => {
      const { query } = await import('@/lib/db');
      
      const result = await query('SELECT version()');
      
      expect(result).toBeDefined();
      expect(result[0].version).toContain('PostgreSQL');
    });
  });

  describe('query() - Type Safety', () => {
    it('should support generic type parameter', async () => {
      const { query } = await import('@/lib/db');
      
      interface TestRow {
        id: number;
        name: string;
      }
      
      const result = await query<TestRow>(
        'SELECT $1 as id, $2 as name',
        [1, 'test']
      );
      
      // TypeScript should infer TestRow[] type
      expect(result[0].id).toBe('1'); // PostgreSQL returns strings
      expect(result[0].name).toBe('test');
    });
  });

  describe('query() - Performance Monitoring', () => {
    it('should log slow queries (>200ms)', async () => {
      const { query } = await import('@/lib/db');
      
      // Execute a slow query using pg_sleep (300ms)
      await query('SELECT pg_sleep(0.3)');
      
      // Verify slow query was logged
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[DB] Slow query detected:',
        expect.objectContaining({
          duration: expect.stringMatching(/\d+ms/),
          query: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it('should NOT log fast queries (<200ms)', async () => {
      const { query } = await import('@/lib/db');
      
      // Execute a fast query
      await query('SELECT 1');
      
      // Verify no slow query warning
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
  });

  describe('query() - Error Handling', () => {
    it('should throw generic error for invalid SQL', async () => {
      const { query } = await import('@/lib/db');
      
      // Expect generic error message (sanitized)
      await expect(query('SELECT FROM invalid')).rejects.toThrow('Database query failed');
      
      // Verify full error details logged server-side
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[DB] Query error:',
        expect.objectContaining({
          query: 'SELECT FROM invalid',
          params: [],
          error: expect.any(String),
          timestamp: expect.any(String),
        })
      );
    });

    it('should log full error details server-side', async () => {
      const { query } = await import('@/lib/db');
      
      try {
        await query('INVALID SQL SYNTAX');
      } catch (error) {
        // Error thrown as expected
      }
      
      // Verify server-side logging includes details
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[DB] Query error:',
        expect.objectContaining({
          query: expect.any(String),
          params: expect.any(Array),
          error: expect.any(String),
          stack: expect.any(String),
        })
      );
    });

    it('should NOT expose database details in error message', async () => {
      const { query } = await import('@/lib/db');
      
      try {
        await query('SELECT * FROM nonexistent_table');
      } catch (error) {
        // Verify error message is generic (sanitized)
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Database query failed');
        
        // Should NOT contain database-specific details
        expect((error as Error).message).not.toContain('table');
        expect((error as Error).message).not.toContain('column');
        expect((error as Error).message).not.toContain('syntax');
      }
    });
  });

  describe('queryOne() - Helper Function', () => {
    it('should return first row when results exist', async () => {
      const { queryOne } = await import('@/lib/db');
      
      const result = await queryOne('SELECT $1 as value', [42]);
      
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result?.value).toBe('42'); // PostgreSQL returns strings
    });

    it('should return null when no results found', async () => {
      const { queryOne } = await import('@/lib/db');
      
      const result = await queryOne('SELECT 1 WHERE false');
      
      expect(result).toBeNull();
    });

    it('should support generic type parameter', async () => {
      const { queryOne } = await import('@/lib/db');
      
      interface User {
        id: number;
        email: string;
      }
      
      const result = await queryOne<User>(
        'SELECT $1 as id, $2 as email',
        [1, 'user@example.com']
      );
      
      expect(result).not.toBeNull();
      expect(result?.id).toBe('1'); // PostgreSQL returns strings
      expect(result?.email).toBe('user@example.com');
    });
  });

  describe('Database Connection - Cold Start Behavior', () => {
    it('should handle Neon auto-resume gracefully', async () => {
      // This test verifies cold start behavior (2-3 second resume)
      // NOTE: Requires Neon database to be suspended (wait 5+ minutes)
      const { query } = await import('@/lib/db');
      
      const start = Date.now();
      const result = await query('SELECT 1');
      const duration = Date.now() - start;
      
      // Verify query completed (may be slow on cold start)
      expect(result).toBeDefined();
      
      // Note: Duration may be 2-3 seconds if database was suspended
      console.log(`Query duration: ${duration}ms`);
    });
  });

  describe('Integration - Configuration + Database', () => {
    it('should use validated DATABASE_URL from config', async () => {
      const { query } = await import('@/lib/db');
      
      // Database module should use getConfig() internally
      // This verifies integration between config and db modules
      const result = await query('SELECT current_database()');
      
      expect(result).toBeDefined();
      expect(result[0].current_database).toBeDefined();
    });
  });
});

/**
 * Manual Testing Instructions
 * ============================
 * 
 * Since these tests are skipped by default (require real database),
 * follow these manual testing steps:
 * 
 * 1. Configuration Validation:
 *    - Remove DATABASE_URL from .env.local
 *    - Run: npm run dev
 *    - Expected: Crash with "Configuration validation failed: databaseUrl: Required"
 * 
 * 2. Invalid DATABASE_URL:
 *    - Set DATABASE_URL=not-a-url in .env.local
 *    - Run: npm run dev
 *    - Expected: Crash with validation error
 * 
 * 3. Invalid ALLOWED_EMAILS:
 *    - Set ALLOWED_EMAILS=not-an-email in .env.local
 *    - Run: npm run dev
 *    - Expected: Crash with email validation error
 * 
 * 4. Valid Configuration:
 *    - Set all required vars correctly in .env.local
 *    - Run: npm run dev
 *    - Expected: Server starts successfully on PORT
 * 
 * 5. Database Connection:
 *    - Create test route: app/api/test-db/route.ts
 *    - Execute: await query('SELECT version()')
 *    - Expected: Returns PostgreSQL version
 * 
 * 6. Parameterized Queries:
 *    - Execute: await query('SELECT $1 as value', [42])
 *    - Expected: Returns [{ value: 42 }]
 * 
 * 7. Slow Query Logging:
 *    - Execute: await query('SELECT pg_sleep(0.3)')
 *    - Check server console
 *    - Expected: [DB] Slow query warning in logs
 * 
 * 8. Error Handling:
 *    - Execute: await query('SELECT FROM invalid')
 *    - Expected: Generic error "Database query failed"
 *    - Check server logs for full error details
 */
