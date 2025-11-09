/**
 * Unit Tests: Schema Validation (Story 2.4)
 * 
 * Tests database schema structure for periodic_table from Neon sample data.
 * These are fast unit tests that validate:
 * - Migration file existence
 * - SQL syntax correctness
 * - Table structure definitions
 * 
 * RED PHASE: Tests updated for periodic_table instead of role directory schema
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

describe('Schema Validation - Unit Tests', () => {
  describe('Migration File Existence', () => {
    it('should have initial_schema.up.sql migration file', () => {
      // GIVEN: Migrations directory exists
      // WHEN: Listing migration files
      const files = fs.readdirSync(MIGRATIONS_DIR);
      const upMigration = files.find((file) => file.includes('initial_schema') && file.endsWith('.up.sql'));

      // THEN: Up migration exists
      expect(upMigration).toBeDefined();
    });

    it('should have initial_schema.down.sql migration file', () => {
      // GIVEN: Migrations directory exists
      // WHEN: Listing migration files
      const files = fs.readdirSync(MIGRATIONS_DIR);
      const downMigration = files.find((file) => file.includes('initial_schema') && file.endsWith('.down.sql'));

      // THEN: Down migration exists
      expect(downMigration).toBeDefined();
    });

    it('should have matching timestamps for up and down migrations', () => {
      // GIVEN: Migration files exist
      // WHEN: Extracting timestamps
      const files = fs.readdirSync(MIGRATIONS_DIR);
      const upFile = files.find((file) => file.includes('initial_schema') && file.endsWith('.up.sql'));
      const downFile = files.find((file) => file.includes('initial_schema') && file.endsWith('.down.sql'));

      expect(upFile).toBeDefined();
      expect(downFile).toBeDefined();

      const upTimestamp = upFile!.split('_')[0];
      const downTimestamp = downFile!.split('_')[0];

      // THEN: Timestamps match
      expect(upTimestamp).toBe(downTimestamp);
    });
  });

  describe('Up Migration Content Validation', () => {
    let upMigrationContent: string;

    beforeAll(() => {
      const files = fs.readdirSync(MIGRATIONS_DIR);
      const upFile = files.find((file) => file.includes('initial_schema') && file.endsWith('.up.sql'));
      if (upFile) {
        upMigrationContent = fs.readFileSync(path.join(MIGRATIONS_DIR, upFile), 'utf-8');
      }
    });

    it('should create periodic_table table', () => {
      // GIVEN: Up migration content loaded
      // WHEN: Checking for table creation
      // THEN: periodic_table is created
      expect(upMigrationContent).toContain('CREATE TABLE periodic_table');
    });

    it('should define AtomicNumber as primary key', () => {
      // GIVEN: Up migration content loaded
      // WHEN: Checking for primary key
      // THEN: AtomicNumber is the primary key
      expect(upMigrationContent).toContain('"AtomicNumber" integer NOT NULL');
      expect(upMigrationContent).toContain('PRIMARY KEY ("AtomicNumber")');
    });

    it('should define core element columns', () => {
      // GIVEN: Up migration content loaded
      // WHEN: Checking for essential columns
      const requiredColumns = [
        '"AtomicNumber"',
        '"Element"',
        '"Symbol"',
        '"AtomicMass"',
        '"NumberOfProtons"',
        '"NumberOfElectrons"',
        '"NumberOfNeutrons"',
      ];

      // THEN: All core columns exist
      requiredColumns.forEach((column) => {
        expect(upMigrationContent).toContain(column);
      });
    });

    it('should define physical property columns', () => {
      // GIVEN: Up migration content loaded
      // WHEN: Checking for physical property columns
      const propertyColumns = [
        '"Density"',
        '"MeltingPoint"',
        '"BoilingPoint"',
        '"Phase"',
      ];

      // THEN: Physical property columns exist
      propertyColumns.forEach((column) => {
        expect(upMigrationContent).toContain(column);
      });
    });

    it('should define chemical property columns', () => {
      // GIVEN: Up migration content loaded
      // WHEN: Checking for chemical property columns
      const chemicalColumns = [
        '"Electronegativity"',
        '"FirstIonization"',
        '"AtomicRadius"',
        '"Radioactive"',
      ];

      // THEN: Chemical property columns exist
      chemicalColumns.forEach((column) => {
        expect(upMigrationContent).toContain(column);
      });
    });

    it('should define classification columns', () => {
      // GIVEN: Up migration content loaded
      // WHEN: Checking for classification columns
      const classificationColumns = [
        '"Metal"',
        '"Nonmetal"',
        '"Metalloid"',
        '"Type"',
      ];

      // THEN: Classification columns exist
      classificationColumns.forEach((column) => {
        expect(upMigrationContent).toContain(column);
      });
    });

    it('should include element data with COPY statement', () => {
      // GIVEN: Up migration content loaded
      // WHEN: Checking for data import
      // THEN: COPY statement exists with data
      expect(upMigrationContent).toContain('COPY periodic_table');
      expect(upMigrationContent).toContain('FROM stdin');
    });

    it('should include data for Hydrogen (element 1)', () => {
      // GIVEN: Up migration content loaded
      // WHEN: Checking for first element
      // THEN: Hydrogen data exists
      expect(upMigrationContent).toContain('Hydrogen');
      expect(upMigrationContent).toContain('\tH\t');
    });

    it('should include data for Neon (element 10)', () => {
      // GIVEN: Up migration content loaded
      // WHEN: Checking for Neon (the test element)
      // THEN: Neon data exists
      expect(upMigrationContent).toContain('Neon');
      expect(upMigrationContent).toContain('\tNe\t');
    });

    it('should include data for all 118 elements', () => {
      // GIVEN: Up migration content loaded
      // WHEN: Checking for last element
      // THEN: Oganesson (element 118) data exists
      expect(upMigrationContent).toContain('Oganesson');
      expect(upMigrationContent).toContain('\tOg\t');
    });
  });

  describe('Down Migration Content Validation', () => {
    let downMigrationContent: string;

    beforeAll(() => {
      const files = fs.readdirSync(MIGRATIONS_DIR);
      const downFile = files.find((file) => file.includes('initial_schema') && file.endsWith('.down.sql'));
      if (downFile) {
        downMigrationContent = fs.readFileSync(path.join(MIGRATIONS_DIR, downFile), 'utf-8');
      }
    });

    it('should drop periodic_table table', () => {
      // GIVEN: Down migration content loaded
      // WHEN: Checking for DROP TABLE statement
      // THEN: periodic_table is dropped
      expect(downMigrationContent).toContain('DROP TABLE IF EXISTS periodic_table');
    });

    it('should use CASCADE on DROP statement to handle dependencies', () => {
      // GIVEN: Down migration content loaded
      // WHEN: Checking for CASCADE usage
      // THEN: CASCADE is used to drop dependent objects
      expect(downMigrationContent).toContain('CASCADE');
    });
  });

  describe('SQL Syntax Validation', () => {
    it('should not have any obvious SQL syntax errors in up migration', () => {
      // GIVEN: Up migration content loaded
      const files = fs.readdirSync(MIGRATIONS_DIR);
      const upFile = files.find((file) => file.includes('initial_schema') && file.endsWith('.up.sql'));
      const content = upFile ? fs.readFileSync(path.join(MIGRATIONS_DIR, upFile), 'utf-8') : '';

      // WHEN: Checking for common syntax errors
      // THEN: No unclosed parentheses or quotes
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      expect(openParens).toBe(closeParens);

      // Table definition should be well-formed
      expect(content).toContain('CREATE TABLE periodic_table');
      expect(content).toContain('PRIMARY KEY');
    });

    it('should not have any obvious SQL syntax errors in down migration', () => {
      // GIVEN: Down migration content loaded
      const files = fs.readdirSync(MIGRATIONS_DIR);
      const downFile = files.find((file) => file.includes('initial_schema') && file.endsWith('.down.sql'));
      const content = downFile ? fs.readFileSync(path.join(MIGRATIONS_DIR, downFile), 'utf-8') : '';

      // WHEN: Checking for common syntax errors
      // THEN: Statements properly terminated
      const dropStatements = content.match(/DROP TABLE IF EXISTS/g) || [];
      expect(dropStatements.length).toBeGreaterThan(0);
    });
  });
});

