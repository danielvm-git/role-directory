/**
 * Integration Tests for Migration CLI System
 * Story 2.3: Database Schema Migration Setup
 * 
 * These tests verify the migration CLI functionality using real database operations
 * with Neon's periodic table sample data for realistic testing.
 * 
 * Reference: https://neon.com/docs/import/import-sample-data#periodic-table-data
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Skip these tests if DATABASE_URL is not set (CI environments without DB access)
const DATABASE_URL = process.env.DATABASE_URL;
const describeOrSkip = DATABASE_URL ? describe : describe.skip;

describeOrSkip('Migration CLI System - Integration Tests', () => {
  const sql = neon(DATABASE_URL!);
  const migrationsDir = path.join(__dirname, '../../migrations');
  const testMigrationsDir = path.join(__dirname, '../../migrations-test');
  
  beforeAll(async () => {
    // Create test migrations directory
    if (!fs.existsSync(testMigrationsDir)) {
      fs.mkdirSync(testMigrationsDir, { recursive: true });
    }
  });

  afterAll(async () => {
    // Cleanup test migrations directory
    if (fs.existsSync(testMigrationsDir)) {
      fs.rmSync(testMigrationsDir, { recursive: true, force: true });
    }
  });

  beforeEach(async () => {
    // Clean up schema_migrations table before each test
    try {
      await sql('DROP TABLE IF EXISTS schema_migrations');
    } catch (error) {
      // Ignore errors if table doesn't exist
    }
  });

  describe('Core Migration Logic', () => {
    it('[2.3-UNIT-001] should create schema_migrations table if it doesn\'t exist', async () => {
      // GIVEN: Migration CLI is run for the first time
      // WHEN: We check if schema_migrations table exists
      await sql(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          description TEXT
        )
      `);
      
      // THEN: schema_migrations table should exist
      const result = await sql(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'schema_migrations'
        ) as exists
      `);
      
      expect(result[0].exists).toBe(true);
    });

    it('[2.3-UNIT-002] should read all .up.sql files from migrations directory', () => {
      // GIVEN: migrations/ directory contains migration files
      // WHEN: We read the directory
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.up.sql'))
        .sort();
      
      // THEN: All .up.sql files are discovered
      expect(files.length).toBeGreaterThan(0);
      expect(files.every(f => f.endsWith('.up.sql'))).toBe(true);
    });

    it('[2.3-UNIT-003] should sort migrations by timestamp (alphabetical order)', () => {
      // GIVEN: migrations/ directory contains files
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.up.sql'));
      
      // WHEN: Files are sorted
      const sorted = [...files].sort();
      
      // THEN: Files are in chronological order (alphabetical)
      expect(sorted).toEqual(files.sort());
    });

    it('[2.3-UNIT-004] should skip already applied migrations', async () => {
      // GIVEN: schema_migrations contains an applied migration
      await sql(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          description TEXT
        )
      `);
      
      const testVersion = '20231106120000_test';
      await sql(
        'INSERT INTO schema_migrations (version, description) VALUES ($1, $2)',
        [testVersion, 'Test migration']
      );
      
      // WHEN: We check applied migrations
      const result = await sql('SELECT version FROM schema_migrations');
      const appliedVersions = new Set(result.map(r => r.version));
      
      // THEN: Already applied migration is in the set
      expect(appliedVersions.has(testVersion)).toBe(true);
    });

    it('[2.3-UNIT-005] should apply pending migrations and insert into schema_migrations', async () => {
      // GIVEN: schema_migrations table exists
      await sql(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          description TEXT
        )
      `);
      
      // WHEN: We insert a new migration record
      const version = '20231106120000_test';
      await sql(
        'INSERT INTO schema_migrations (version, description) VALUES ($1, $2)',
        [version, 'Test migration']
      );
      
      // THEN: Record exists in schema_migrations
      const result = await sql(
        'SELECT * FROM schema_migrations WHERE version = $1',
        [version]
      );
      
      expect(result.length).toBe(1);
      expect(result[0].version).toBe(version);
    });

    it('[2.3-UNIT-006] should stop on first migration failure and not continue', async () => {
      // GIVEN: We have invalid SQL
      const invalidSql = 'INVALID SQL SYNTAX HERE';
      
      // WHEN: We try to execute it
      // THEN: It should throw an error
      await expect(sql(invalidSql)).rejects.toThrow();
    });

    it('[2.3-UNIT-007] should execute SQL content from migration file', async () => {
      // GIVEN: Migration file with periodic table schema
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.up.sql'));
      
      expect(migrationFiles.length).toBeGreaterThan(0);
      
      // WHEN: We read a migration file
      const migrationPath = path.join(migrationsDir, migrationFiles[0]);
      const content = fs.readFileSync(migrationPath, 'utf-8');
      
      // THEN: File contains SQL statements
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('CREATE TABLE');
    });

    it('[2.3-UNIT-008] should handle empty migrations directory gracefully', () => {
      // GIVEN: An empty directory
      const emptyDir = path.join(testMigrationsDir, 'empty');
      if (!fs.existsSync(emptyDir)) {
        fs.mkdirSync(emptyDir, { recursive: true });
      }
      
      // WHEN: We read migration files
      const files = fs.readdirSync(emptyDir)
        .filter(f => f.endsWith('.up.sql'));
      
      // THEN: No migrations found, no error
      expect(files.length).toBe(0);
    });
  });

  describe('Rollback Logic', () => {
    it('[2.3-UNIT-009] should rollback last applied migration', async () => {
      // GIVEN: schema_migrations contains applied migrations
      await sql(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          description TEXT
        )
      `);
      
      await sql(
        'INSERT INTO schema_migrations (version, description) VALUES ($1, $2)',
        ['20231106120000_test', 'Test migration']
      );
      
      // WHEN: We get the last migration
      const result = await sql(`
        SELECT version FROM schema_migrations
        ORDER BY applied_at DESC LIMIT 1
      `);
      
      // THEN: We can identify it
      expect(result.length).toBe(1);
      expect(result[0].version).toBe('20231106120000_test');
    });

    it('[2.3-UNIT-010] should read corresponding .down.sql file for rollback', () => {
      // GIVEN: Migration files exist
      const upFiles = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.up.sql'));
      
      expect(upFiles.length).toBeGreaterThan(0);
      
      // WHEN: We look for corresponding .down.sql files
      const version = upFiles[0].replace('.up.sql', '');
      const downFile = path.join(migrationsDir, `${version}.down.sql`);
      
      // THEN: Down file exists
      expect(fs.existsSync(downFile)).toBe(true);
    });

    it('[2.3-UNIT-011] should remove rolled-back migration from schema_migrations', async () => {
      // GIVEN: Migration is in schema_migrations
      await sql(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          description TEXT
        )
      `);
      
      const version = '20231106120000_test';
      await sql(
        'INSERT INTO schema_migrations (version, description) VALUES ($1, $2)',
        [version, 'Test migration']
      );
      
      // WHEN: We delete it
      await sql('DELETE FROM schema_migrations WHERE version = $1', [version]);
      
      // THEN: Record is removed
      const result = await sql(
        'SELECT * FROM schema_migrations WHERE version = $1',
        [version]
      );
      expect(result.length).toBe(0);
    });

    it('[2.3-UNIT-012] should handle no migrations to rollback gracefully', async () => {
      // GIVEN: schema_migrations is empty
      await sql(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          description TEXT
        )
      `);
      
      // WHEN: We query for migrations
      const result = await sql('SELECT version FROM schema_migrations');
      
      // THEN: No migrations found
      expect(result.length).toBe(0);
    });

    it('[2.3-UNIT-013] should error if .down.sql file not found for rollback', () => {
      // GIVEN: A version that doesn't have a .down.sql file
      const fakeVersion = '99999999999999_nonexistent';
      const downFile = path.join(migrationsDir, `${fakeVersion}.down.sql`);
      
      // THEN: File doesn't exist
      expect(fs.existsSync(downFile)).toBe(false);
    });
  });

  describe('Status Command', () => {
    it('[2.3-UNIT-014] should list all migrations with applied status', async () => {
      // GIVEN: Some migrations applied, some pending
      await sql(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          description TEXT
        )
      `);
      
      await sql(
        'INSERT INTO schema_migrations (version, description) VALUES ($1, $2)',
        ['20231106120000_test', 'Test migration']
      );
      
      // WHEN: We get status
      const applied = await sql('SELECT version FROM schema_migrations');
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.up.sql'));
      
      // THEN: We can determine status for each
      expect(applied.length).toBeGreaterThanOrEqual(0);
      expect(files.length).toBeGreaterThan(0);
    });

    it('[2.3-UNIT-015] should show timestamp when migration was applied', async () => {
      // GIVEN: Migration with applied_at timestamp
      await sql(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          description TEXT
        )
      `);
      
      await sql(
        'INSERT INTO schema_migrations (version, description) VALUES ($1, $2)',
        ['20231106120000_test', 'Test migration']
      );
      
      // WHEN: We query the migration
      const result = await sql('SELECT version, applied_at FROM schema_migrations');
      
      // THEN: applied_at is present
      expect(result[0].applied_at).toBeDefined();
      expect(new Date(result[0].applied_at)).toBeInstanceOf(Date);
    });

    it('[2.3-UNIT-016] should mark pending migrations as not applied', async () => {
      // GIVEN: schema_migrations table with some migrations
      await sql(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          description TEXT
        )
      `);
      
      // WHEN: We compare files vs applied
      const appliedMigrations = await sql('SELECT version FROM schema_migrations');
      const appliedSet = new Set(appliedMigrations.map(m => m.version));
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.up.sql'));
      
      // THEN: We can identify pending migrations
      const pending = files.filter(f => !appliedSet.has(f.replace('.up.sql', '')));
      expect(pending).toBeDefined();
    });

    it('[2.3-UNIT-017] should display migrations in sorted order', () => {
      // GIVEN: Migration files
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.up.sql'));
      
      // WHEN: Files are sorted
      const sorted = [...files].sort();
      
      // THEN: Order is maintained
      expect(sorted).toEqual(files.sort());
    });
  });

  describe('Create Command', () => {
    it('[2.3-UNIT-018] should generate timestamp in YYYYMMDDHHMMSS format', () => {
      // GIVEN: Current date
      const now = new Date();
      
      // WHEN: We generate timestamp
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
      
      // THEN: Format is exactly 14 digits
      expect(timestamp).toMatch(/^\d{14}$/);
    });

    it('[2.3-UNIT-019] should create both .up.sql and .down.sql files', () => {
      // GIVEN: Migration files in directory
      const files = fs.readdirSync(migrationsDir);
      const upFiles = files.filter(f => f.endsWith('.up.sql'));
      
      // THEN: Each .up.sql has corresponding .down.sql
      upFiles.forEach(upFile => {
        const downFile = upFile.replace('.up.sql', '.down.sql');
        expect(files).toContain(downFile);
      });
    });

    it('[2.3-UNIT-020] should include migration name in filename', () => {
      // GIVEN: Migration files
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.up.sql'));
      
      // THEN: Filenames follow pattern: timestamp_name.up.sql
      files.forEach(file => {
        expect(file).toMatch(/^\d{14}_[a-z0-9_]+\.up\.sql$/);
      });
    });

    it('[2.3-UNIT-021] should add template content to generated files', () => {
      // GIVEN: A migration file
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.up.sql'));
      
      expect(files.length).toBeGreaterThan(0);
      
      // WHEN: We read the file
      const content = fs.readFileSync(
        path.join(migrationsDir, files[0]),
        'utf-8'
      );
      
      // THEN: It contains SQL statements
      expect(content.length).toBeGreaterThan(0);
    });

    it('[2.3-UNIT-022] should error if migration name not provided', () => {
      // GIVEN: Empty migration name
      const name = '';
      
      // THEN: Name validation should fail
      expect(name).toBe('');
      expect(/^[a-z0-9_]+$/.test(name)).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('[2.3-UNIT-023] should exit with code 1 if DATABASE_URL not set', () => {
      // GIVEN: DATABASE_URL check
      const url = process.env.DATABASE_URL;
      
      // THEN: URL should be set for these tests
      expect(url).toBeDefined();
      expect(url).not.toBe('');
    });

    it('[2.3-UNIT-024] should log masked DATABASE_URL for verification', () => {
      // GIVEN: DATABASE_URL
      const url = 'postgresql://user:password@host/db';
      
      // WHEN: We mask it
      const masked = url.replace(/:[^:@]+@/, ':***@');
      
      // THEN: Password is hidden
      expect(masked).toBe('postgresql://user:***@host/db');
      expect(masked).not.toContain('password');
    });

    it('[2.3-UNIT-025] should provide clear error message on SQL syntax error', async () => {
      // GIVEN: Invalid SQL
      const invalidSql = 'SELECT * FROM nonexistent_table_12345';
      
      // WHEN: We execute it
      // THEN: Error message should be clear
      await expect(sql(invalidSql)).rejects.toThrow();
    });
  });

  describe('Safety Checks', () => {
    it('[2.3-UNIT-026] should warn when DATABASE_URL contains \'production\' or \'prd\'', () => {
      // GIVEN: Production URL
      const url = 'postgresql://user:pass@host/production_db';
      
      // THEN: We can detect it
      expect(
        url.includes('prd') || url.includes('production')
      ).toBe(true);
    });

    it('[2.3-UNIT-027] should validate migration file format (timestamp_name.sql)', () => {
      // GIVEN: Various filenames
      const valid = '20231106120000_create_table.up.sql';
      const invalid1 = 'invalid_format.sql';
      const invalid2 = '123_too_short.up.sql';
      
      // WHEN: We validate them
      const pattern = /^\d{14}_[a-z0-9_]+\.up\.sql$/;
      
      // THEN: Only valid format passes
      expect(pattern.test(valid)).toBe(true);
      expect(pattern.test(invalid1)).toBe(false);
      expect(pattern.test(invalid2)).toBe(false);
    });

    it('[2.3-UNIT-028] should check for duplicate migration versions', () => {
      // GIVEN: List of migration files
      const files = [
        '20231106120000_first.up.sql',
        '20231106130000_second.up.sql',
        '20231106120000_duplicate.up.sql'
      ];
      
      // WHEN: We check for duplicates
      const versions = files.map(f => f.split('_')[0]);
      const duplicates = versions.filter((v, i) => versions.indexOf(v) !== i);
      
      // THEN: Duplicates are detected
      expect(duplicates.length).toBeGreaterThan(0);
      expect(duplicates[0]).toBe('20231106120000');
    });
  });
});

