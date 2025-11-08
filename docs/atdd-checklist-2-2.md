# ATDD Checklist - Epic 2, Story 2.2: Database Connection Configuration with Zod-Validated Config

**Date:** 2025-11-07  
**Author:** Murat (Master Test Architect)  
**Primary Test Level:** Unit (Configuration and Database modules)

---

## Story Summary

Create type-safe configuration management with Zod validation and reliable database connectivity using the Neon serverless driver. This story establishes the foundation for all database interactions in Epic 2.

**As a** developer  
**I want** a type-safe configuration module with Zod validation and a database connection module with proper pooling  
**So that** the application validates configuration on startup and can reliably connect to PostgreSQL from Cloud Run

---

## Acceptance Criteria

### Configuration Module (`lib/config.ts`)

1. ✅ Uses Zod to validate all required environment variables
2. ✅ Validates `DATABASE_URL` is a valid PostgreSQL URL
3. ✅ Validates `ALLOWED_EMAILS` contains valid email addresses
4. ✅ Parses and transforms configuration (split emails, parse port)
5. ✅ Provides type-safe `getConfig()` function
6. ✅ Fails fast with detailed error messages if configuration is invalid

### Database Connection Module (`lib/db.ts`)

7. ✅ Uses `getConfig()` to get validated `DATABASE_URL`
8. ✅ Uses `@neondatabase/serverless` driver (built-in pooling)
9. ✅ Handles Neon cold starts gracefully (2-3 second resume time)
10. ✅ Logs slow queries (>200ms)
11. ✅ Provides `query()` function with parameterized query support
12. ✅ Connection failures throw descriptive errors (not raw database errors)
13. ✅ Handles connection timeouts (5 seconds max wait)
14. ✅ Connections are properly released after use (no leaks)

---

## Failing Tests Created (RED Phase)

### Unit Tests - Configuration Module (24 tests)

**File:** `tests/unit/config.test.ts` (415 lines)

#### DATABASE_URL Validation (6 tests)

- ✅ **Test:** `[2.2-UNIT-001] should accept valid PostgreSQL connection string`
  - **Status:** RED - Module `@/lib/config` does not exist
  - **Verifies:** Valid postgresql:// URLs with all components are accepted

- ✅ **Test:** `[2.2-UNIT-002] should reject non-PostgreSQL URL`
  - **Status:** RED - Module does not exist
  - **Verifies:** Non-PostgreSQL URLs (mysql://, http://) are rejected

- ✅ **Test:** `[2.2-UNIT-003] should reject DATABASE_URL without sslmode=require`
  - **Status:** RED - Module does not exist
  - **Verifies:** SSL requirement enforcement (policy decision required)

- ✅ **Test:** `[2.2-UNIT-004] should reject missing DATABASE_URL`
  - **Status:** RED - Module does not exist
  - **Verifies:** DATABASE_URL is required (not optional)

- ✅ **Test:** `[2.2-UNIT-005] should reject invalid URL format`
  - **Status:** RED - Module does not exist
  - **Verifies:** Malformed URLs are rejected with clear error

#### ALLOWED_EMAILS Validation (6 tests)

- ✅ **Test:** `[2.2-UNIT-006] should parse comma-separated emails into array`
  - **Status:** RED - Module does not exist
  - **Verifies:** CSV email list transformation to array

- ✅ **Test:** `[2.2-UNIT-007] should trim whitespace from emails`
  - **Status:** RED - Module does not exist
  - **Verifies:** Extra whitespace is removed from emails

- ✅ **Test:** `[2.2-UNIT-008] should convert emails to lowercase`
  - **Status:** RED - Module does not exist
  - **Verifies:** Email normalization for case-insensitive comparison

- ✅ **Test:** `[2.2-UNIT-009] should reject invalid email format`
  - **Status:** RED - Module does not exist
  - **Verifies:** Zod email validation rejects malformed emails

- ✅ **Test:** `[2.2-UNIT-010] should accept single email`
  - **Status:** RED - Module does not exist
  - **Verifies:** Single email (no commas) is handled correctly

- ✅ **Test:** `[2.2-UNIT-011] should reject missing ALLOWED_EMAILS`
  - **Status:** RED - Module does not exist
  - **Verifies:** ALLOWED_EMAILS is required (policy decision)

#### NODE_ENV Validation (5 tests)

- ✅ **Test:** `[2.2-UNIT-012] should accept development environment`
  - **Status:** RED - Module does not exist
  - **Verifies:** 'development' is valid NODE_ENV

- ✅ **Test:** `[2.2-UNIT-013] should accept staging environment`
  - **Status:** RED - Module does not exist
  - **Verifies:** 'staging' is valid NODE_ENV

- ✅ **Test:** `[2.2-UNIT-014] should accept production environment`
  - **Status:** RED - Module does not exist
  - **Verifies:** 'production' is valid NODE_ENV

- ✅ **Test:** `[2.2-UNIT-015] should reject invalid NODE_ENV`
  - **Status:** RED - Module does not exist
  - **Verifies:** Invalid values are rejected

- ✅ **Test:** `[2.2-UNIT-016] should default to development if NODE_ENV missing`
  - **Status:** RED - Module does not exist
  - **Verifies:** Default value fallback works

#### PORT Validation (5 tests)

- ✅ **Test:** `[2.2-UNIT-017] should parse PORT as number`
  - **Status:** RED - Module does not exist
  - **Verifies:** String PORT is converted to number type

- ✅ **Test:** `[2.2-UNIT-018] should default to 8080 if PORT missing`
  - **Status:** RED - Module does not exist
  - **Verifies:** Default port for Cloud Run

- ✅ **Test:** `[2.2-UNIT-019] should reject non-numeric PORT`
  - **Status:** RED - Module does not exist
  - **Verifies:** Invalid port values are rejected

- ✅ **Test:** `[2.2-UNIT-020] should reject negative PORT`
  - **Status:** RED - Module does not exist
  - **Verifies:** Port range validation (positive only)

- ✅ **Test:** `[2.2-UNIT-021] should reject PORT > 65535`
  - **Status:** RED - Module does not exist
  - **Verifies:** Port range validation (max 65535)

#### Error Handling (2 tests)

- ✅ **Test:** `[2.2-UNIT-022] should provide detailed error message for invalid config`
  - **Status:** RED - Module does not exist
  - **Verifies:** Multiple validation errors are reported

- ✅ **Test:** `[2.2-UNIT-023] should provide field-specific error messages`
  - **Status:** RED - Module does not exist
  - **Verifies:** Error messages identify problematic fields

#### Type Safety (1 test)

- ✅ **Test:** `[2.2-UNIT-024] should export Config type`
  - **Status:** RED - Module does not exist
  - **Verifies:** TypeScript type is exported and usable

---

### Unit Tests - Database Module (17 tests)

**File:** `tests/unit/db.test.ts` (320 lines)

#### Basic Query Functionality (4 tests)

- ✅ **Test:** `[2.2-UNIT-025] should execute SELECT 1 query successfully`
  - **Status:** RED - Module `@/lib/db` does not exist
  - **Verifies:** Basic database connectivity check works

- ✅ **Test:** `[2.2-UNIT-026] should execute SELECT version() query successfully`
  - **Status:** RED - Module does not exist
  - **Verifies:** Database version query returns expected data

- ✅ **Test:** `[2.2-UNIT-027] should support parameterized queries`
  - **Status:** RED - Module does not exist
  - **Verifies:** SQL injection protection via parameterized queries

- ✅ **Test:** `[2.2-UNIT-028] should handle empty result sets`
  - **Status:** RED - Module does not exist
  - **Verifies:** Queries with zero results return empty array

#### Error Handling (2 tests)

- ✅ **Test:** `[2.2-UNIT-029] should throw descriptive error for invalid SQL`
  - **Status:** RED - Module does not exist
  - **Verifies:** SQL syntax errors are caught and wrapped

- ✅ **Test:** `[2.2-UNIT-030] should log database errors without exposing details to caller`
  - **Status:** RED - Module does not exist
  - **Verifies:** Raw database errors are logged server-side only

#### Slow Query Logging (2 tests)

- ✅ **Test:** `[2.2-UNIT-031] should log warning for queries >200ms`
  - **Status:** RED - Module does not exist
  - **Verifies:** Slow query detection and logging works

- ✅ **Test:** `[2.2-UNIT-032] should NOT log warning for fast queries <200ms`
  - **Status:** RED - Module does not exist
  - **Verifies:** Fast queries don't trigger slow query warnings

#### Configuration Integration (2 tests)

- ✅ **Test:** `[2.2-UNIT-033] should use validated DATABASE_URL from getConfig()`
  - **Status:** RED - Module does not exist
  - **Verifies:** Database module imports and uses configuration

- ✅ **Test:** `[2.2-UNIT-034] should fail gracefully if configuration is invalid`
  - **Status:** RED - Module does not exist
  - **Verifies:** Invalid config at initialization is handled

#### Connection Timeout (2 tests)

- ✅ **Test:** `[2.2-UNIT-035] should handle connection timeouts`
  - **Status:** RED - Module does not exist
  - **Verifies:** Long-running queries timeout appropriately

- ✅ **Test:** `[2.2-UNIT-036] should set reasonable timeout (5 seconds max)`
  - **Status:** RED - Module does not exist
  - **Verifies:** Timeout threshold is documented

#### SQL Injection Prevention (2 tests)

- ✅ **Test:** `[2.2-UNIT-037] should prevent SQL injection via parameterized queries`
  - **Status:** RED - Module does not exist
  - **Verifies:** Malicious input is safely escaped

- ✅ **Test:** `[2.2-UNIT-038] should support multiple parameters`
  - **Status:** RED - Module does not exist
  - **Verifies:** Multiple query parameters work correctly

#### Neon Cold Start (1 test)

- ✅ **Test:** `[2.2-UNIT-039] should handle Neon database cold start (2-3s delay)`
  - **Status:** RED - Module does not exist
  - **Verifies:** Cold start behavior is documented and tested

#### Security (2 tests)

- ✅ **Test:** `[2.2-UNIT-040] should not expose DATABASE_URL in error messages`
  - **Status:** RED - Module does not exist
  - **Verifies:** Connection strings are never leaked to client

- ✅ **Test:** `[2.2-UNIT-041] should provide generic error message to caller`
  - **Status:** RED - Module does not exist
  - **Verifies:** User-friendly errors (not raw database errors)

---

## Data Factories Created

**No data factories required for this story.** Configuration and database modules are infrastructure code that don't require test data generation. Factories will be created in Story 2.4 (Initial Schema Migration) for role/pricing data.

---

## Fixtures Created

**No custom fixtures required for this story.** Unit tests use mocked configuration and database connections. No state setup/teardown beyond environment variable manipulation is needed.

---

## Mock Requirements

### Neon Serverless Driver Mock

**Module:** `@neondatabase/serverless`

**Mock Strategy:** Vi mock in unit tests

**Success Behavior:**

```typescript
// Mock returns array of results
const mockResult = [{ column: 'value' }];
```

**Failure Behavior:**

```typescript
// Mock throws error for invalid SQL
throw new Error('Syntax error in SQL');
```

**Notes:**
- Unit tests mock the Neon driver to avoid real database connections
- Integration tests with real database will be added in Phase 2
- Mock simulates cold start delays for testing

---

## Required data-testid Attributes

**None required for this story.** This story implements backend infrastructure modules (configuration and database connection) with no UI components. Data-testid attributes will be needed in Epic 3 (Authentication) and Epic 4 (Dashboard).

---

## Implementation Checklist

### Step 1: Create Configuration Module (`lib/config.ts`)

**Tests to pass:** `[2.2-UNIT-001]` through `[2.2-UNIT-024]` (24 tests)

**Tasks:**

- [ ] Create `lib/config.ts` file
- [ ] Import Zod: `import { z } from 'zod'`
- [ ] Define Zod schema for environment variables:
  - `databaseUrl`: `z.string().url().startsWith('postgresql://')`
  - `allowedEmails`: `z.string().transform(s => s.split(',').map(e => e.trim().toLowerCase())).pipe(z.array(z.string().email()))`
  - `nodeEnv`: `z.enum(['development', 'staging', 'production']).default('development')`
  - `port`: `z.string().default('8080').transform(Number).pipe(z.number().int().positive().max(65535))`
- [ ] Create `getConfig()` function that:
  - Calls `configSchema.safeParse(process.env)`
  - Returns `parsed.data` if successful
  - Throws detailed error if validation fails
- [ ] Export `Config` type: `export type Config = z.infer<typeof configSchema>`
- [ ] Run tests: `npm run test:unit -- tests/unit/config.test.ts`
- [ ] ✅ All 24 configuration tests pass (GREEN phase)

**Estimated Effort:** 1 hour

**Reference:** `docs/3-solutioning/tech-spec-epic-2.md` (Configuration Module section, lines 150-195)

---

### Step 2: Create Database Connection Module (`lib/db.ts`)

**Tests to pass:** `[2.2-UNIT-025]` through `[2.2-UNIT-041]` (17 tests)

**Tasks:**

- [ ] Create `lib/db.ts` file
- [ ] Import dependencies:
  - `import { neon } from '@neondatabase/serverless'`
  - `import { getConfig } from '@/lib/config'`
- [ ] Initialize connection:
  - `const config = getConfig()`
  - `const sql = neon(config.databaseUrl)`
- [ ] Implement `query()` function:
  - Accept `text: string` and `params?: any[]` parameters
  - Measure query execution time (`Date.now()` before/after)
  - Execute query: `const result = await sql(text, params)`
  - Log slow queries (>200ms): `console.warn('[DB] Slow query', { duration, text })`
  - Catch errors and log: `console.error('[DB] Query error', { text, error })`
  - Throw generic error: `throw new Error('Database query failed')`
  - Return result
- [ ] Export `query` function
- [ ] Run tests: `npm run test:unit -- tests/unit/db.test.ts`
- [ ] ✅ All 17 database tests pass (GREEN phase)

**Estimated Effort:** 1 hour

**Reference:** `docs/3-solutioning/tech-spec-epic-2.md` (Database Module section, lines 98-114)

---

### Step 3: Integration Verification

**Tasks:**

- [ ] Run all unit tests: `npm run test:unit`
- [ ] Verify both config and db test suites pass (41 tests total)
- [ ] Check test coverage: `npm run test:unit:coverage`
- [ ] Target: >90% coverage for both modules
- [ ] Update sprint status: Mark Story 2.2 as "in-progress" or "done"

**Estimated Effort:** 0.5 hours

---

### Step 4: Manual Verification (Optional)

**Tasks:**

- [ ] Create `.env.local` with test DATABASE_URL:
  ```
  DATABASE_URL=postgresql://user:password@localhost/test?sslmode=require
  ALLOWED_EMAILS=test@example.com
  NODE_ENV=development
  PORT=8080
  ```
- [ ] Run Next.js dev server: `npm run dev`
- [ ] Verify configuration loads without errors
- [ ] Check console logs for configuration validation success
- [ ] Test with invalid config (missing DATABASE_URL) → verify error message

**Estimated Effort:** 0.5 hours

---

## Running Tests

```bash
# Run all failing tests for this story
npm run test:unit

# Run only configuration tests
npm run test:unit -- tests/unit/config.test.ts

# Run only database tests
npm run test:unit -- tests/unit/db.test.ts

# Run with coverage
npm run test:unit:coverage

# Watch mode (re-run on file changes)
npm run test:unit:watch
```

**Expected Initial Status:** All 41 tests FAIL (RED phase)  
**Expected After Implementation:** All 41 tests PASS (GREEN phase)

---

## Test Quality Metrics

### Test Design Quality

- ✅ **Deterministic:** All tests use environment variable control, no external dependencies
- ✅ **Isolated:** Each test sets up its own environment, no shared state
- ✅ **Explicit Assertions:** Clear Given-When-Then structure with specific expectations
- ✅ **Length:** All tests <50 lines, focused on single behavior
- ✅ **Execution Time:** All tests <1s each (no real database connections)

### Coverage Targets

- **Configuration Module:** 100% coverage (all validation paths tested)
- **Database Module:** >80% coverage (core functionality + error paths)

### Test ID Convention

All tests follow the format `[2.2-UNIT-###]` where:
- `2.2` = Epic 2, Story 2
- `UNIT` = Test level (Unit tests)
- `###` = Sequential test number (001-041)

---

## Knowledge Base References

This ATDD workflow consulted the following knowledge fragments:

- `fixture-architecture.md` - Not applicable (no fixtures needed for unit tests)
- `data-factories.md` - Not applicable (no test data needed for infrastructure)
- `test-quality.md` - Deterministic tests, isolated with cleanup, explicit assertions
- `test-levels-framework.md` - Unit testing strategy for pure business logic
- `test-priorities-matrix.md` - P0 priority for infrastructure validation

---

## Risks and Mitigations

### Risk: Configuration validation too strict

- **Impact:** Application fails to start in valid scenarios
- **Mitigation:** Review Zod schema with PRD requirements, test with real env vars
- **Test Coverage:** Tests `[2.2-UNIT-001]` through `[2.2-UNIT-011]` validate flexibility

### Risk: DATABASE_URL format varies

- **Impact:** Valid Neon connection strings rejected
- **Mitigation:** Test with actual Neon format (ep-*.*.neon.tech)
- **Test Coverage:** Test `[2.2-UNIT-001]` uses realistic Neon format

### Risk: Neon cold start not handled

- **Impact:** First query times out after auto-suspend
- **Mitigation:** Document behavior, set 3s timeout in health check
- **Test Coverage:** Test `[2.2-UNIT-039]` validates cold start handling

---

## Next Steps After Story 2.2

1. **Story 2.3:** Database Schema Migration Setup
   - Create migration CLI system
   - Depends on: `lib/db.ts` from this story

2. **Story 2.4:** Initial Database Schema Migration
   - Migrate role/pricing tables
   - Depends on: Migration system from Story 2.3

3. **Story 2.5:** Database Connection Testing in Health Check
   - Update health endpoint to use `query()` function
   - Depends on: `lib/db.ts` from this story

---

## Approval

**ATDD Checklist Approved By:**

- [ ] Test Architect: **Murat** Date: **2025-11-07**
- [ ] Development Team: **__________** Date: **__________**

**Ready for Implementation:** ✅ YES - All tests created in RED phase, implementation checklist complete

---

**Generated by**: Murat (Master Test Architect - TEA Agent)  
**Workflow**: `bmad/bmm/testarch/atdd`  
**Version**: 4.0 (BMad v6)  
**Date**: 2025-11-07

---

<!-- Powered by BMAD-CORE™ -->

