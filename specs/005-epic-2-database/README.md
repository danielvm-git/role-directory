---
status: in-progress
created: 2026-04-17
priority: high
tags:
- epic
- database
- neon
- postgresql
depends_on:
- 004-epic-1-foundation
created_at: 2026-04-17T01:10:07.012739Z
updated_at: 2026-04-17T01:16:44.725817Z
---

# Epic 2: Database Infrastructure & Connectivity

> **Status**: in-progress · **Priority**: high · **Created**: 2026-04-17

## Overview

Establish reliable PostgreSQL database connectivity from Cloud Run, handling serverless constraints (cold starts, connection pooling), and enable database schema management across all three environments.

**Value:** Authentication and dashboard features both depend on database connectivity working correctly in the serverless Cloud Run environment with Neon PostgreSQL's auto-suspend behavior.

## Design

### Architecture Components

- **Database:** Neon PostgreSQL (free tier) — 3 isolated databases (dev, stg, prd)
- **Driver:** `@neondatabase/serverless` — optimized for serverless, built-in connection pooling
- **Config:** `lib/config.ts` — Zod-validated env variables, fail-fast on startup
- **DB Module:** `lib/db.ts` — `query()` function, parameterized queries, slow query logging (>200ms)
- **Migrations:** Timestamp-ordered SQL files, tracked via `schema_migrations` table
- **Secrets:** Connection strings in Google Secret Manager (`role-directory-{env}-db-url`)

### Connection Strategy (Neon Cold Starts)

Neon auto-suspends after ~5 min of inactivity. First query after suspend takes 2-3 seconds. `@neondatabase/serverless` handles this gracefully with built-in retry. Do NOT use traditional pg connection pooling (PgBouncer etc.) — use Neon's pooled connection URL.

### Initial Schema

```sql
-- invitation_codes: time-limited access codes
CREATE TABLE invitation_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- sessions: track active authenticated sessions
CREATE TABLE sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id     UUID REFERENCES invitation_codes(id),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL
);
```

## Plan

- [ ] Story 2.1: Neon PostgreSQL account + 3 databases setup
- [ ] Story 2.2: Database connection config with Zod-validated config (`lib/config.ts` + `lib/db.ts`)
- [ ] Story 2.3: Database schema migration setup (migration runner, `schema_migrations` table)
- [ ] Story 2.4: Initial database schema migration (invitation_codes + sessions tables)

## Test

### Epic Success Criteria

- [ ] `getConfig()` validates all required env vars on startup, throws descriptive errors on failure
- [ ] `query()` executes parameterized queries against Neon from Cloud Run
- [ ] Cold start (Neon wake) handled gracefully — no errors, max 5s wait
- [ ] `npm run migrate:up` applies migrations in order
- [ ] `npm run migrate:down` rolls back last migration
- [ ] Health check endpoint updated to report database status
- [ ] All three environments can run migrations independently

## Notes

**Source:** `docs/2-planning/epics.md` + `docs/tech-spec-epic-2.md` (2025-11-06)

**Neon-specific constraints:**
- Use pooled connection URL (ends with `-pooler`) for application queries
- Use direct connection URL for migrations (DDL statements)
- `sslmode=require` on all connections

**Configuration validation pattern (fail-fast):**
```typescript
// lib/config.ts
const schema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  // ...
});
// Called at module load — throws on startup if invalid
export const config = schema.parse(process.env);
```
