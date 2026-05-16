---
status: draft
created: 2026-04-17
priority: high
tags:
- epic-2
- migrations
- schema
- initial
depends_on:
- '021'
parent: 005-epic-2-database
created_at: 2026-04-17T01:13:55.160503Z
updated_at: 2026-04-17T01:16:44.898769Z
---

# Story 2.4: Initial Database Schema Migration

## Overview

As a **developer**, I want the initial database schema applied to all three environments, so that the application has the tables needed for invitation code access control and session management.

## Design

**Migration:** `20251106120001_create_invitation_codes_sessions.sql`

```sql
-- up:
CREATE TABLE invitation_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  created_by  TEXT NOT NULL DEFAULT 'admin',
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitation_codes_code ON invitation_codes(code);
CREATE INDEX idx_invitation_codes_expires_at ON invitation_codes(expires_at);

CREATE TABLE sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id     UUID NOT NULL REFERENCES invitation_codes(id) ON DELETE CASCADE,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- down:
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS invitation_codes;
```

## Plan

- [ ] Write migration SQL file with `invitation_codes` and `sessions` tables
- [ ] Apply migration to dev: `npm run migrate:up`
- [ ] Verify schema in dev via Neon Console or `psql`
- [ ] Apply migration to staging: `DATABASE_URL=$STG_URL npm run migrate:up`
- [ ] Apply migration to production: `DATABASE_URL=$PRD_URL npm run migrate:up`
- [ ] Verify tables exist in all three environments

## Test

- [ ] `invitation_codes` table created with all columns and indexes
- [ ] `sessions` table created with foreign key to `invitation_codes`
- [ ] Migration applied in all three environments (dev, stg, prd)
- [ ] `migrate:down` reverts the migration cleanly
- [ ] Health check endpoint can query the database post-migration

## Notes

**Source:** `docs/stories/2-4-initial-database-schema-migration.md` (Status: drafted)

**Design decision — separate tables vs single table:** Using separate `invitation_codes` and `sessions` tables preserves the relationship between access grants and active sessions. A single table approach loses this audit trail.

**Performance:** Added indexes on `code` (lookup) and `expires_at` (expiry queries) for expected access patterns.