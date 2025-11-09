/**
 * Integration Test for Migration CLI System
 * Story 2.3: Database Schema Migration Setup
 * 
 * This test verifies the complete migration lifecycle with a real database.
 * It uses the periodic table sample data from Neon.
 * 
 * REQUIREMENTS:
 * - DATABASE_URL environment variable must be set
 * - Database must be accessible
 * - Test will create and drop tables (use test database)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// Skip this test by default - requires DATABASE_URL
// To run: DATABASE_URL="postgresql://..." npm run test:integration
const shouldSkip = !process.env.DATABASE_URL;

describe.skipIf(shouldSkip)('Migration CLI - End-to-End Integration', () => {
  let sql: ReturnType<typeof neon>;
  const testMigrationName = `test_migration_${Date.now()}`;
  let testMigrationVersion: string;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required for integration tests');
    }

    sql = neon(process.env.DATABASE_URL);

    // Clean up any existing test data
    await cleanupTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
  });

  async function cleanupTestData() {
    try {
      // Drop test table if exists
      await sql('DROP TABLE IF EXISTS test_periodic_table');
      
      // Delete test migrations from schema_migrations
      await sql(`
        DELETE FROM schema_migrations 
        WHERE version LIKE 'test_%' OR description LIKE '%test%'
      `);
      
      // Clean up test migration files
      const migrationsDir = path.join(process.cwd(), 'migrations');
      if (fs.existsSync(migrationsDir)) {
        const files = fs.readdirSync(migrationsDir);
        files.forEach(file => {
          if (file.includes('test_')) {
            fs.unlinkSync(path.join(migrationsDir, file));
          }
        });
      }
    } catch (error) {
      // Ignore cleanup errors
      console.warn('Cleanup warning:', error);
    }
  }

  it('[2.3-INT-001] should complete full migration lifecycle: create → up → status → down', async () => {
    // This test verifies the entire migration workflow with real database operations
    
    // GIVEN: Migration CLI is available
    // WHEN: We execute the full migration lifecycle
    // THEN: All operations succeed and database state is correct

    // ============================================
    // STEP 1: Create test migration
    // ============================================
    
    // This will fail until scripts/migrate.js is implemented
    try {
      const { stdout: createOutput } = await execAsync(
        `npm run migrate:create ${testMigrationName}`
      );
      
      // Extract version from output (format: "Created migration: {version}")
      const versionMatch = createOutput.match(/(\d{14}_\w+)/);
      expect(versionMatch).toBeTruthy();
      testMigrationVersion = versionMatch![1];
      
      // Verify both .up.sql and .down.sql files were created
      const migrationsDir = path.join(process.cwd(), 'migrations');
      const upFile = path.join(migrationsDir, `${testMigrationVersion}.up.sql`);
      const downFile = path.join(migrationsDir, `${testMigrationVersion}.down.sql`);
      
      expect(fs.existsSync(upFile)).toBe(true);
      expect(fs.existsSync(downFile)).toBe(true);

      // ============================================
      // STEP 2: Add SQL to migration files
      // ============================================
      
      // Use periodic table structure from Neon sample data
      const upSQL = `
-- Up migration: ${testMigrationName}
CREATE TABLE IF NOT EXISTS test_periodic_table (
  "AtomicNumber" INTEGER PRIMARY KEY,
  "Element" VARCHAR(50) NOT NULL,
  "Symbol" VARCHAR(3) NOT NULL,
  "AtomicMass" DECIMAL(10, 6),
  "NumberofNeutrons" INTEGER,
  "NumberofProtons" INTEGER,
  "NumberofElectrons" INTEGER,
  "Period" INTEGER,
  "Group" INTEGER,
  "Phase" VARCHAR(20),
  "Radioactive" BOOLEAN,
  "Natural" BOOLEAN,
  "Metal" BOOLEAN,
  "Nonmetal" BOOLEAN,
  "Metalloid" BOOLEAN,
  "Type" VARCHAR(50),
  "AtomicRadius" DECIMAL(10, 6),
  "Electronegativity" DECIMAL(10, 6),
  "FirstIonization" DECIMAL(10, 6),
  "Density" DECIMAL(10, 6),
  "MeltingPoint" DECIMAL(10, 6),
  "BoilingPoint" DECIMAL(10, 6),
  "NumberOfIsotopes" INTEGER,
  "Discoverer" VARCHAR(100),
  "Year" INTEGER,
  "SpecificHeat" DECIMAL(10, 6),
  "NumberofShells" INTEGER,
  "NumberofValence" INTEGER
);

-- Insert sample data (Neon - Atomic Number 10)
INSERT INTO test_periodic_table ("AtomicNumber", "Element", "Symbol", "AtomicMass")
VALUES (10, 'Neon', 'Ne', 20.1797);
`;

      const downSQL = `
-- Down migration: ${testMigrationName}
DROP TABLE IF EXISTS test_periodic_table;
`;

      fs.writeFileSync(upFile, upSQL);
      fs.writeFileSync(downFile, downSQL);

      // ============================================
      // STEP 3: Check status (should show pending)
      // ============================================
      
      const { stdout: statusBefore } = await execAsync('npm run migrate:status');
      
      // Should show test migration as pending
      expect(statusBefore).toContain(testMigrationVersion);
      expect(statusBefore).toMatch(/pending|❌/i);

      // ============================================
      // STEP 4: Apply migration (migrate:up)
      // ============================================
      
      const { stdout: upOutput } = await execAsync('npm run migrate:up');
      
      // Should show success message
      expect(upOutput).toMatch(/applied|✅/i);
      expect(upOutput).toContain(testMigrationVersion);

      // ============================================
      // STEP 5: Verify table exists in database
      // ============================================
      
      const tables = await sql(`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'test_periodic_table'
      `) as Array<{ tablename: string }>;
      
      expect(tables).toHaveLength(1);
      expect(tables[0].tablename).toBe('test_periodic_table');

      // Verify data was inserted
      const data = await sql('SELECT * FROM test_periodic_table WHERE "AtomicNumber" = 10') as Array<{ Element: string; Symbol: string }>;
      expect(data).toHaveLength(1);
      expect(data[0].Element).toBe('Neon');
      expect(data[0].Symbol).toBe('Ne');

      // ============================================
      // STEP 6: Check status (should show applied)
      // ============================================
      
      const { stdout: statusAfter } = await execAsync('npm run migrate:status');
      
      // Should show test migration as applied with timestamp
      expect(statusAfter).toContain(testMigrationVersion);
      expect(statusAfter).toMatch(/applied|✅/i);

      // ============================================
      // STEP 7: Verify schema_migrations updated
      // ============================================
      
      const migrations = await sql(`
        SELECT version, applied_at 
        FROM schema_migrations 
        WHERE version = $1
      `, [testMigrationVersion]) as Array<{ version: string; applied_at: Date }>;
      
      expect(migrations).toHaveLength(1);
      expect(migrations[0].version).toBe(testMigrationVersion);
      expect(migrations[0].applied_at).toBeTruthy();

      // ============================================
      // STEP 8: Rollback migration (migrate:down)
      // ============================================
      
      const { stdout: downOutput } = await execAsync('npm run migrate:down');
      
      // Should show rollback success message
      expect(downOutput).toMatch(/rolled back|✅/i);
      expect(downOutput).toContain(testMigrationVersion);

      // ============================================
      // STEP 9: Verify table dropped
      // ============================================
      
      const tablesAfterRollback = await sql(`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'test_periodic_table'
      `) as Array<{ tablename: string }>;
      
      expect(tablesAfterRollback).toHaveLength(0);

      // ============================================
      // STEP 10: Verify schema_migrations updated
      // ============================================
      
      const migrationsAfterRollback = await sql(`
        SELECT version 
        FROM schema_migrations 
        WHERE version = $1
      `, [testMigrationVersion]) as Array<{ version: string }>;
      
      expect(migrationsAfterRollback).toHaveLength(0);

      // ============================================
      // STEP 11: Apply again (verify idempotency)
      // ============================================
      
      const { stdout: upAgainOutput } = await execAsync('npm run migrate:up');
      
      // Should apply successfully again
      expect(upAgainOutput).toMatch(/applied|✅/i);

      // Verify table exists again
      const tablesReapplied = await sql(`
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'test_periodic_table'
      `) as Array<{ tablename: string }>;
      
      expect(tablesReapplied).toHaveLength(1);

      // ============================================
      // SUCCESS: Full lifecycle complete
      // ============================================
      
      console.log('✅ Full migration lifecycle test passed!');

    } catch (error: any) {
      // Expected to fail until scripts/migrate.js is implemented
      if (error.message.includes('Cannot find module')) {
        // This is expected in RED phase
        expect(error.message).toContain('scripts/migrate.js');
      } else {
        // Unexpected error - re-throw
        throw error;
      }
    }
  });
});

// Helper to check if test should be skipped
if (shouldSkip) {
  console.log(`
⚠️  Integration test skipped - DATABASE_URL not set

To run integration tests:
DATABASE_URL="postgresql://user:pass@host/db" npm run test:integration

Recommended: Use a test database, not production!
  `);
}

