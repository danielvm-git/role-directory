---
status: draft
created: 2026-04-17
priority: high
tags:
- epic-2
- migrations
- schema
depends_on:
- '020'
parent: 005-epic-2-database
created_at: 2026-04-17T01:13:55.126046Z
updated_at: 2026-04-17T01:16:44.863257Z
---

# Story 2.3: Database Schema Migration Setup

## Overview

As a **developer**, I want a migration system to manage database schema changes across environments, so that schema updates can be applied consistently and safely to dev, staging, and production.

## Design

**Migration tool:** `node-pg-migrate` or custom lightweight runner
**Migration file naming:** `YYYYMMDDHHMMSS_migration_name.sql`
**Tracking table:** `schema_migrations (id, migration_name, applied_at)`

**NPM scripts:**
```json
{
  "migrate:up": "node scripts/migrate.js up",
  "migrate:down": "node scripts/migrate.js down",
  "migrate:status": "node scripts/migrate.js status"
}
```

**Environment targeting:** Set `DATABASE_URL` to target specific environment:
```bash
DATABASE_URL=$DEV_DB_URL npm run migrate:up
DATABASE_URL=$STG_DB_URL npm run migrate:up
DATABASE_URL=$PRD_DB_URL npm run migrate:up
```

**Migration file structure:**
```
migrations/
├── 20251106120000_create_schema_migrations.sql
└── 20251106120001_create_invitation_codes_sessions.sql
```

Each file has `-- up:` and `-- down:` sections.

## Plan

- [ ] Choose migration tool (node-pg-migrate recommended, or lightweight custom)
- [ ] Create `migrations/` directory
- [ ] Add `migrate:up`, `migrate:down`, `migrate:status` npm scripts
- [ ] Create first migration: `schema_migrations` tracking table
- [ ] Document migration workflow in README

## Test

- [ ] `npm run migrate:up` applies migrations in timestamp order
- [ ] `npm run migrate:down` rolls back last migration
- [ ] `npm run migrate:status` shows applied vs pending migrations
- [ ] Running `migrate:up` twice is idempotent (no duplicate runs)
- [ ] Migration failures roll back cleanly
- [ ] Works against all three environments (via `DATABASE_URL` swap)

## Notes

**Source:** `docs/stories/2-3-database-schema-migration-setup.md` (Status: drafted)

**Tool decision:** node-pg-migrate (npm: `node-pg-migrate`) is a mature option with up/down support. Alternative: write a lightweight custom runner using `@neondatabase/serverless` directly — avoids extra dep for simple MVP migrations.

**Migration DB URL:** Use direct connection (not pooled) for DDL statements. Add `DIRECT_DATABASE_URL` env var pointing to direct Neon URL.