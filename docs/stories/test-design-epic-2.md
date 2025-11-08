# Test Design: Epic 2 - Database Infrastructure & Connectivity

**Date:** 2025-11-07  
**Author:** Murat (Master Test Architect)  
**Status:** Draft  
**Scope:** Full test design with risk assessment and priority classification

---

## Executive Summary

**Scope:** Comprehensive test design for Epic 2 (Database Infrastructure & Connectivity)

**Risk Summary:**

- Total risks identified: 12
- High-priority risks (≥6): 5
- Critical categories: DATA (data loss, migrations), SEC (credentials), PERF (cold starts), TECH (connection pooling)

**Coverage Summary:**

- P0 scenarios: 16 tests (32 hours)
- P1 scenarios: 20 tests (20 hours)
- P2/P3 scenarios: 14 tests (7 hours)
- **Total effort**: 59 hours (~7-8 days)

**Testing Strategy:** **Manual testing only** for Epic 2 per architecture decision. Automated test infrastructure will be added in Phase 2. This test design focuses on verification procedures, risk mitigation, and quality gates for database connectivity and schema management stories.

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description                                                                      | Probability | Impact | Score | Mitigation                                                    | Owner | Timeline      |
| ------- | -------- | -------------------------------------------------------------------------------- | ----------- | ------ | ----- | ------------------------------------------------------------- | ----- | ------------- |
| R-101   | DATA     | **Migration fails in production** - Schema changes break production database     | 2           | 3      | 6     | Test migrations in dev → staging before prod, rollback tested | Dev   | Story 2.3-2.4 |
| R-102   | SEC      | **DATABASE_URL leaked** - Connection string exposed in logs or code              | 2           | 3      | 6     | Secret Manager only, never in code/logs, audit                | Dev   | Story 2.1     |
| R-103   | DATA     | **Data corruption during migration** - Migration logic error corrupts data       | 2           | 3      | 6     | Backup before migration, test with sample data, idempotent    | Dev   | Story 2.4     |
| R-104   | PERF     | **Neon cold start >3s** - Database auto-suspend causes slow first query          | 3           | 2      | 6     | Document cold start behavior, health check timeout 3s         | Dev   | Story 2.2     |
| R-105   | TECH     | **Connection pool exhaustion** - Too many connections crash Cloud Run instances  | 2           | 3      | 6     | Use @neondatabase/serverless (HTTP-based), test connection    | Dev   | Story 2.2     |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description                                                           | Probability | Impact | Score | Mitigation                                 | Owner |
| ------- | -------- | --------------------------------------------------------------------- | ----------- | ------ | ----- | ------------------------------------------ | ----- |
| R-106   | TECH     | **Configuration validation fails silently** - Invalid env vars crash  | 2           | 2      | 4     | Zod validation with detailed error logs    | Dev   |
| R-107   | DATA     | **Migration rollback incomplete** - Rollback SQL missing or incorrect | 2           | 2      | 4     | Test rollback for every migration          | Dev   |
| R-108   | PERF     | **Query latency >200ms (warm)** - Slow queries impact UX             | 1           | 3      | 3     | Slow query logging, optimize queries       | Dev   |
| R-109   | OPS      | **Migration state tracking broken** - Duplicate migrations run        | 1           | 3      | 3     | Migrations table with unique constraints   | Dev   |
| R-110   | SEC      | **SQL injection vulnerability** - Unsanitized query inputs            | 1           | 3      | 3     | Parameterized queries only, code review    | Dev   |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description                                        | Probability | Impact | Score | Action  |
| ------- | -------- | -------------------------------------------------- | ----------- | ------ | ----- | ------- |
| R-111   | TECH     | **Neon free tier limits exceeded** - Compute hours | 1           | 2      | 2     | Monitor |
| R-112   | OPS      | **Database timezone mismatch** - Timestamp issues  | 1           | 1      | 1     | Monitor |

### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

## Test Coverage Plan

### P0 (Critical) - Must Verify Before Story Done

**Criteria**: Blocks database connectivity + High risk (≥6) + No workaround

| Requirement                                      | Test Level    | Risk Link     | Verification Method                              | Owner | Notes                           |
| ------------------------------------------------ | ------------- | ------------- | ------------------------------------------------ | ----- | ------------------------------- |
| **Neon databases created (all 3)**               | Setup         | R-101         | psql connection to dev, stg, prd                 | Dev   | Story 2.1                       |
| **DATABASE_URL in Secret Manager**               | Security      | R-102         | Verify secrets created, not in code              | Dev   | Story 2.1                       |
| **Cloud Run can access secrets**                 | Security      | R-102         | Test IAM permissions, verify injection           | Dev   | Story 2.1                       |
| **Configuration validation with Zod**            | Config        | R-106         | Test valid/invalid env vars, fail-fast           | Dev   | Story 2.2                       |
| **Database connection works from Cloud Run**     | Connection    | R-105         | Execute test query in dev environment            | Dev   | Story 2.2                       |
| **Neon driver handles cold starts**              | Performance   | R-104         | Wait 5min, execute query, measure latency <3s    | Dev   | Story 2.2                       |
| **Slow query logging active**                    | Observability | R-108         | Execute slow query (>200ms), verify log          | Dev   | Story 2.2                       |
| **Migration system tracks state**                | Migrations    | R-109         | Verify schema_migrations table exists            | Dev   | Story 2.3                       |
| **Migration up applies correctly**               | Migrations    | R-101         | Run migration, verify tables created             | Dev   | Story 2.3                       |
| **Migration down rollback works**                | Migrations    | R-107         | Rollback migration, verify tables removed        | Dev   | Story 2.3                       |
| **Initial schema migrated to all envs**          | Schema        | R-101         | Verify role_profiles table in dev, stg, prd      | Dev   | Story 2.4                       |
| **Schema consistent across environments**        | Schema        | R-103         | Compare schemas: dev vs stg vs prd               | Dev   | Story 2.4                       |
| **Health check includes database status**        | API           | R-101         | Verify `{ "database": "connected" }` in response | Dev   | Story 2.5                       |
| **Health check fails if database down**          | API           | R-101         | Simulate DB failure, verify 500 response         | Dev   | Story 2.5                       |
| **Parameterized queries used**                   | Security      | R-110         | Code review: no string interpolation in queries  | Dev   | Story 2.2                       |
| **No credentials in logs**                       | Security      | R-102         | Audit Cloud Run logs for DATABASE_URL patterns   | Dev   | Story 2.1, 2.2                  |

**Total P0**: 16 tests, 32 hours (~2 hours each due to multi-environment verification complexity)

---

### P1 (High) - Should Verify Before Story Done

**Criteria**: Important validations + Medium risk (3-4) + Common scenarios

| Requirement                                   | Test Level    | Risk Link | Verification Method                         | Owner | Notes                         |
| --------------------------------------------- | ------------- | --------- | ------------------------------------------- | ----- | ----------------------------- |
| **Neon connection strings valid format**      | Setup         | R-102     | Verify postgresql:// format with sslmode    | Dev   | Story 2.1                     |
| **TLS/SSL enabled on connections**            | Security      | R-102     | Verify sslmode=require in connection string | Dev   | Story 2.1                     |
| **Configuration module exports getConfig()**  | Config        | R-106     | Import getConfig(), verify type safety      | Dev   | Story 2.2                     |
| **Configuration validation error messages**   | Config        | R-106     | Test invalid config, verify clear errors    | Dev   | Story 2.2                     |
| **Query function returns results**            | Connection    | R-105     | Execute SELECT 1, verify result             | Dev   | Story 2.2                     |
| **Query function handles errors**             | Connection    | -         | Execute invalid query, verify error caught  | Dev   | Story 2.2                     |
| **Connection timeout set (5s)**               | Connection    | -         | Test slow query, verify timeout             | Dev   | Story 2.2                     |
| **Migration files have timestamps**           | Migrations    | R-109     | Verify YYYYMMDDHHMMSS format                | Dev   | Story 2.3                     |
| **Migration CLI commands documented**         | Docs          | -         | Verify npm run migrate:up/down/status       | Dev   | Story 2.3                     |
| **Migrations run in order (timestamp)**       | Migrations    | R-109     | Create 2 migrations, verify sequential      | Dev   | Story 2.3                     |
| **Migration idempotent (can re-run safely)**  | Migrations    | R-109     | Run same migration twice, verify no error   | Dev   | Story 2.3                     |
| **Sample data inserted for testing**          | Schema        | -         | Query role_profiles, verify rows exist      | Dev   | Story 2.4                     |
| **Indexes created on foreign keys**           | Schema        | -         | Verify indexes on career_path_id, etc.      | Dev   | Story 2.4                     |
| **Health check response time <3s (cold)**     | Performance   | R-104     | Measure cold start health check latency     | Dev   | Story 2.5                     |
| **Health check response time <500ms (warm)**  | Performance   | -         | Measure warm health check latency           | Dev   | Story 2.5                     |
| **Database errors logged server-side**        | Observability | -         | Trigger DB error, verify Cloud Run log      | Dev   | Story 2.2                     |
| **Neon setup documented with screenshots**    | Docs          | -         | Review docs/neon-infrastructure-setup.md    | Dev   | Story 2.6                     |
| **Secret Manager setup documented**           | Docs          | R-102     | Verify gcloud secrets commands              | Dev   | Story 2.6                     |
| **Migration workflow documented**             | Docs          | -         | Verify step-by-step migration instructions  | Dev   | Story 2.6                     |
| **Troubleshooting section complete**          | Docs          | -         | Verify common issues and solutions          | Dev   | Story 2.6                     |

**Total P1**: 20 tests, 20 hours (~1 hour each)

---

### P2 (Medium) - Nice to Verify (Nightly/Weekly)

**Criteria**: Secondary validations + Low risk (1-2) + Edge cases

| Requirement                                 | Test Level    | Risk Link | Verification Method                       | Owner | Notes                       |
| ------------------------------------------- | ------------- | --------- | ----------------------------------------- | ----- | --------------------------- |
| **Configuration module validates all vars** | Config        | -         | Test all env vars in schema               | Dev   | Story 2.2                   |
| **Configuration module transforms values**  | Config        | -         | Test ALLOWED_EMAILS split to array        | Dev   | Story 2.2                   |
| **Query function logs SQL text**            | Observability | -         | Verify query text in logs                 | Dev   | Story 2.2                   |
| **Query function logs parameters**          | Observability | -         | Verify params not logged (privacy)        | Dev   | Story 2.2                   |
| **Migration schema_migrations has PK**      | Migrations    | -         | Verify version column is primary key      | Dev   | Story 2.3                   |
| **Migration applied_at timestamp recorded** | Migrations    | -         | Check schema_migrations table             | Dev   | Story 2.3                   |
| **Role_profiles table structure correct**   | Schema        | -         | Verify columns match schema design        | Dev   | Story 2.4                   |
| **Profile_pricing table has foreign keys**  | Schema        | -         | Verify FK constraint to role_profiles     | Dev   | Story 2.4                   |
| **Career_paths table has unique name**      | Schema        | -         | Verify UNIQUE constraint on career_path   | Dev   | Story 2.4                   |
| **Health check timestamp format valid**     | API           | -         | Verify ISO 8601 timestamp in response     | Dev   | Story 2.5                   |
| **Health check JSON structure correct**     | API           | -         | Verify status, timestamp, database fields | Dev   | Story 2.5                   |
| **Neon free tier usage documented**         | Docs          | R-111     | Verify 100 compute hours/month limit      | Dev   | Story 2.6                   |
| **Connection string format documented**     | Docs          | -         | Verify postgresql:// format explanation   | Dev   | Story 2.6                   |
| **Local development setup documented**      | Docs          | -         | Verify .env.example with DATABASE_URL     | Dev   | Story 2.6                   |

**Total P2**: 14 tests, 7 hours (~0.5 hours each - simple checks)

---

### P3 (Low) - Test if Time Permits

**Criteria**: Nice-to-have + Exploratory + Optional validations

*No P3 tests defined for Epic 2.* Database infrastructure validation focuses on P0/P1 critical path. P3 tests (advanced query optimization, database backups, point-in-time recovery) are deferred to future phases.

**Total P3**: 0 tests

---

## Execution Order

### Smoke Tests (<2 min)

**Purpose**: Fast feedback, catch configuration issues immediately

- [ ] Configuration validation passes with valid env vars (20s) - **Story 2.2**
- [ ] Database connection succeeds (SELECT 1) (30s) - **Story 2.2**
- [ ] Health check includes database field (20s) - **Story 2.5**
- [ ] Migration system CLI available (10s) - **Story 2.3**

**Total**: 4 scenarios, ~80s

---

### P0 Tests (Critical Path - ~32 hours)

**Purpose**: Validate database connectivity and schema management end-to-end

**Story 2.1 - Neon PostgreSQL Setup** (6 hours):
- [ ] Three Neon databases created and accessible via psql
- [ ] DATABASE_URL stored in Google Secret Manager (all 3 environments)
- [ ] Cloud Run service accounts have access to secrets
- [ ] No credentials in code or logs

**Story 2.2 - Configuration and Connection** (8 hours):
- [ ] Zod configuration validation with fail-fast
- [ ] Database connection works from Cloud Run
- [ ] Neon cold start handled gracefully (<3s)
- [ ] Slow query logging active (>200ms)
- [ ] Parameterized queries enforced (code review)

**Story 2.3 - Migration System** (6 hours):
- [ ] Migration system tracks state (schema_migrations table)
- [ ] Migrations apply correctly (up)
- [ ] Migrations rollback correctly (down)

**Story 2.4 - Initial Schema Migration** (8 hours):
- [ ] Initial schema migrated to all three environments
- [ ] Schema consistent across dev, staging, production
- [ ] Tables queryable, sample data inserted

**Story 2.5 - Health Check Integration** (2 hours):
- [ ] Health check includes database connectivity status
- [ ] Health check fails gracefully if database down (500 response)

**Story 2.6 - Documentation** (2 hours):
- [ ] Neon setup documented
- [ ] Secret Manager documented
- [ ] Migration workflow documented

**Total**: 16 scenarios, ~32 hours (multi-environment verification is time-intensive)

---

### P1 Tests (Important Features - ~20 hours)

**Purpose**: Validate supporting database features

**Story-by-Story Verification** (20 tests across all 6 stories):
- Configuration validation (Zod schema, error messages)
- Connection handling (query function, error handling, timeouts)
- Migration system (CLI commands, ordering, idempotency)
- Schema integrity (foreign keys, indexes, constraints)
- Health check performance (<3s cold, <500ms warm)
- Documentation completeness (Neon setup, troubleshooting)

**Total**: 20 scenarios, ~20 hours

---

### P2 Tests (Nice-to-Have - ~7 hours)

**Purpose**: Secondary validations and documentation

**Story-by-Story Optional Checks** (14 tests):
- Configuration module edge cases
- Query logging (SQL text, parameter privacy)
- Migration table structure (PK, timestamps)
- Schema constraints (unique, foreign keys)
- Health check response format
- Documentation review (formats, examples)

**Total**: 14 scenarios, ~7 hours

---

## Resource Estimates

### Test Development Effort

| Priority  | Count  | Hours/Test | Total Hours | Notes                                                   |
| --------- | ------ | ---------- | ----------- | ------------------------------------------------------- |
| P0        | 16     | 2.0        | 32          | Multi-environment verification, migration testing       |
| P1        | 20     | 1.0        | 20          | Standard database operations, connection validation     |
| P2        | 14     | 0.5        | 7           | Simple checks, documentation review                     |
| P3        | 0      | -          | 0           | No P3 tests for Epic 2                                  |
| **Total** | **50** | **-**      | **59**      | **~7-8 days** (assuming 8-hour work days)               |

**Note:** Epic 2 uses **manual testing only** (no automated test development effort). Time estimates reflect verification and validation activities, not test automation development.

---

### Prerequisites

**Manual Testing Tools:**

- **psql**: PostgreSQL CLI for direct database connection testing
- **API Client**: curl, Postman, or httpie for health check testing
- **Browser**: For accessing Neon Console
- **gcloud CLI**: For Secret Manager operations
- **Text Editor**: For inspecting configuration files (Zod schemas, migration SQL)
- **Docker**: For local database testing (optional)

**Environment:**

- Neon PostgreSQL account (free tier)
- Google Secret Manager API enabled
- Cloud Run services from Epic 1 deployed (dev, staging, production)
- GitHub repository with Epic 1 CI/CD workflows
- Local development machine: Node.js 22.x, psql client

**Access Required:**

- Neon account with project creation permissions
- GCP Secret Manager write access
- Cloud Run environment variable update permissions
- GitHub repository write access (for migration files)

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 verification rate**: 100% (no exceptions - all must pass)
- **P1 verification rate**: ≥95% (1 waiver allowed with justification)
- **P2 verification rate**: ≥80% (informational, nice-to-have)
- **High-risk mitigations**: 100% complete (R-101 through R-105 must be addressed)

### Coverage Targets

- **Critical database connectivity**: 100% verified (connection → query → result)
- **Security scenarios**: 100% verified (DATABASE_URL never leaked, parameterized queries)
- **Migration scenarios**: 100% tested (up, down, idempotency in dev)
- **Multi-environment consistency**: 100% verified (schema consistent across dev, stg, prd)

### Non-Negotiable Requirements

- [ ] All P0 verification steps pass
- [ ] No high-risk (≥6) items unmitigated
- [ ] Security verification (R-102 - DATABASE_URL) passes 100%
- [ ] Migration rollback tested and documented (R-101, R-107)
- [ ] Database connection works from Cloud Run (R-105)
- [ ] Configuration validation fail-fast with Zod (R-106)

---

## Mitigation Plans

### R-101: Migration fails in production (Score: 6)

**Mitigation Strategy:**
- **Dev-first testing**: Test all migrations in dev environment first
- **Sequential promotion**: Dev → Staging → Production (never skip staging)
- **Idempotency**: Migrations use `IF NOT EXISTS` / `IF EXISTS` clauses
- **Rollback testing**: Test rollback (down migration) in dev before applying to staging
- **Backup strategy**: Document manual Neon backup procedure (Neon Console → Branches)
- **Health check validation**: Health check fails if migration breaks database

**Owner:** Dev (danielvm)  
**Timeline:** Story 2.3-2.4 (before first migration to staging)  
**Status:** Planned  
**Verification:** 
- Create test migration in dev: `migrations/999_test.sql`
- Apply migration: `npm run migrate:up`
- Verify tables created
- Rollback migration: `npm run migrate:down`
- Verify tables removed
- Apply to staging only after dev verification passes

---

### R-102: DATABASE_URL leaked (Score: 6)

**Mitigation Strategy:**
- **Secret Manager only**: Store DATABASE_URL in Google Secret Manager, never in code/env files
- **Inject at runtime**: Cloud Run services reference secrets via environment variables
- **Audit logs**: Search Cloud Run logs for `postgresql://` patterns
- **Mask in code**: Never log DATABASE_URL or connection strings
- **.gitignore enforcement**: Verify `.env` files excluded from git
- **Code review**: Review all database code for hardcoded credentials

**Owner:** Dev (danielvm)  
**Timeline:** Story 2.1 (before first database connection)  
**Status:** Planned  
**Verification:**
- Audit Cloud Run logs: `gcloud logging read --filter="postgresql://"` → 0 results
- Search codebase: `grep -r "postgresql://" src/ app/` → 0 results (except .env.example)
- Verify .gitignore: `.env` present, `.env.local` present
- Test with invalid DATABASE_URL → fail-fast with generic error (don't expose connection string)

---

### R-103: Data corruption during migration (Score: 6)

**Mitigation Strategy:**
- **Test with sample data**: Insert test data before migration, verify integrity after
- **Idempotent migrations**: Use `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE IF EXISTS`
- **Backup before production**: Document manual backup procedure (Neon Console → Branches)
- **Rollback capability**: Every migration has tested rollback SQL
- **Schema validation**: Compare schemas before/after migration
- **Dry-run in dev**: Always test in dev with realistic data volume

**Owner:** Dev (danielvm)  
**Timeline:** Story 2.4 (before initial schema migration)  
**Status:** Planned  
**Verification:**
- Insert test data: `INSERT INTO role_profiles VALUES (...)`
- Run migration: `npm run migrate:up`
- Verify data intact: `SELECT * FROM role_profiles` → data still present
- Verify new schema: `\d role_profiles` → new columns present
- Rollback: `npm run migrate:down`
- Verify data preserved or removed as expected

---

### R-104: Neon cold start >3s (Score: 6)

**Mitigation Strategy:**
- **Document cold start behavior**: Neon auto-suspends after 5min inactivity, 2-3s resume time
- **Health check timeout**: Set 3-second timeout (not 1 second)
- **Driver optimization**: Use `@neondatabase/serverless` (HTTP-based, optimized for cold starts)
- **No persistent connections**: Avoid traditional connection pools (pg-pool), use Neon HTTP driver
- **Measure and log**: Log database query latency, track cold starts
- **Accept tradeoff**: Cold starts acceptable for MVP (free tier), upgrade to paid tier for always-on

**Owner:** Dev (danielvm)  
**Timeline:** Story 2.2 (database connection setup)  
**Status:** Planned  
**Verification:**
- Wait 5+ minutes (Neon auto-suspend)
- Execute query: `SELECT 1`
- Measure latency → expect <3s
- Execute second query immediately
- Measure latency → expect <200ms (warm)
- Document actual cold start time in README

---

### R-105: Connection pool exhaustion (Score: 6)

**Mitigation Strategy:**
- **Use @neondatabase/serverless**: HTTP-based driver, no persistent connections
- **No manual pooling**: Neon driver handles pooling internally
- **Stateless queries**: Each query is independent (no connection state)
- **Test connection limits**: Simulate multiple Cloud Run instances querying simultaneously
- **Monitor connection count**: Check Neon Console → Usage → Active connections
- **Fail gracefully**: Query timeout (5s), retry with exponential backoff

**Owner:** Dev (danielvm)  
**Timeline:** Story 2.2 (database connection setup)  
**Status:** Planned  
**Verification:**
- Deploy to Cloud Run dev with 5 instances
- Generate concurrent requests: `ab -n 100 -c 10 https://dev-url/api/health`
- Verify all requests succeed (200 OK)
- Check Neon Console → Active connections (<10)
- Verify Cloud Run logs → No connection errors
- Measure query latency → <200ms (warm)

---

## Assumptions and Dependencies

### Assumptions

1. **Neon Free Tier Sufficient**: 3GB storage, 100 compute hours/month covers MVP testing
2. **Auto-Suspend Acceptable**: 2-3 second cold starts acceptable for infrastructure validation
3. **Manual Migrations Acceptable**: No automated migrations in CI/CD (manual execution before deploy)
4. **Single Developer**: Epic 2 assumes solo developer (danielvm), no concurrent migration conflicts
5. **Standard PostgreSQL**: Neon is standard PostgreSQL 17.0, no custom extensions needed
6. **No ORM Required**: Direct SQL via Neon driver sufficient (Prisma deferred to future)

### Dependencies

1. **Epic 1 Complete** - Required by Story 2.1 (Cloud Run services exist, Secret Manager API enabled)
2. **Neon Account** - Required by Story 2.1 (database creation)
3. **Google Secret Manager** - Required by Story 2.1 (DATABASE_URL storage)
4. **psql Client Installed** - Required by Story 2.1 (connection testing)
5. **Zod Library** - Required by Story 2.2 (configuration validation)
6. **@neondatabase/serverless** - Required by Story 2.2 (database connection)

### Risks to Plan

- **Risk**: Neon free tier compute hours exceeded (>100 hours/month)
  - **Impact**: Service suspended or charges incurred
  - **Contingency**: Monitor Neon usage, optimize queries, upgrade to paid tier if needed

- **Risk**: Migration system complexity underestimated
  - **Impact**: Manual migrations error-prone, require automation
  - **Contingency**: Use node-pg-migrate or Prisma Migrate, add migration tests

- **Risk**: Configuration validation Zod schema too complex
  - **Impact**: Startup failures difficult to debug
  - **Contingency**: Simplify schema, add detailed error messages, document examples

---

## Testing Strategy for Epic 2

### Manual Testing Rationale

Epic 2 uses **manual testing only** per architecture decision. Rationale:

1. **Infrastructure Setup**: Stories are configuration tasks (Neon account, Secret Manager, migrations)
2. **Low Test ROI**: Automated tests for database setup have low return on investment
3. **Human Verification Required**: Visual inspection of Neon Console, Secret Manager, psql output more efficient
4. **Phase 2 Automation**: Automated test framework (Vitest, Playwright) will be added in Phase 2

### Phase 2 Automated Testing (Future)

When automated testing is introduced (Phase 2):

**Unit Tests (Vitest)**:
- Configuration module (Zod validation)
- Query function error handling
- Database utilities (parameterized queries)

**Integration Tests (Vitest + Neon)**:
- Database connection (SELECT 1, SELECT version())
- Query execution (role_profiles table)
- Transaction handling
- Error scenarios (invalid query, timeout)

**API Tests (Playwright API or Supertest)**:
- Health check contract (200 OK, database field present)
- Health check with database failure (500 error)
- Health check performance (<3s cold, <500ms warm)

**Migration Tests (Custom Scripts)**:
- Migration up/down idempotency
- Schema validation after migration
- Data integrity preservation

---

## Verification Checklist

### Story 2.1 - Neon PostgreSQL Account and Database Setup

- [ ] Neon account created (free tier activated)
- [ ] Three databases created: `role_directory_dev`, `role_directory_stg`, `role_directory_prd`
- [ ] Connection strings copied from Neon Console
- [ ] Connection strings use format: `postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require`
- [ ] TLS/SSL enabled (sslmode=require in connection string)
- [ ] Can connect to each database via psql: `psql "postgresql://..."`
- [ ] Secrets created in Google Secret Manager:
  - `gcloud secrets create dev-database-url --data-file=<(echo "postgresql://...")`
  - `gcloud secrets create staging-database-url --data-file=<(echo "postgresql://...")`
  - `gcloud secrets create production-database-url --data-file=<(echo "postgresql://...")`
- [ ] Cloud Run service accounts granted secretAccessor role:
  - `gcloud secrets add-iam-policy-binding dev-database-url --member="..." --role="roles/secretmanager.secretAccessor"`
  - (Repeat for staging and production secrets)
- [ ] No DATABASE_URL in code, .env, or GitHub repository
- [ ] Documentation created or updated: `docs/neon-infrastructure-setup.md`

---

### Story 2.2 - Database Connection Configuration with Zod-Validated Config

- [ ] Zod library installed: `npm install zod`
- [ ] Configuration module created: `lib/config.ts`
- [ ] Zod schema validates all environment variables:
  - `databaseUrl`: string, URL format, starts with `postgresql://`
  - `allowedEmails`: string, transformed to array, validated as emails
  - `nodeEnv`: enum (development, staging, production)
  - `port`: string → number, validated as positive integer
- [ ] Configuration module exports `getConfig()` function
- [ ] Configuration module exports `Config` type (inferred from schema)
- [ ] Invalid configuration fails fast with detailed error messages
- [ ] Database connection module created: `lib/db.ts`
- [ ] Database module uses `@neondatabase/serverless` driver
- [ ] Database module imports `getConfig()` to get validated DATABASE_URL
- [ ] Database module exports `query(text, params)` function
- [ ] Query function uses parameterized queries (no string interpolation)
- [ ] Query function logs slow queries (>200ms)
- [ ] Query function logs errors (server-side only, not exposed to client)
- [ ] Query function handles Neon cold starts gracefully (2-3s acceptable)
- [ ] Query timeout set (5 seconds max)
- [ ] Can execute test query: `await query('SELECT 1')`
- [ ] Can execute query with parameters: `await query('SELECT * FROM role_profiles WHERE id = $1', [1])`
- [ ] Database errors return generic error to client (don't expose connection details)

---

### Story 2.3 - Database Schema Migration Setup

- [ ] Migration tool selected (node-pg-migrate, Prisma Migrate, or custom script)
- [ ] Migrations directory created: `migrations/`
- [ ] Migration CLI scripts added to `package.json`:
  - `"migrate:up": "node scripts/migrate.js up"`
  - `"migrate:down": "node scripts/migrate.js down"`
  - `"migrate:status": "node scripts/migrate.js status"`
  - `"migrate:create": "node scripts/migrate.js create"`
- [ ] Migration system creates `schema_migrations` table to track state
- [ ] Migration file format: `YYYYMMDDHHMMSS_migration_name.sql`
- [ ] Migrations run in timestamp order (oldest first)
- [ ] Can create new migration: `npm run migrate:create -- test_migration`
- [ ] Can apply migration: `npm run migrate:up`
- [ ] Can rollback migration: `npm run migrate:down`
- [ ] Can check migration status: `npm run migrate:status`
- [ ] Migrations are idempotent (can re-run safely)
- [ ] Migration state tracked in `schema_migrations` table
- [ ] Rollback tested at least once in dev environment
- [ ] Migration workflow documented in README or `docs/DATABASE.md`

---

### Story 2.4 - Initial Database Schema Migration (Existing Tables)

- [ ] Migration file created: `migrations/001_create_role_tables.sql`
- [ ] Migration includes CREATE TABLE statements:
  - `career_paths` (career_path_id SERIAL PRIMARY KEY, career_path_name VARCHAR UNIQUE, ...)
  - `role_profiles` (role_profile_id SERIAL PRIMARY KEY, career_path_id FK, ...)
  - `profile_pricing` (profile_pricing_id SERIAL PRIMARY KEY, role_profile_id FK, ...)
- [ ] Migration includes indexes:
  - `idx_role_profiles_career_path` ON `role_profiles(career_path_id)`
  - `idx_profile_pricing_role_profile` ON `profile_pricing(role_profile_id)`
  - `idx_profile_pricing_region` ON `profile_pricing(region)`
- [ ] Migration applied to dev database: `DATABASE_URL=dev npm run migrate:up`
- [ ] Migration applied to staging database: `DATABASE_URL=staging npm run migrate:up`
- [ ] Migration applied to production database: `DATABASE_URL=production npm run migrate:up`
- [ ] Can query tables in all three environments: `SELECT * FROM role_profiles LIMIT 1`
- [ ] Schema consistent across dev, staging, production: `\d role_profiles` matches
- [ ] Sample data inserted (optional): `INSERT INTO role_profiles VALUES (...)`
- [ ] Can query sample data: `SELECT COUNT(*) FROM role_profiles`
- [ ] Schema documented in `docs/DATABASE.md` or comments in migration file

---

### Story 2.5 - Database Connection Testing in Health Check

- [ ] Health check endpoint updated: `app/api/health/route.ts`
- [ ] Health check imports database module: `import { query } from '@/lib/db'`
- [ ] Health check executes database query: `await query('SELECT 1')`
- [ ] Health check uses 2-second timeout for database query
- [ ] Health check returns success response when database connected:
  - Status code: 200 OK
  - Body: `{ "status": "ok", "timestamp": "ISO 8601", "database": "connected" }`
- [ ] Health check returns error response when database fails:
  - Status code: 500 Internal Server Error
  - Body: `{ "status": "error", "timestamp": "ISO 8601", "database": "disconnected" }`
- [ ] Database errors logged server-side (not exposed in response)
- [ ] Health check tested locally: `curl http://localhost:3000/api/health`
- [ ] Health check tested in dev: `curl https://dev-url/api/health`
- [ ] Health check response time <3s (cold start acceptable)
- [ ] Health check response time <500ms (warm)
- [ ] Health check handles Neon cold start gracefully (2-3s resume time)

---

### Story 2.6 - Environment-Specific Database Configuration Documentation

- [ ] Documentation created or updated: `docs/neon-infrastructure-setup.md`
- [ ] Documentation includes Neon account setup steps
- [ ] Documentation includes database creation steps (with screenshots if helpful)
- [ ] Documentation includes connection string format explanation
- [ ] Documentation includes Google Secret Manager setup commands:
  - `gcloud secrets create dev-database-url --data-file=-`
  - `gcloud secrets add-iam-policy-binding dev-database-url --member=... --role=...`
  - (Repeat for staging and production)
- [ ] Documentation includes Cloud Run secret injection commands:
  - `gcloud run services update role-directory-dev --set-secrets=DATABASE_URL=dev-database-url:latest`
- [ ] Documentation includes local development setup (.env file with DATABASE_URL)
- [ ] Documentation includes migration workflow (npm run migrate:up/down/status)
- [ ] Documentation includes troubleshooting section:
  - Connection refused (Neon auto-suspend, wait 2-3s)
  - SSL errors (verify sslmode=require)
  - Cold start delays (expected, <3s acceptable)
  - Permission denied (verify IAM secretAccessor role)
- [ ] Documentation links to Neon docs and GCP Secret Manager docs
- [ ] Security best practices noted (never commit DATABASE_URL)

---

## Phase 2 Transition Plan

### Automated Testing Framework Integration

After Epic 2 completes, Phase 2 will integrate automated tests:

**Step 1: Unit Tests for Configuration Module**
- Test Zod schema validation (valid/invalid env vars)
- Test configuration transformations (ALLOWED_EMAILS split)
- Test fail-fast behavior (startup crashes on invalid config)

**Step 2: Integration Tests for Database Connection**
- Test query function (SELECT 1, SELECT version())
- Test parameterized queries (prevent SQL injection)
- Test error handling (invalid query, timeout)
- Test slow query logging (>200ms)

**Step 3: API Tests for Health Check**
- Test health check with database connected (200 OK)
- Test health check with database disconnected (500 error)
- Test health check response format (status, timestamp, database fields)
- Test health check performance (<3s cold, <500ms warm)

**Step 4: Migration Tests**
- Test migration up/down idempotency
- Test migration ordering (timestamp-based)
- Test schema validation after migration
- Test data integrity preservation

**Step 5: CI/CD Integration**
- Add test stage to GitHub Actions workflow (after Story 1.3)
- Run unit tests on every commit (fast feedback)
- Run integration tests on deployment to dev (post-deploy validation)
- Fail deployment if tests fail

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: **__________** Date: **__________**
- [ ] Tech Lead: **__________** Date: **__________**
- [ ] QA Lead: **__________** Date: **__________**

**Comments:**

---

## Appendix

### Knowledge Base References

- `risk-governance.md` - Risk classification framework (6 categories, probability × impact scoring)
- `probability-impact.md` - Risk scoring methodology (1-3 scale, thresholds)
- `test-levels-framework.md` - Test level selection (E2E, API, Component, Unit decision matrix)
- `test-priorities-matrix.md` - P0-P3 prioritization criteria (automated calculation, risk mapping)

### Related Documents

- **PRD**: `docs/2-planning/PRD.md` - Product requirements and database infrastructure goals
- **Epic**: `docs/2-planning/epics.md#Epic-2` - Epic 2 story breakdown and acceptance criteria
- **Architecture**: `docs/3-solutioning/architecture.md` - Database architecture, Neon PostgreSQL, configuration patterns
- **Tech Spec**: `docs/3-solutioning/tech-spec-epic-2.md` - Epic 2 technical specification, API contracts, Zod schemas

### Test Execution Tracking

| Story | P0 Tests | P1 Tests | P2 Tests | Status     | Notes                     |
| ----- | -------- | -------- | -------- | ---------- | ------------------------- |
| 2.1   | 3        | 2        | 0        | 🔵 Ready   | Neon setup                |
| 2.2   | 5        | 6        | 4        | 🔵 Ready   | Configuration & connection|
| 2.3   | 3        | 4        | 3        | 🔵 Ready   | Migration system          |
| 2.4   | 2        | 3        | 4        | 🔵 Ready   | Initial schema            |
| 2.5   | 2        | 3        | 2        | 🔵 Ready   | Health check integration  |
| 2.6   | 1        | 2        | 1        | 🔵 Ready   | Documentation             |
| **Total** | **16** | **20** | **14** | **-**  | **50 tests total**        |

---

**Generated by**: Murat (Master Test Architect - TEA Agent)  
**Workflow**: `bmad/bmm/testarch/test-design`  
**Version**: 4.0 (BMad v6)  
**Date**: 2025-11-07

---

<!-- Powered by BMAD-CORE™ -->

