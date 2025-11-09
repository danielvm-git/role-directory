/**
 * Integration Tests: Initial Schema Migration (Story 2.4)
 * 
 * **PREREQUISITE:** Run `npm run migrate:up` before running these tests.
 * 
 * Tests the execution of the initial database schema migration for periodic_table.
 * Verifies:
 * - Table structure and columns
 * - Primary key constraints
 * - Data integrity (118 elements loaded)
 * - Migration tracking
 * 
 * These tests verify the RESULT of migration, not the migration process itself.
 * The migration process is tested in migrate.integration.test.ts (Story 2.3).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { neon } from '@neondatabase/serverless';
import type { NeonQueryFunction } from '@neondatabase/serverless';

// Test database configuration
const TEST_DATABASE_URL = process.env.DATABASE_URL || process.env.TEST_DATABASE_URL;

if (!TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL or DATABASE_URL environment variable required for integration tests');
}

let sql: NeonQueryFunction<false, false>;

beforeAll(() => {
  sql = neon(TEST_DATABASE_URL);
});

describe('Initial Schema Migration - Integration Tests', () => {
  describe('Table Structure', () => {
    it('should create periodic_table with correct schema', async () => {
      // GIVEN: Migration has been applied
      // WHEN: Querying table structure
      const result = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'periodic_table'
        ORDER BY ordinal_position
      `;

      // THEN: Table exists with expected columns
      expect(result.length).toBeGreaterThan(0);
      const columnNames = result.map((col) => col.column_name);
      
      // Core columns
      expect(columnNames).toContain('AtomicNumber');
      expect(columnNames).toContain('Element');
      expect(columnNames).toContain('Symbol');
      expect(columnNames).toContain('AtomicMass');
    });

    it('should have AtomicNumber as primary key', async () => {
      // GIVEN: Table exists
      // WHEN: Checking primary key constraint
      const result = await sql`
        SELECT constraint_name, column_name
        FROM information_schema.key_column_usage
        WHERE table_name = 'periodic_table'
          AND constraint_name LIKE '%pkey%'
      `;

      // THEN: Primary key exists on AtomicNumber
      expect(result.length).toBe(1);
      expect(result[0].column_name).toBe('AtomicNumber');
    });

    it('should have all required columns for element properties', async () => {
      // GIVEN: Table exists
      // WHEN: Querying column list
      const result = await sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'periodic_table'
      `;

      const columnNames = result.map((col) => col.column_name);

      // THEN: All essential columns exist
      const requiredColumns = [
        'AtomicNumber',
        'Element',
        'Symbol',
        'AtomicMass',
        'NumberOfProtons',
        'NumberOfElectrons',
        'NumberOfNeutrons',
        'Period',
        'Group',
        'Phase',
        'Density',
        'MeltingPoint',
        'BoilingPoint',
        'Electronegativity',
        'FirstIonization',
        'Type',
      ];

      requiredColumns.forEach((col) => {
        expect(columnNames).toContain(col);
      });
    });
  });

  describe('Data Integrity', () => {
    it('should have exactly 118 elements loaded', async () => {
      // GIVEN: Migration has loaded data
      // WHEN: Counting rows
      const result = await sql`
        SELECT COUNT(*) as element_count
        FROM periodic_table
      `;

      // THEN: All 118 elements are present
      expect(parseInt(result[0].element_count as string)).toBe(118);
    });

    it('should have Hydrogen as element 1', async () => {
      // GIVEN: Data is loaded
      // WHEN: Querying element 1
      const result = await sql`
        SELECT "Element", "Symbol", "AtomicNumber"
        FROM periodic_table
        WHERE "AtomicNumber" = 1
      `;

      // THEN: Hydrogen data is correct
      expect(result.length).toBe(1);
      expect(result[0].Element).toBe('Hydrogen');
      expect(result[0].Symbol).toBe('H');
    });

    it('should have Neon as element 10', async () => {
      // GIVEN: Data is loaded
      // WHEN: Querying element 10
      const result = await sql`
        SELECT "Element", "Symbol", "AtomicNumber"
        FROM periodic_table
        WHERE "AtomicNumber" = 10
      `;

      // THEN: Neon data is correct
      expect(result.length).toBe(1);
      expect(result[0].Element).toBe('Neon');
      expect(result[0].Symbol).toBe('Ne');
    });

    it('should have Oganesson as element 118', async () => {
      // GIVEN: Data is loaded
      // WHEN: Querying element 118
      const result = await sql`
        SELECT "Element", "Symbol", "AtomicNumber"
        FROM periodic_table
        WHERE "AtomicNumber" = 118
      `;

      // THEN: Oganesson data is correct
      expect(result.length).toBe(1);
      expect(result[0].Element).toBe('Oganesson');
      expect(result[0].Symbol).toBe('Og');
    });

    it('should have no duplicate atomic numbers', async () => {
      // GIVEN: Data is loaded
      // WHEN: Checking for duplicates
      const result = await sql`
        SELECT "AtomicNumber", COUNT(*) as count
        FROM periodic_table
        GROUP BY "AtomicNumber"
        HAVING COUNT(*) > 1
      `;

      // THEN: No duplicates exist
      expect(result.length).toBe(0);
    });

    it('should have valid atomic numbers (1-118)', async () => {
      // GIVEN: Data is loaded
      // WHEN: Checking atomic number range
      const result = await sql`
        SELECT MIN("AtomicNumber") as min_num, MAX("AtomicNumber") as max_num
        FROM periodic_table
      `;

      // THEN: Range is correct
      expect(result[0].min_num).toBe(1);
      expect(result[0].max_num).toBe(118);
    });
  });

  describe('Element Classification', () => {
    it('should have metals classified correctly', async () => {
      // GIVEN: Data is loaded
      // WHEN: Querying metals
      const result = await sql`
        SELECT COUNT(*) as metal_count
        FROM periodic_table
        WHERE "Metal" = true
      `;

      // THEN: Multiple metals exist
      expect(parseInt(result[0].metal_count as string)).toBeGreaterThan(0);
    });

    it('should have nonmetals classified correctly', async () => {
      // GIVEN: Data is loaded
      // WHEN: Querying nonmetals
      const result = await sql`
        SELECT COUNT(*) as nonmetal_count
        FROM periodic_table
        WHERE "Nonmetal" = true
      `;

      // THEN: Multiple nonmetals exist
      expect(parseInt(result[0].nonmetal_count as string)).toBeGreaterThan(0);
    });

    it('should have noble gases identified', async () => {
      // GIVEN: Data is loaded
      // WHEN: Querying noble gases
      const result = await sql`
        SELECT "Element", "Symbol", "AtomicNumber"
        FROM periodic_table
        WHERE "Type" = 'Noble Gas'
        ORDER BY "AtomicNumber"
      `;

      // THEN: Noble gases exist (He, Ne, Ar, Kr, Xe, Rn, Og)
      expect(result.length).toBeGreaterThanOrEqual(7);
      
      // Check a few known noble gases
      const symbols = result.map(r => r.Symbol);
      expect(symbols).toContain('He');
      expect(symbols).toContain('Ne');
      expect(symbols).toContain('Ar');
    });
  });

  describe('Physical Properties', () => {
    it('should have phase data (gas, liquid, solid)', async () => {
      // GIVEN: Data is loaded
      // WHEN: Querying distinct phases
      const result = await sql`
        SELECT DISTINCT "Phase"
        FROM periodic_table
        WHERE "Phase" IS NOT NULL
        ORDER BY "Phase"
      `;

      // THEN: Multiple phases exist
      const phases = result.map(r => r.Phase);
      expect(phases.length).toBeGreaterThan(0);
      expect(phases).toContain('gas');
      expect(phases).toContain('solid');
    });

    it('should have density data for most elements', async () => {
      // GIVEN: Data is loaded
      // WHEN: Counting elements with density
      const result = await sql`
        SELECT COUNT(*) as count_with_density
        FROM periodic_table
        WHERE "Density" IS NOT NULL
      `;

      // THEN: Many elements have density data
      expect(parseInt(result[0].count_with_density as string)).toBeGreaterThan(50);
    });
  });

  describe('Migration Tracking', () => {
    it('should record initial_schema migration in schema_migrations table', async () => {
      // GIVEN: Migration has been applied via npm run migrate:up
      // WHEN: Querying schema_migrations table
      const result = await sql`
        SELECT version, applied_at
        FROM schema_migrations
        WHERE version LIKE '%initial_schema%'
      `;

      // THEN: Migration is recorded
      // Note: If this fails, run `npm run migrate:up` first or use the 
      // fix-migration-tracking script if data is loaded but not tracked
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0].version).toContain('initial_schema');
      expect(result[0].applied_at).toBeDefined();
    });

    it('should have schema_migrations and periodic_table tables', async () => {
      // GIVEN: Migration has been applied
      // WHEN: Listing all required tables
      const result = await sql`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
          AND table_name IN ('schema_migrations', 'periodic_table')
        ORDER BY table_name
      `;

      // THEN: Both tables exist
      expect(result.length).toBe(2);
      const tableNames = result.map(r => r.table_name);
      expect(tableNames).toContain('periodic_table');
      expect(tableNames).toContain('schema_migrations');
    });
  });

  describe('Query Performance', () => {
    it('should efficiently query elements by atomic number', async () => {
      // GIVEN: Data is loaded
      // WHEN: Querying by primary key
      const startTime = Date.now();
      const result = await sql`
        SELECT *
        FROM periodic_table
        WHERE "AtomicNumber" = 26
      `;
      const duration = Date.now() - startTime;

      // THEN: Query completes quickly and returns Iron
      expect(duration).toBeLessThan(1000); // Should be much faster, but allow 1s for cold starts
      expect(result[0].Element).toBe('Iron');
      expect(result[0].Symbol).toBe('Fe');
    });

    it('should efficiently query elements by symbol', async () => {
      // GIVEN: Data is loaded
      // WHEN: Querying by symbol
      const result = await sql`
        SELECT "Element", "Symbol", "AtomicNumber"
        FROM periodic_table
        WHERE "Symbol" = 'Au'
      `;

      // THEN: Query returns Gold
      expect(result.length).toBe(1);
      expect(result[0].Element).toBe('Gold');
      expect(result[0].AtomicNumber).toBe(79);
    });
  });
});

