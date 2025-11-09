# ATDD Checklist - Epic 2, Story 2.3: Database Schema Migration Setup

**Date:** 2025-11-09  
**Author:** Murat (Master Test Architect)  
**Primary Test Level:** Unit (Migration CLI System)

---

## Story Summary

Create a migration system to manage database schema changes across environments (dev, staging, production). This story establishes the migration foundation that will be used by Story 2.4 to migrate the existing role/pricing tables.

**As a** developer  
**I want** a migration system to manage database schema changes across environments  
**So that** schema updates can be applied consistently and safely to dev, staging, and production

---

## Acceptance Criteria

### Migration CLI System

1. ✅ Supports up (apply) and down (rollback) migrations
2. ✅ Tracks migration state (which migrations have been applied)
3. ✅ Can be run manually via CLI: `npm run migrate:up` / `npm run migrate:down`
4. ✅ Generates migration files with timestamp: `YYYYMMDDHHMMSS_migration_name.sql`
5. ✅ Applies migrations in order (based on timestamp)

### Environment Support

6. ✅ Can run migrations against any environment by setting `DATABASE_URL`
7. ✅ Creates a `schema_migrations` table to track applied migrations
8. ✅ Migration process is documented in README or `docs/DATABASE.md`
9. ✅ Sample migration included (periodic table data from Neon)

---

## Failing Tests Created (RED Phase)

### Unit Tests - Migration CLI System (28 tests)

**File:** `tests/unit/migrate.test.ts` (650 lines)

#### Core Migration Logic (8 tests)

- ✅ **Test:** `[2.3-UNIT-001] should create schema_migrations table if it doesn't exist`
  - **Status:** RED - Script `scripts/migrate.js` does not exist
  - **Verifies:** Bootstrap migration tracking table on first run

- ✅ **Test:** `[2.3-UNIT-002] should read all .up.sql files from migrations directory`
  - **Status:** RED - Script does not exist
  - **Verifies:** Migration discovery from filesystem

- ✅ **Test:** `[2.3-UNIT-003] should sort migrations by timestamp (alphabetical order)`
  - **Status:** RED - Script does not exist
  - **Verifies:** Migrations are applied in correct order

- ✅ **Test:** `[2.3-UNIT-004] should skip already applied migrations`
  - **Status:** RED - Script does not exist
  - **Verifies:** Idempotent migration execution (can run multiple times)

- ✅ **Test:** `[2.3-UNIT-005] should apply pending migrations and insert into schema_migrations`
  - **Status:** RED - Script does not exist
  - **Verifies:** Migration tracking after successful execution

- ✅ **Test:** `[2.3-UNIT-006] should stop on first migration failure and not continue`
  - **Status:** RED - Script does not exist
  - **Verifies:** Fail-fast behavior prevents partial migrations

- ✅ **Test:** `[2.3-UNIT-007] should execute SQL content from migration file`
  - **Status:** RED - Script does not exist
  - **Verifies:** Migration SQL is executed against database

- ✅ **Test:** `[2.3-UNIT-008] should handle empty migrations directory gracefully`
  - **Status:** RED - Script does not exist
  - **Verifies:** No error when no migrations exist

#### Rollback Logic (5 tests)

- ✅ **Test:** `[2.3-UNIT-009] should rollback last applied migration`
  - **Status:** RED - Script does not exist
  - **Verifies:** `migrate:down` rolls back most recent migration

- ✅ **Test:** `[2.3-UNIT-010] should read corresponding .down.sql file for rollback`
  - **Status:** RED - Script does not exist
  - **Verifies:** Rollback file discovery and execution

- ✅ **Test:** `[2.3-UNIT-011] should remove rolled-back migration from schema_migrations`
  - **Status:** RED - Script does not exist
  - **Verifies:** Migration tracking cleanup after rollback

- ✅ **Test:** `[2.3-UNIT-012] should handle no migrations to rollback gracefully`
  - **Status:** RED - Script does not exist
  - **Verifies:** Friendly message when schema_migrations is empty

- ✅ **Test:** `[2.3-UNIT-013] should error if .down.sql file not found for rollback`
  - **Status:** RED - Script does not exist
  - **Verifies:** Clear error when rollback file is missing

#### Status Command (4 tests)

- ✅ **Test:** `[2.3-UNIT-014] should list all migrations with applied status`
  - **Status:** RED - Script does not exist
  - **Verifies:** `migrate:status` shows migration state overview

- ✅ **Test:** `[2.3-UNIT-015] should show timestamp when migration was applied`
  - **Status:** RED - Script does not exist
  - **Verifies:** Applied timestamp display from schema_migrations

- ✅ **Test:** `[2.3-UNIT-016] should mark pending migrations as not applied`
  - **Status:** RED - Script does not exist
  - **Verifies:** Pending migrations are clearly indicated

- ✅ **Test:** `[2.3-UNIT-017] should display migrations in sorted order`
  - **Status:** RED - Script does not exist
  - **Verifies:** Status output shows chronological order

#### Create Command (5 tests)

- ✅ **Test:** `[2.3-UNIT-018] should generate timestamp in YYYYMMDDHHMMSS format`
  - **Status:** RED - Script does not exist
  - **Verifies:** Migration file naming convention

- ✅ **Test:** `[2.3-UNIT-019] should create both .up.sql and .down.sql files`
  - **Status:** RED - Script does not exist
  - **Verifies:** `migrate:create` generates migration pair

- ✅ **Test:** `[2.3-UNIT-020] should include migration name in filename`
  - **Status:** RED - Script does not exist
  - **Verifies:** Filename format: `{timestamp}_{name}.up.sql`

- ✅ **Test:** `[2.3-UNIT-021] should add template content to generated files`
  - **Status:** RED - Script does not exist
  - **Verifies:** Generated files contain helpful SQL comments

- ✅ **Test:** `[2.3-UNIT-022] should error if migration name not provided`
  - **Status:** RED - Script does not exist
  - **Verifies:** Required argument validation

#### Error Handling (3 tests)

- ✅ **Test:** `[2.3-UNIT-023] should exit with code 1 if DATABASE_URL not set`
  - **Status:** RED - Script does not exist
  - **Verifies:** Required environment variable check

- ✅ **Test:** `[2.3-UNIT-024] should log masked DATABASE_URL for verification`
  - **Status:** RED - Script does not exist
  - **Verifies:** Security - credentials masked in logs

- ✅ **Test:** `[2.3-UNIT-025] should provide clear error message on SQL syntax error`
  - **Status:** RED - Script does not exist
  - **Verifies:** User-friendly error messages

#### Safety Checks (3 tests)

- ✅ **Test:** `[2.3-UNIT-026] should warn when DATABASE_URL contains 'production' or 'prd'`
  - **Status:** RED - Script does not exist
  - **Verifies:** Production safety warning

- ✅ **Test:** `[2.3-UNIT-027] should validate migration file format (timestamp_name.sql)`
  - **Status:** RED - Script does not exist
  - **Verifies:** File naming convention enforcement

- ✅ **Test:** `[2.3-UNIT-028] should check for duplicate migration versions`
  - **Status:** RED - Script does not exist
  - **Verifies:** Prevent timestamp collisions

---

## Integration Test - End-to-End Migration Workflow (1 test)

**File:** `tests/integration/migrate.integration.test.ts` (150 lines)

- ✅ **Test:** `[2.3-INT-001] should complete full migration lifecycle: create → up → status → down`
  - **Status:** RED - Script does not exist
  - **Verifies:** Real database migration workflow with periodic table data
  - **Steps:**
    1. Create test migration with periodic table SQL
    2. Apply migration (`migrate:up`)
    3. Verify table exists in database
    4. Check status (`migrate:status`) shows applied
    5. Rollback migration (`migrate:down`)
    6. Verify table dropped
    7. Verify schema_migrations updated

---

## Data Factories Created

**No data factories required for this story.** Migration system tests use file system operations and database mocks. The actual periodic table data is provided by Neon in `periodic_table.sql` (already in project root).

---

## Fixtures Created

**No custom fixtures required for this story.** Unit tests use temporary directories and in-memory database state. Integration test uses the actual test database with cleanup.

---

## Mock Requirements

### Neon Serverless Driver Mock (Unit Tests)

**Module:** `@neondatabase/serverless`

**Mock Strategy:** Vi mock in unit tests, real database in integration test

**Success Behavior:**

```typescript
// Mock schema_migrations queries
vi.mocked(sql).mockResolvedValueOnce([
  { version: '20231106120000_initial_schema', applied_at: '2023-11-06T12:00:00Z' }
]);

// Mock successful migration execution
vi.mocked(sql).mockResolvedValueOnce([]);
```

**Failure Behavior:**

```typescript
// Mock SQL syntax error
vi.mocked(sql).mockRejectedValueOnce(new Error('syntax error at or near "CREATEE"'));
```

### File System Mocks (Unit Tests)

**Module:** Node.js `fs` and `path`

**Mock Strategy:** Mock `fs.readdirSync`, `fs.readFileSync`, `fs.writeFileSync`, `fs.existsSync`

**Success Behavior:**

```typescript
// Mock reading migration files
vi.mocked(fs.readdirSync).mockReturnValue([
  '20231106120000_initial_schema.up.sql',
  '20231106120000_initial_schema.down.sql'
] as any);

// Mock reading file content
vi.mocked(fs.readFileSync).mockReturnValue('CREATE TABLE test (id SERIAL);');
```

---

## Required data-testid Attributes

**None required for this story.** This story implements a CLI tool (migration system) with no UI components. Data-testid attributes are not applicable to command-line scripts.

---

## Implementation Checklist

### Step 1: Create Migrations Directory

**Tests to pass:** Foundation for all migration tests

**Tasks:**

- [ ] Create directory: `migrations/`
- [ ] Verify directory exists in project root
- [ ] Add `.gitkeep` file (optional, to track empty directory in git)

**Estimated Effort:** 5 minutes

---

### Step 2: Create Migration CLI Script

**Tests to pass:** `[2.3-UNIT-001]` through `[2.3-UNIT-028]` (28 tests)

**Tasks:**

- [ ] Create file: `scripts/migrate.js`
- [ ] Add Node.js shebang: `#!/usr/bin/env node`
- [ ] Make executable: `chmod +x scripts/migrate.js`
- [ ] Import dependencies:
  ```javascript
  const { neon } = require('@neondatabase/serverless');
  const fs = require('fs');
  const path = require('path');
  ```
- [ ] Check DATABASE_URL environment variable (exit if missing)
- [ ] Initialize Neon client: `const sql = neon(DATABASE_URL);`
- [ ] Parse command from `process.argv[2]`
- [ ] Implement command dispatcher (switch statement for up/down/status/create)

**Estimated Effort:** 30 minutes

**Reference:** Story file `docs/stories/2-3-database-schema-migration-setup.md` (lines 242-431)

---

### Step 3: Implement `migrate:up` Command

**Tests to pass:** `[2.3-UNIT-001]` through `[2.3-UNIT-008]` (8 tests)

**Tasks:**

- [ ] Create `schema_migrations` table if not exists:
  ```javascript
  await sql(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      description TEXT
    )
  `);
  ```
- [ ] Query applied migrations: `SELECT version FROM schema_migrations`
- [ ] Read all `.up.sql` files from `migrations/` directory
- [ ] Sort files alphabetically (chronological order)
- [ ] Filter pending migrations (not in schema_migrations)
- [ ] For each pending migration:
  - Read SQL file content
  - Execute SQL via Neon client
  - Insert version into schema_migrations
  - Log success: `✅ {version} applied`
- [ ] Handle errors: Log error, exit with code 1
- [ ] Log completion: `✅ All migrations applied successfully`

**Estimated Effort:** 1 hour

**Reference:** Story file `docs/stories/2-3-database-schema-migration-setup.md` (lines 263-313)

---

### Step 4: Implement `migrate:down` Command

**Tests to pass:** `[2.3-UNIT-009]` through `[2.3-UNIT-013]` (5 tests)

**Tasks:**

- [ ] Query last applied migration:
  ```javascript
  SELECT version FROM schema_migrations
  ORDER BY applied_at DESC LIMIT 1
  ```
- [ ] If no migrations applied, log: `No migrations to rollback` and exit
- [ ] Find corresponding `.down.sql` file
- [ ] If `.down.sql` not found, error: `Rollback file not found: {version}.down.sql`
- [ ] Read rollback SQL content
- [ ] Execute rollback SQL
- [ ] Delete record from schema_migrations: `DELETE FROM schema_migrations WHERE version = $1`
- [ ] Log success: `✅ {version} rolled back`
- [ ] Handle errors: Log error, exit with code 1

**Estimated Effort:** 45 minutes

**Reference:** Story file `docs/stories/2-3-database-schema-migration-setup.md` (lines 315-351)

---

### Step 5: Implement `migrate:status` Command

**Tests to pass:** `[2.3-UNIT-014]` through `[2.3-UNIT-017]` (4 tests)

**Tasks:**

- [ ] Query applied migrations with timestamps:
  ```javascript
  SELECT version, applied_at FROM schema_migrations
  ORDER BY version
  ```
- [ ] Read all `.up.sql` files from migrations directory
- [ ] Sort files alphabetically
- [ ] For each migration file:
  - Check if version exists in applied set
  - If applied: Log `✅ {version} (applied {timestamp})`
  - If pending: Log `❌ {version} (pending)`
- [ ] Format output clearly with header: `📊 Migration Status:`

**Estimated Effort:** 30 minutes

**Reference:** Story file `docs/stories/2-3-database-schema-migration-setup.md` (lines 353-380)

---

### Step 6: Implement `migrate:create` Command

**Tests to pass:** `[2.3-UNIT-018]` through `[2.3-UNIT-022]` (5 tests)

**Tasks:**

- [ ] Read migration name from `process.argv[3]`
- [ ] If name missing, error: `Migration name is required` and show usage
- [ ] Generate timestamp:
  ```javascript
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '')
    .split('.')[0];
  ```
- [ ] Create version string: `const version = \`\${timestamp}_\${name}\`;`
- [ ] Create up migration file: `migrations/{version}.up.sql`
- [ ] Add template content:
  ```sql
  -- Up migration: {name}
  -- Add your SQL statements here
  
  -- Example:
  -- CREATE TABLE example (
  --   id SERIAL PRIMARY KEY,
  --   name VARCHAR(255) NOT NULL
  -- );
  ```
- [ ] Create down migration file: `migrations/{version}.down.sql`
- [ ] Add rollback template:
  ```sql
  -- Down migration: {name}
  -- Add your rollback SQL statements here
  
  -- Example:
  -- DROP TABLE IF EXISTS example;
  ```
- [ ] Log success: `✅ Created migration: {version}`

**Estimated Effort:** 30 minutes

**Reference:** Story file `docs/stories/2-3-database-schema-migration-setup.md` (lines 382-410)

---

### Step 7: Add Safety Checks and Error Handling

**Tests to pass:** `[2.3-UNIT-023]` through `[2.3-UNIT-028]` (6 tests)

**Tasks:**

- [ ] Check DATABASE_URL is set (before initializing Neon client):
  ```javascript
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }
  ```
- [ ] Warn if production database:
  ```javascript
  if (DATABASE_URL.includes('prd') || DATABASE_URL.includes('production')) {
    console.warn('⚠️  WARNING: Running against PRODUCTION database!');
    console.warn('⚠️  DATABASE_URL:', DATABASE_URL.replace(/:[^@]+@/, ':***@'));
  }
  ```
- [ ] Validate migration file format (timestamp must be 14 digits)
- [ ] Check for duplicate migration versions
- [ ] Wrap all SQL execution in try-catch with clear error messages
- [ ] Include SQL query in error logs (for debugging)

**Estimated Effort:** 30 minutes

**Reference:** Story file `docs/stories/2-3-database-schema-migration-setup.md` (lines 479-497)

---

### Step 8: Add npm Scripts

**Tests to pass:** All CLI tests require npm scripts to run

**Tasks:**

- [ ] Update `package.json`:
  ```json
  {
    "scripts": {
      "migrate:up": "node scripts/migrate.js up",
      "migrate:down": "node scripts/migrate.js down",
      "migrate:status": "node scripts/migrate.js status",
      "migrate:create": "node scripts/migrate.js create"
    }
  }
  ```
- [ ] Test scripts work: `npm run migrate:status` (should show empty or error asking for DATABASE_URL)

**Estimated Effort:** 10 minutes

**Reference:** Story file `docs/stories/2-3-database-schema-migration-setup.md` (lines 126-139)

---

### Step 9: Create Sample Migration with Periodic Table Data

**Tests to pass:** Acceptance criterion #9 (sample migration included)

**Tasks:**

- [ ] Create migration using CLI: `npm run migrate:create create_periodic_table`
- [ ] Copy content from `periodic_table.sql` (in project root) to the generated `.up.sql` file
- [ ] Edit the `.down.sql` file:
  ```sql
  -- Down migration: create_periodic_table
  -- Drop the periodic table
  
  DROP TABLE IF EXISTS periodic_table;
  ```
- [ ] Verify migration files exist in `migrations/` directory

**Estimated Effort:** 15 minutes

**Reference:** [Neon periodic table sample data](https://neon.com/docs/import/import-sample-data#periodic-table-data)

---

### Step 10: Test Migration System Manually

**Tests to pass:** `[2.3-INT-001]` (integration test)

**Tasks:**

- [ ] Set DATABASE_URL for dev environment:
  ```bash
  export DATABASE_URL="postgresql://..."
  ```
- [ ] Run status: `npm run migrate:status` (should show pending periodic table migration)
- [ ] Run up: `npm run migrate:up`
- [ ] Verify table created:
  ```bash
  psql $DATABASE_URL -c "\dt"
  psql $DATABASE_URL -c "SELECT * FROM periodic_table WHERE \"AtomicNumber\" = 10"
  ```
- [ ] Run status again: `npm run migrate:status` (should show applied with timestamp)
- [ ] Verify schema_migrations:
  ```bash
  psql $DATABASE_URL -c "SELECT * FROM schema_migrations"
  ```
- [ ] Run down: `npm run migrate:down`
- [ ] Verify table dropped: `psql $DATABASE_URL -c "\dt"`
- [ ] Run up again: `npm run migrate:up` (verify idempotency)

**Estimated Effort:** 30 minutes

**Reference:** Story file `docs/stories/2-3-database-schema-migration-setup.md` (lines 518-547)

---

### Step 11: Create Migration Documentation

**Tests to pass:** Acceptance criterion #8 (migration process documented)

**Tasks:**

- [ ] Create file: `docs/guides/database-migrations.md` (or update `docs/DATABASE.md` if it exists)
- [ ] Document migration commands:
  - Create migration: `npm run migrate:create migration_name`
  - Apply migrations: `DATABASE_URL=... npm run migrate:up`
  - Rollback migration: `DATABASE_URL=... npm run migrate:down`
  - Check status: `DATABASE_URL=... npm run migrate:status`
- [ ] Document workflow for each environment:
  1. Create migration in dev
  2. Apply to dev and test thoroughly
  3. Apply to staging and validate
  4. Apply to production during maintenance window
- [ ] Document best practices:
  - Always create rollback migrations
  - Test rollback in dev before production
  - Prefer additive migrations (avoid breaking changes)
  - Never modify applied migrations (create new one)
  - Make migrations idempotent (use IF EXISTS / IF NOT EXISTS)
- [ ] Add troubleshooting section:
  - DATABASE_URL not set
  - Migration failed (how to fix and retry)
  - Rollback not working
- [ ] Update README with link to migration documentation

**Estimated Effort:** 1 hour

**Reference:** Story file `docs/stories/2-3-database-schema-migration-setup.md` (lines 163-202)

---

### Step 12: Run All Unit Tests

**Tests to pass:** All 28 unit tests

**Tasks:**

- [ ] Run unit tests: `npm run test:unit -- tests/unit/migrate.test.ts`
- [ ] Verify all 28 tests pass (GREEN phase)
- [ ] Check test coverage: `npm run test:unit:coverage`
- [ ] Target: >90% coverage for migration script

**Estimated Effort:** 30 minutes (includes fixing any failures)

---

### Step 13: Run Integration Test

**Tests to pass:** `[2.3-INT-001]` (1 integration test)

**Tasks:**

- [ ] Set test DATABASE_URL (use dev database or create test database)
- [ ] Run integration test: `npm run test:integration -- tests/integration/migrate.integration.test.ts`
- [ ] Verify test passes with real database operations
- [ ] Clean up test data (integration test should handle this)

**Estimated Effort:** 15 minutes

---

## Running Tests

```bash
# Run all unit tests for migration system
npm run test:unit -- tests/unit/migrate.test.ts

# Run all unit tests with coverage
npm run test:unit:coverage -- tests/unit/migrate.test.ts

# Run integration test (requires DATABASE_URL)
DATABASE_URL="postgresql://..." npm run test:integration -- tests/integration/migrate.integration.test.ts

# Watch mode (re-run on file changes)
npm run test:unit:watch -- tests/unit/migrate.test.ts
```

**Expected Initial Status:** All 29 tests FAIL (RED phase)  
**Expected After Implementation:** All 29 tests PASS (GREEN phase)

---

## Test Quality Metrics

### Test Design Quality

- ✅ **Deterministic:** All unit tests use mocked filesystem and database, no external dependencies
- ✅ **Isolated:** Each test sets up its own state, no shared state between tests
- ✅ **Explicit Assertions:** Clear Given-When-Then structure with specific expectations
- ✅ **Length:** All tests <50 lines, focused on single behavior
- ✅ **Execution Time:** Unit tests <1s each (mocked), integration test <5s (real database)

### Coverage Targets

- **Migration Script:** >90% coverage (all commands and error paths tested)
- **Integration Test:** Full lifecycle verification with real database

### Test ID Convention

All tests follow the format `[2.3-UNIT-###]` or `[2.3-INT-###]` where:
- `2.3` = Epic 2, Story 3
- `UNIT` = Unit test level / `INT` = Integration test level
- `###` = Sequential test number (001-028 for unit, 001 for integration)

---

## Knowledge Base References

This ATDD workflow consulted the following knowledge fragments:

- `test-quality.md` - Deterministic tests, isolated with cleanup, explicit assertions
- `test-levels-framework.md` - Unit testing strategy for CLI tools
- `test-priorities-matrix.md` - P0 priority for infrastructure migration system

**Additional Resources:**
- [Neon Sample Data - Periodic Table](https://neon.com/docs/import/import-sample-data#periodic-table-data) - Source data for sample migration

---

## Risks and Mitigations

### Risk: Migrations applied out of order

- **Impact:** Schema corruption, data loss
- **Mitigation:** Timestamp-based ordering, migration file naming convention
- **Test Coverage:** Tests `[2.3-UNIT-003]`, `[2.3-UNIT-004]` validate ordering

### Risk: Migration fails mid-execution

- **Impact:** Partial schema changes, inconsistent state
- **Mitigation:** Fail-fast behavior, stop on first error, manual rollback
- **Test Coverage:** Test `[2.3-UNIT-006]` validates fail-fast

### Risk: Production database accidentally modified

- **Impact:** Production downtime, data corruption
- **Mitigation:** Production warning, DATABASE_URL masking in logs
- **Test Coverage:** Tests `[2.3-UNIT-024]`, `[2.3-UNIT-026]` validate safety checks

### Risk: Rollback file missing

- **Impact:** Cannot rollback migration, manual SQL required
- **Mitigation:** Always create .down.sql file, error if missing
- **Test Coverage:** Test `[2.3-UNIT-013]` validates error handling

---

## Next Steps After Story 2.3

1. **Story 2.4:** Initial Database Schema Migration
   - Use migration system created in this story
   - Migrate role/pricing tables from `periodic_table.sql` to production schema
   - Depends on: Migration CLI from this story

2. **Story 2.5:** Database Connection Testing in Health Check
   - Update health endpoint to query database
   - Verify database connectivity on each deployment
   - Depends on: `lib/db.ts` from Story 2.2

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All tests written and failing (29 tests total)
- ✅ Unit tests cover all CLI commands (up, down, status, create)
- ✅ Integration test covers full migration lifecycle
- ✅ Mock requirements documented
- ✅ Implementation checklist created with clear steps

**Verification:**

- All tests run and fail as expected
- Failure: `scripts/migrate.js` does not exist
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Follow implementation checklist** (Steps 1-13)
2. **Implement migration CLI** (`scripts/migrate.js`)
3. **Add npm scripts** to `package.json`
4. **Create sample migration** with periodic table data
5. **Test manually** with real database
6. **Document migration workflow** in `docs/guides/database-migrations.md`
7. **Run tests** to verify all pass (GREEN)

**Key Principles:**

- Implement one command at a time (create → up → down → status)
- Test each command manually before moving to next
- Use test failures as guide for what to implement
- Reference story file for SQL examples and patterns

**Progress Tracking:**

- Check off implementation checklist tasks as you complete them
- Run tests frequently: `npm run test:unit -- tests/unit/migrate.test.ts`
- Share progress in daily standup

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (29/29 green)
2. **Review code for quality**:
   - Extract duplicate code (e.g., migration file reading)
   - Add helper functions for common operations
   - Improve error messages for clarity
3. **Optimize logging** (structured JSON format)
4. **Ensure tests still pass** after each refactor
5. **Update documentation** if CLI behavior changes

**Completion:**

- All tests pass
- Code is DRY (no duplications)
- Error messages are clear and actionable
- Logging is consistent and helpful
- Ready for Story 2.4 (initial schema migration)

---

## Approval

**ATDD Checklist Approved By:**

- [x] Test Architect: **Murat** Date: **2025-11-09**
- [ ] Development Team: **__________** Date: **__________**

**Ready for Implementation:** ✅ YES - All tests created in RED phase, implementation checklist complete

---

**Generated by**: Murat (Master Test Architect - TEA Agent)  
**Workflow**: `bmad/bmm/testarch/atdd`  
**Version**: 4.0 (BMad v6)  
**Date**: 2025-11-09

---

<!-- Powered by BMAD-CORE™ -->

