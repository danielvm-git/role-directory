# Epic Technical Specification: Database Infrastructure & Connectivity

Date: 2025-11-06  
Author: danielvm  
Epic ID: 2  
Status: Draft

---

## Overview

Epic 2 establishes reliable PostgreSQL database connectivity from the serverless Cloud Run environment, handling Neon PostgreSQL's auto-suspend behavior and serverless constraints (cold starts, connection pooling). This epic provides the database foundation required for authentication (Epic 3) and dashboard features (Epic 4).

The primary challenge addressed is **serverless-optimized database connectivity**: Neon databases auto-suspend after inactivity, causing 2-3 second cold starts on first connection. The `@neondatabase/serverless` driver with built-in HTTP-based pooling is specifically designed to handle this serverless pattern, avoiding traditional connection pooling issues.

Success means any Cloud Run service can reliably query PostgreSQL with acceptable latency (<200ms warm, <3s cold start), database schema can be managed consistently across all three environments, and the health check endpoint validates database connectivity on every deployment.

## Objectives and Scope

**In Scope:**
- Neon PostgreSQL account and three separate databases (dev, staging, production)
- Type-safe configuration module with Zod validation for environment variables
- Database connection module using `@neondatabase/serverless` driver
- Database schema migration system (manual CLI-based migrations)
- Initial database schema migration (existing role/pricing tables)
- Health check endpoint integration to verify database connectivity
- Environment-specific database configuration documentation
- Google Secret Manager integration for DATABASE_URL credentials
- Slow query logging (>200ms) for performance monitoring

**Out of Scope:**
- Prisma ORM or other ORMs (direct SQL via Neon driver)
- Automated schema migrations in CI/CD (manual migrations acceptable for MVP)
- Database backups and point-in-time recovery (Neon free tier limitations)
- Connection pooling infrastructure (Neon driver handles this)
- Query optimization and indexing strategy (basic indexes only)
- Database monitoring dashboards (Cloud Run logs sufficient)
- Advanced database features (triggers, stored procedures, views)
- Multi-tenant database architecture
- Database seeding automation (manual sample data insertion acceptable)

**Success Criteria:**
- ✅ All three Neon databases created and accessible via psql
- ✅ Configuration module validates DATABASE_URL and other env vars on startup
- ✅ Database connection works from Cloud Run in all three environments
- ✅ Migration system can apply and rollback schema changes
- ✅ Existing role/pricing tables migrated to all environments
- ✅ Health check endpoint returns database connectivity status
- ✅ Query latency <200ms (warm), <3s (cold start with Neon resume)
- ✅ Documentation covers Neon setup, Secret Manager, and troubleshooting
- ✅ No connection leaks or resource exhaustion under normal load

## System Architecture Alignment

**Architecture Components Used:**
- **Database**: Neon PostgreSQL 17.0 (serverless, auto-suspend)
- **Database Client**: `@neondatabase/serverless` v0.10.1 (HTTP-based pooling)
- **Configuration**: Zod v3.23.8 for runtime validation and type inference
- **Secrets Management**: Google Secret Manager for DATABASE_URL (runtime injection)
- **Migration Tool**: Custom Node.js script or node-pg-migrate
- **Logging**: Structured JSON to stdout (Cloud Run captures)

**Architecture Patterns Applied:**
1. **Configuration Management Pattern** (architecture.md):
   - Zod schema for all environment variables
   - Fail-fast validation on application startup
   - Type-safe `getConfig()` function with inferred types
   - Example:
     ```typescript
     import { z } from 'zod';
     const configSchema = z.object({
       databaseUrl: z.string().url().startsWith('postgresql://'),
       allowedEmails: z.string().transform(s => s.split(',').map(e => e.trim())),
       nodeEnv: z.enum(['development', 'staging', 'production']),
       port: z.string().transform(Number).pipe(z.number().int().positive()),
     });
     export const getConfig = () => {
       const parsed = configSchema.safeParse(process.env);
       if (!parsed.success) {
         throw new Error(`Invalid configuration: ${parsed.error.message}`);
       }
       return parsed.data;
     };
     ```

2. **Database Connection Pattern** (architecture.md):
   - Use `@neondatabase/serverless` driver (not pg or pg-pool)
   - Simple `query()` function with parameterized query support
   - Slow query logging for performance monitoring (>200ms)
   - Connection timeout handling (5 seconds max wait)
   - Example:
     ```typescript
     import { neon } from '@neondatabase/serverless';
     import { getConfig } from '@/lib/config';
     
     const config = getConfig();
     const sql = neon(config.databaseUrl);
     
     export async function query(text: string, params?: any[]) {
       const start = Date.now();
       try {
         const result = await sql(text, params);
         const duration = Date.now() - start;
         if (duration > 200) {
           console.warn(`[DB] Slow query (${duration}ms): ${text}`);
         }
         return result;
       } catch (error) {
         console.error('[DB] Query error:', { text, error });
         throw new Error('Database query failed');
       }
     }
     ```

3. **Health Check Integration** (architecture.md):
   - Health check endpoint queries database to verify connectivity
   - Simple query: `SELECT 1` or `SELECT version()`
   - Timeout: 2 seconds for database check
   - Response format:
     ```json
     {
       "status": "ok",
       "timestamp": "2023-11-06T15:30:00.000Z",
       "database": "connected"
     }
     ```

**Constraints:**
- DATABASE_URL must be stored in Google Secret Manager (never in code or GitHub)
- Configuration validation must fail fast (crash on invalid config, don't start server)
- All database queries must use parameterized queries (prevent SQL injection)
- Health check must remain fast (<3 seconds total including cold start)
- Connection errors must be logged server-side, not exposed to client

## Detailed Design

### Services / Modules

| Module | File Path | Responsibility | Inputs | Outputs | Owner |
|--------|-----------|---------------|--------|---------|-------|
| **Configuration Module** | `lib/config.ts` | Validate and parse environment variables using Zod | `process.env` | Type-safe `Config` object | Epic 2 |
| **Database Connection** | `lib/db.ts` | Provide database query function with pooling and logging | SQL query string, params | Query results | Epic 2 |
| **Migration CLI** | `scripts/migrate.js` | Apply/rollback database migrations | Migration files, DATABASE_URL | Migration status | Epic 2 |
| **Health Check (Updated)** | `app/api/health/route.ts` | Verify database connectivity | None | Health status JSON | Epic 1 (updated in Epic 2) |
| **Neon Setup Docs** | `docs/neon-infrastructure-setup-guide.md` | Document Neon database setup and configuration | N/A | Documentation | Epic 2 |

### Data Models

**Configuration Schema (Zod):**
```typescript
// lib/config.ts
import { z } from 'zod';

export const configSchema = z.object({
  // Database
  databaseUrl: z.string()
    .url()
    .startsWith('postgresql://')
    .describe('PostgreSQL connection string from Neon'),
  
  // Authentication (Epic 3)
  neonAuthProjectId: z.string().min(1).optional(),
  neonAuthSecretKey: z.string().min(1).optional(),
  allowedEmails: z.string()
    .transform(s => s.split(',').map(e => e.trim().toLowerCase()))
    .pipe(z.array(z.string().email()))
    .describe('Comma-separated list of allowed email addresses'),
  
  // Environment
  nodeEnv: z.enum(['development', 'staging', 'production'])
    .default('development'),
  port: z.string()
    .default('8080')
    .transform(Number)
    .pipe(z.number().int().positive().max(65535)),
  
  // Runtime
  nextPublicApiUrl: z.string().url().optional(),
});

export type Config = z.infer<typeof configSchema>;

export function getConfig(): Config {
  const parsed = configSchema.safeParse(process.env);
  
  if (!parsed.success) {
    const errors = parsed.error.errors
      .map(e => `${e.path.join('.')}: ${e.message}`)
      .join('\n');
    throw new Error(`Configuration validation failed:\n${errors}`);
  }
  
  return parsed.data;
}
```

**Database Schema (Existing Tables):**

Based on the existing schema in `old_docs/schema/`, the following tables will be migrated:

```sql
-- Migration 001: Create role/pricing tables

CREATE TABLE IF NOT EXISTS career_paths (
  career_path_id SERIAL PRIMARY KEY,
  career_path_name VARCHAR(100) NOT NULL UNIQUE,
  career_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_profiles (
  role_profile_id SERIAL PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL,
  career_path_id INTEGER REFERENCES career_paths(career_path_id),
  career_track_name VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profile_pricing (
  profile_pricing_id SERIAL PRIMARY KEY,
  role_profile_id INTEGER REFERENCES role_profiles(role_profile_id),
  region VARCHAR(50) NOT NULL,
  seniority_level VARCHAR(50) NOT NULL,
  min_salary DECIMAL(10,2),
  mid_salary DECIMAL(10,2),
  max_salary DECIMAL(10,2),
  currency_code VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_role_profiles_career_path ON role_profiles(career_path_id);
CREATE INDEX idx_profile_pricing_role_profile ON profile_pricing(role_profile_id);
CREATE INDEX idx_profile_pricing_region ON profile_pricing(region);
```

**Migration Tracking Table:**
```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);
```

### APIs / Interfaces

**Configuration Module API:**
```typescript
// lib/config.ts

// Primary export: Get validated configuration
export function getConfig(): Config;

// Configuration type (inferred from Zod schema)
export type Config = z.infer<typeof configSchema>;

// Exported schema for testing/documentation
export const configSchema: z.ZodSchema<Config>;
```

**Database Module API:**
```typescript
// lib/db.ts

// Execute a parameterized query
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]>;

// Example usage:
const users = await query('SELECT * FROM users WHERE id = $1', [userId]);
const result = await query('SELECT version()');
```

**Migration CLI API:**
```bash
# Apply next pending migration
npm run migrate:up

# Rollback last migration
npm run migrate:down

# Show migration status
npm run migrate:status

# Create new migration file
npm run migrate:create -- migration_name
```

**Updated Health Check API:**
```typescript
// app/api/health/route.ts

// GET /api/health
// Response (200 OK - healthy):
{
  "status": "ok",
  "timestamp": "2023-11-06T15:30:00.000Z",
  "database": "connected"
}

// Response (500 Internal Server Error - database issue):
{
  "status": "error",
  "timestamp": "2023-11-06T15:30:00.000Z",
  "database": "disconnected"
}
```

### Workflows / Sequencing

**Story 2.1: Neon Database Setup Flow**
```
1. Developer creates Neon account (free tier)
2. Developer creates three databases:
   - role_directory_dev
   - role_directory_stg
   - role_directory_prd
3. Developer copies connection strings from Neon Console
4. Developer stores in Google Secret Manager:
   gcloud secrets create dev-database-url --data-file=<(echo "postgresql://...")
   gcloud secrets create staging-database-url --data-file=<(echo "postgresql://...")
   gcloud secrets create production-database-url --data-file=<(echo "postgresql://...")
5. Developer grants Cloud Run service account access:
   gcloud secrets add-iam-policy-binding dev-database-url \
     --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
6. Developer tests connection: psql "postgresql://..."
```

**Story 2.2: Configuration and Connection Flow**
```
Application Startup:
1. Next.js server starts (Cloud Run container)
2. getConfig() called (first import)
3. Zod validates process.env against schema
   - If invalid: Throw error, log details, exit process
   - If valid: Return typed Config object
4. Database module imports Config
5. Neon client initialized with config.databaseUrl
6. Application ready to serve requests

First Database Query:
1. Request arrives at API route
2. API route calls query('SELECT ...', [params])
3. Neon driver sends HTTP request to Neon
4. If database suspended (cold start):
   - Neon resumes database (~2-3 seconds)
   - Query executes
   - Result returned
5. If database already running:
   - Query executes immediately (<200ms)
   - Result returned
6. Slow query logging if duration > 200ms
```

**Story 2.3-2.4: Migration Flow**
```
Migration Application:
1. Developer creates migration file: migrations/YYYYMMDDHHMMSS_description.sql
2. Developer sets DATABASE_URL env var for target environment
3. Developer runs: npm run migrate:up
4. Migration script:
   a. Connects to database
   b. Reads schema_migrations table
   c. Identifies pending migrations (not in schema_migrations)
   d. Applies pending migrations in timestamp order
   e. Records applied migrations in schema_migrations table
   f. Reports success/failure
5. Developer verifies: psql $DATABASE_URL -c "\dt"

Migration Rollback:
1. Developer runs: npm run migrate:down
2. Migration script:
   a. Reads last applied migration from schema_migrations
   b. Executes rollback SQL (if exists)
   c. Removes entry from schema_migrations
   d. Reports success/failure
```

**Story 2.5: Health Check with Database**
```
Health Check Request:
1. Deployment completes (GitHub Actions or manual)
2. GitHub Actions runs: curl https://service-url/api/health
3. Health check endpoint:
   a. Try database query: SELECT 1 (with 2s timeout)
   b. If success: Return 200 OK with database: "connected"
   c. If failure/timeout: Return 500 with database: "disconnected"
   d. Log error details server-side (not in response)
4. GitHub Actions:
   - If 200 OK: Deployment successful ✅
   - If 500 or timeout: Deployment failed ❌, rollback
```

## Non-Functional Requirements

### Performance

| Requirement | Target | Measurement | Notes |
|-------------|--------|-------------|-------|
| **Database Query Latency (Warm)** | <200ms (P95) | Log slow queries | Neon database already running |
| **Database Query Latency (Cold Start)** | <3s (P99) | Health check timing | Neon database auto-resume |
| **Configuration Validation** | <100ms | Startup logging | Zod validation overhead |
| **Health Check Response** | <3s total | curl timing | Includes cold start if needed |
| **Migration Application** | <30s per migration | Migration script timing | Simple CREATE TABLE statements |

**Performance Considerations:**
- Neon auto-suspend after 5 minutes of inactivity (free tier)
- First query after suspend incurs 2-3 second resume penalty
- Subsequent queries are fast (<50ms) while database is active
- `@neondatabase/serverless` uses HTTP protocol (no persistent connections)
- No connection pooling needed (driver handles this internally)

### Security

| Requirement | Implementation | Validation |
|-------------|----------------|------------|
| **DATABASE_URL Protection** | Store in Google Secret Manager, inject at runtime | Never appear in logs, code, or GitHub |
| **SQL Injection Prevention** | Always use parameterized queries (`$1`, `$2`) | Code review, no string interpolation |
| **TLS/SSL Enforcement** | DATABASE_URL includes `?sslmode=require` | Connection string validation |
| **Error Message Sanitization** | Log details server-side, return generic errors to client | No database errors in API responses |
| **Least Privilege Access** | Cloud Run service account has only secretmanager.secretAccessor | IAM policy review |
| **Configuration Validation** | Zod schema validates all inputs, fail-fast on invalid config | Startup validation |

**Security Best Practices:**
- ✅ Never commit DATABASE_URL to git
- ✅ Use parameterized queries (prevent SQL injection)
- ✅ Enable SSL/TLS for all database connections
- ✅ Store secrets in Google Secret Manager (not env files in repo)
- ✅ Log database errors server-side only (don't expose to client)
- ✅ Validate configuration on startup (fail-fast if misconfigured)

### Reliability

| Requirement | Implementation | Notes |
|-------------|----------------|-------|
| **Connection Resilience** | Neon driver retries failed connections | HTTP-based, stateless |
| **Graceful Degradation** | Health check returns 500 if DB down, app continues | Non-critical queries may fail |
| **Error Handling** | Try-catch around all queries, log errors | Prevent unhandled promise rejections |
| **Timeout Protection** | 2-5 second timeouts on queries | Prevent hanging requests |
| **Zero Downtime Migrations** | Backward-compatible schema changes | Additive migrations (no breaking changes) |

**Reliability Strategies:**
- Database connection failures are logged and returned as 500 errors
- Health check detects database issues on every deployment
- Migrations are idempotent (can be run multiple times safely)
- Neon's built-in replication provides data redundancy
- Cloud Run automatically restarts crashed containers

### Observability

| Signal | Implementation | Location |
|--------|----------------|----------|
| **Slow Query Logging** | Log queries >200ms with SQL text and duration | Cloud Run logs |
| **Error Logging** | Log all database errors with context | Cloud Run logs |
| **Configuration Validation** | Log validation errors on startup | Cloud Run startup logs |
| **Migration Tracking** | `schema_migrations` table records applied migrations | Database |
| **Health Check Status** | Database connectivity status in health endpoint | `/api/health` |

**Logging Format (Structured JSON):**
```javascript
// Slow query log
console.warn('[DB] Slow query', {
  duration_ms: 350,
  query: 'SELECT * FROM role_profiles WHERE ...',
  timestamp: new Date().toISOString(),
});

// Error log
console.error('[DB] Query error', {
  query: 'INSERT INTO ...',
  error: error.message,
  timestamp: new Date().toISOString(),
});

// Configuration validation error
console.error('[CONFIG] Validation failed', {
  errors: parsed.error.errors,
  timestamp: new Date().toISOString(),
});
```

**Cloud Run Logs Access:**
```bash
# View recent logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=role-directory-dev" \
  --limit=50 \
  --format=json

# Filter for database errors
gcloud logging read "resource.type=cloud_run_revision AND jsonPayload.message=~'\\[DB\\]'" \
  --limit=20
```

## Dependencies and Integrations

### Runtime Dependencies

```json
{
  "dependencies": {
    "@neondatabase/serverless": "^0.10.1",
    "zod": "^3.23.8",
    "next": "15.0.3",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.6.3"
  }
}
```

**Key Dependency Details:**
- **@neondatabase/serverless** v0.10.1:
  - HTTP-based PostgreSQL client optimized for serverless
  - Built-in connection pooling and query queueing
  - Handles Neon auto-suspend/resume transparently
  - No persistent connections (stateless)
  - Alternative: `pg` (traditional client, not serverless-optimized)

- **Zod** v3.23.8:
  - Runtime schema validation
  - Type inference for TypeScript
  - Composable schemas with transformations
  - Detailed error messages

### External Integrations

| Service | Purpose | Configuration | Constraints |
|---------|---------|---------------|-------------|
| **Neon PostgreSQL** | Database hosting | Connection string via Secret Manager | Free tier: 1 project, auto-suspend after 5min |
| **Google Secret Manager** | Store DATABASE_URL securely | gcloud secrets create/update | 6 secrets free, then $0.06/secret/month |
| **Cloud Run** | Application hosting | Inject secrets as env vars | Service account needs secretAccessor role |
| **GitHub Actions** | CI/CD pipeline | Secret env vars for deployment | DATABASE_URL needed for migrations |

**Integration Diagram:**
```
[GitHub Actions] ──────────────► [Google Secret Manager]
       │                              │ (DATABASE_URL)
       │                              ▼
       ├──────────► [Docker Build] ──► [Cloud Run]
       │                              │
       │                              ▼
       └──────────► [Deployment] ────► [Neon PostgreSQL]
                                          (3 databases: dev, stg, prd)
```

## Acceptance Criteria and Traceability

### Epic-Level Acceptance Criteria

**AC-1: Three Neon Databases Created**
- ✅ Three databases exist: `role_directory_dev`, `role_directory_stg`, `role_directory_prd`
- ✅ Each has unique connection string
- ✅ Connection strings stored in Google Secret Manager
- ✅ Can connect via psql to each database
- **Spec Section**: Story 2.1 - Neon Database Setup
- **Component**: Neon PostgreSQL, Google Secret Manager
- **Test Idea**: Manual verification via `psql $DATABASE_URL`

**AC-2: Configuration Module Validates Environment**
- ✅ Zod schema validates all required environment variables
- ✅ Fails fast with detailed error messages on invalid config
- ✅ Type-safe `getConfig()` function available
- ✅ `DATABASE_URL` validated as valid PostgreSQL URL
- **Spec Section**: Configuration Module (lib/config.ts)
- **Component**: Zod validation schema
- **Test Idea**: Unit tests with valid/invalid env vars

**AC-3: Database Connection Works from Cloud Run**
- ✅ Can execute queries from Cloud Run in all three environments
- ✅ Warm queries complete in <200ms (P95)
- ✅ Cold start queries complete in <3s (P99)
- ✅ No connection leaks or resource exhaustion
- **Spec Section**: Database Connection Module (lib/db.ts)
- **Component**: @neondatabase/serverless client
- **Test Idea**: Load test with Artillery or k6

**AC-4: Migration System Applies Schema Changes**
- ✅ Can create migration files with timestamp
- ✅ `npm run migrate:up` applies pending migrations
- ✅ `npm run migrate:down` rolls back last migration
- ✅ `schema_migrations` table tracks applied migrations
- **Spec Section**: Migration CLI (scripts/migrate.js)
- **Component**: Custom migration script
- **Test Idea**: Apply and rollback test migration in dev

**AC-5: Existing Tables Migrated to All Environments**
- ✅ `career_paths`, `role_profiles`, `profile_pricing` tables exist
- ✅ Schema consistent across dev, staging, production
- ✅ Sample data inserted for testing (optional)
- ✅ Can query tables successfully
- **Spec Section**: Story 2.4 - Initial Schema Migration
- **Component**: migrations/001_create_role_tables.sql
- **Test Idea**: Run `\dt` in psql for each environment

**AC-6: Health Check Includes Database Status**
- ✅ Health endpoint queries database (`SELECT 1`)
- ✅ Returns `{ "database": "connected" }` on success
- ✅ Returns 500 with `{ "database": "disconnected" }` on failure
- ✅ Database check completes within 2 seconds
- **Spec Section**: Health Check Integration (app/api/health/route.ts)
- **Component**: Updated health check endpoint
- **Test Idea**: curl /api/health, verify response includes database field

**AC-7: Documentation Covers Setup and Troubleshooting**
- ✅ Neon account setup documented
- ✅ Google Secret Manager commands documented
- ✅ Migration workflow documented
- ✅ Common issues and solutions documented
- **Spec Section**: Story 2.6 - Documentation
- **Component**: docs/neon-infrastructure-setup-guide.md
- **Test Idea**: New developer follows docs to set up local environment

### Traceability Mapping

| AC | Spec Section | Component(s) | API(s) | Test Idea |
|----|--------------|--------------|--------|-----------|
| AC-1 | Neon Setup | Neon PostgreSQL, Secret Manager | N/A | psql connection test |
| AC-2 | Configuration | lib/config.ts | getConfig() | Unit tests (valid/invalid config) |
| AC-3 | Database Connection | lib/db.ts | query() | Integration test, load test |
| AC-4 | Migrations | scripts/migrate.js | CLI commands | Apply/rollback test migration |
| AC-5 | Schema Migration | migrations/001_*.sql | N/A | Verify tables exist in all envs |
| AC-6 | Health Check | app/api/health/route.ts | GET /api/health | curl endpoint, check response |
| AC-7 | Documentation | docs/*.md | N/A | Follow docs, verify completeness |

## Risks, Assumptions, and Questions

### Risks

**Risk-1: Neon Cold Start Latency**
- **Description**: Neon free tier auto-suspends databases after 5 minutes of inactivity. First query after suspend incurs 2-3 second delay.
- **Impact**: Health checks may timeout during deployment, manual testing may feel slow
- **Mitigation**: 
  - Use 3-second timeout for health checks (not 1 second)
  - Document cold start behavior clearly
  - Consider upgrading to Neon paid tier for production (always-on compute)
- **Likelihood**: High (guaranteed on free tier)
- **Owner**: Epic 2

**Risk-2: Configuration Validation Fails Silently**
- **Description**: If Zod validation errors are not logged clearly, developers may struggle to diagnose startup failures.
- **Impact**: Difficult debugging, slow development velocity
- **Mitigation**:
  - Log full Zod error details on validation failure
  - Provide clear error messages with examples
  - Document common configuration issues in README
- **Likelihood**: Medium (if logging not implemented well)
- **Owner**: Story 2.2

**Risk-3: Migration Rollback Not Tested**
- **Description**: Rollback migrations may be incomplete or incorrect, causing issues when reverting changes.
- **Impact**: Cannot safely rollback schema changes, may require manual database fixes
- **Mitigation**:
  - Test rollback for every migration in dev environment
  - Prefer additive migrations (minimize need for rollback)
  - Document manual rollback procedures
- **Likelihood**: Medium
- **Owner**: Story 2.3

**Risk-4: Secret Manager Permissions Not Set**
- **Description**: Cloud Run service account may not have access to read DATABASE_URL from Secret Manager.
- **Impact**: Application fails to start with "permission denied" error
- **Mitigation**:
  - Document IAM permissions clearly in setup guide
  - Test in dev environment first
  - Include troubleshooting section in docs
- **Likelihood**: High (common setup mistake)
- **Owner**: Story 2.1, Story 2.6

### Assumptions

**Assumption-1: Neon Free Tier Sufficient for MVP**
- Database auto-suspend acceptable for MVP usage
- 1 GB storage sufficient for sample data
- Free tier compute hours sufficient (~100 hours/month)
- **Validation**: Monitor Neon usage metrics, upgrade if needed

**Assumption-2: No ORM Needed**
- Direct SQL queries sufficient for simple data models
- Type safety provided by TypeScript (not ORM)
- Zod validation handles input/output validation
- **Validation**: Assess after Epic 3-4, add Prisma if complexity increases

**Assumption-3: Manual Migrations Acceptable**
- No automated migrations in CI/CD required for MVP
- Developer runs migrations manually before deploying
- Migration state tracked in database (not git)
- **Validation**: Reassess if migration errors become common

**Assumption-4: Single-Region Deployment**
- All three environments in same GCP region (southamerica-east1)
- Neon database in closest Neon region (US East or US West)
- Latency acceptable for MVP (<100ms region-to-region)
- **Validation**: Measure actual latency in production

### Questions

**Question-1: Which migration tool to use?**
- Options: Prisma Migrate, node-pg-migrate, Knex, custom script
- Recommendation: node-pg-migrate (simple, SQL-based, no ORM lock-in)
- **Answer Needed By**: Story 2.3 implementation
- **Owner**: danielvm

**Question-2: Should health check fail if database is down?**
- Option A: Fail health check (deployment blocked if DB issue)
- Option B: Warn in response but return 200 OK (deployment succeeds)
- Recommendation: Option A (fail-fast, catch DB issues early)
- **Answer Needed By**: Story 2.5 implementation
- **Owner**: danielvm

**Question-3: How to handle migration failures in production?**
- Rollback Cloud Run deployment? Rollback database migration? Both?
- Recommendation: Document rollback procedures, test in staging first
- **Answer Needed By**: Story 2.6 documentation
- **Owner**: Epic 2

## Test Strategy

### Unit Testing

**Scope**: Configuration module, database utility functions

**Coverage Targets**:
- Configuration validation: 100% (all valid/invalid cases)
- Database query function: Error handling paths
- Not required: Database connection itself (integration test)

**Example Tests**:
```typescript
// lib/config.test.ts
describe('Configuration', () => {
  it('validates valid DATABASE_URL', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@host/db?sslmode=require';
    expect(() => getConfig()).not.toThrow();
  });

  it('rejects invalid DATABASE_URL', () => {
    process.env.DATABASE_URL = 'not-a-url';
    expect(() => getConfig()).toThrow('Invalid configuration');
  });

  it('parses ALLOWED_EMAILS into array', () => {
    process.env.ALLOWED_EMAILS = 'user1@example.com, user2@example.com';
    const config = getConfig();
    expect(config.allowedEmails).toEqual(['user1@example.com', 'user2@example.com']);
  });
});
```

**Deferred to Phase 2** (per PRD):
- Unit tests are documented but NOT required for MVP
- Focus on manual testing and integration testing

### Integration Testing

**Scope**: Database connectivity, migrations, health check

**Test Cases**:

1. **Database Connection Test**:
   - Set DATABASE_URL to dev database
   - Call `query('SELECT 1')`
   - Assert: Query returns `[{ ?column?: 1 }]`
   - Assert: Query completes in <3 seconds

2. **Migration Application Test**:
   - Create test migration: `migrations/test_add_column.sql`
   - Run `npm run migrate:up`
   - Verify: Column added to table
   - Run `npm run migrate:down`
   - Verify: Column removed from table

3. **Health Check Integration Test**:
   - Deploy to dev environment
   - Run `curl https://dev-url/api/health`
   - Assert: Response includes `"database": "connected"`
   - Assert: Status code 200 OK
   - Stop database (simulate failure)
   - Run `curl https://dev-url/api/health`
   - Assert: Response includes `"database": "disconnected"`
   - Assert: Status code 500

### Manual Testing

**Scope**: All acceptance criteria

**Test Checklist**:

- [ ] **Story 2.1**: Connect to each Neon database via psql
- [ ] **Story 2.1**: Verify DATABASE_URL stored in Google Secret Manager
- [ ] **Story 2.2**: Start application with invalid config, verify error message
- [ ] **Story 2.2**: Start application with valid config, verify success
- [ ] **Story 2.2**: Execute test query via query() function
- [ ] **Story 2.3**: Create test migration, apply with npm run migrate:up
- [ ] **Story 2.3**: Verify migration tracked in schema_migrations table
- [ ] **Story 2.3**: Rollback migration with npm run migrate:down
- [ ] **Story 2.4**: Verify role_profiles table exists in all three environments
- [ ] **Story 2.4**: Query role_profiles table, verify sample data
- [ ] **Story 2.5**: Hit /api/health endpoint, verify database field in response
- [ ] **Story 2.5**: Measure health check response time (<3s)
- [ ] **Story 2.6**: Follow documentation to set up local environment

### Performance Testing

**Scope**: Query latency, cold start behavior

**Test Scenarios**:

1. **Warm Query Performance**:
   - Execute 100 queries back-to-back
   - Measure P50, P95, P99 latency
   - Target: P95 <200ms

2. **Cold Start Performance**:
   - Wait for Neon auto-suspend (5+ minutes)
   - Execute query
   - Measure latency
   - Target: <3 seconds

3. **Health Check Performance**:
   - Measure health check response time (cold and warm)
   - Target: <3 seconds cold, <500ms warm

**Tools**: curl with timing, custom Node.js script, Cloud Run logs

---

## Story Implementation Order

**Recommended Sequence** (based on dependencies):

1. **Story 2.1**: Neon PostgreSQL Account and Database Setup
   - Can be done in parallel with Epic 1 completion
   - No code dependencies

2. **Story 2.2**: Database Connection Configuration with Zod-Validated Config
   - Requires: Story 1.1 (project initialized)
   - Blocks: All other Epic 2 stories

3. **Story 2.3**: Database Schema Migration Setup
   - Requires: Story 2.2 (database connection working)
   - Blocks: Story 2.4

4. **Story 2.4**: Initial Database Schema Migration (Existing Tables)
   - Requires: Story 2.3 (migration system working)
   - Blocks: Epic 4 (dashboard needs tables)

5. **Story 2.5**: Database Connection Testing in Health Check
   - Requires: Story 2.2 (database connection), Story 1.6 (health endpoint)
   - Blocks: Deployment validation with database check

6. **Story 2.6**: Environment-Specific Database Configuration Documentation
   - Requires: Stories 2.1-2.5 (all setup complete)
   - No blocking dependencies, can be done last

**Parallelization Opportunities**:
- Story 2.1 can be done during Epic 1 implementation
- Story 2.6 (documentation) can be drafted in parallel with Stories 2.2-2.5

---

## Definition of Done (Epic 2)

✅ **All 6 stories completed and deployed to dev environment**

✅ **Configuration and Connection**:
- [ ] Configuration module validates all env vars using Zod
- [ ] Database connection works from Cloud Run in dev environment
- [ ] Slow query logging active (>200ms queries logged)

✅ **Database Infrastructure**:
- [ ] Three Neon databases created and accessible
- [ ] DATABASE_URL stored in Google Secret Manager for all three environments
- [ ] Migration system can apply and rollback schema changes

✅ **Schema and Data**:
- [ ] Initial migration creates role/pricing tables
- [ ] Schema consistent across dev, staging, production
- [ ] Sample data inserted for testing

✅ **Integration and Validation**:
- [ ] Health check endpoint includes database connectivity status
- [ ] Health check passes in dev deployment
- [ ] Query latency meets targets (<200ms warm, <3s cold)

✅ **Documentation**:
- [ ] Neon setup documented with screenshots/examples
- [ ] Google Secret Manager configuration documented
- [ ] Migration workflow documented
- [ ] Troubleshooting section covers common issues

✅ **Quality**:
- [ ] No linter errors in new code
- [ ] Configuration validation tested with valid/invalid inputs
- [ ] Database connection tested with sample queries
- [ ] Migration tested with apply and rollback

---

## Notes

**Integration with Epic 3 (Authentication)**:
- Epic 3 will use the configuration module to load Neon Auth credentials
- Epic 3 will store user sessions in the same database (Neon Auth auto-creates tables)
- Configuration schema in Story 2.2 includes optional Neon Auth fields

**Integration with Epic 4 (Dashboard)**:
- Epic 4 will query the migrated role/pricing tables
- Epic 4 will use the query() function to fetch dashboard data
- Epic 4 will display query performance metrics (from slow query logs)

**Future Enhancements (Post-MVP)**:
- Automated migrations in CI/CD pipeline
- Database backup and restore procedures
- Query performance monitoring dashboard
- Connection pooling metrics
- Read replicas for scaling (if needed)

---

**End of Epic 2 Technical Specification**


