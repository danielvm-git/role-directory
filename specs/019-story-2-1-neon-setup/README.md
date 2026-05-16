---
status: draft
created: 2026-04-17
priority: high
tags:
- epic-2
- neon
- postgresql
- database
parent: 005-epic-2-database
created_at: 2026-04-17T01:13:55.057704Z
updated_at: 2026-04-17T01:16:38.983926Z
---

# Story 2.1: Neon PostgreSQL Account and Database Setup

## Overview

As a **developer**, I want three separate Neon PostgreSQL databases (dev, staging, production) configured and accessible, so that each environment has isolated data and I can validate schema migrations independently.

## Design

**Neon project:** `role-directory` (free tier)
**Three databases:**
- `role_directory_dev`
- `role_directory_stg`
- `role_directory_prd`

**Connection string format:**
```
postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require
```

**Secret Manager storage:**
- `role-directory-dev-db-url` → dev connection string
- `role-directory-stg-db-url` → staging connection string
- `role-directory-prd-db-url` → production connection string

**Neon features used:**
- Auto-suspend (saves compute hours on free tier)
- Built-in connection pooling (use pooled URL for app queries)
- Direct URL for migrations (DDL statements)

## Plan

- [ ] Sign up for Neon free tier at neon.tech
- [ ] Create project `role-directory`
- [ ] Create three databases (or one project with three branches)
- [ ] Copy connection strings (pooled + direct) for each environment
- [ ] Store connection strings in Google Secret Manager
- [ ] Configure Cloud Run services to access Secret Manager secrets
- [ ] Verify connectivity: `psql "postgres://..." -c "\l"`
- [ ] Document setup in `docs/guides/neon-infrastructure-setup-guide.md`

## Test

- [ ] Can connect to each database via `psql`
- [ ] Connection strings stored in Secret Manager (not in code)
- [ ] Cloud Run dev service can access `role-directory-dev-db-url` secret
- [ ] SSL/TLS enforced on all connections (`sslmode=require`)
- [ ] Neon auto-suspend enabled (free tier compliance)

## Notes

**Source:** `docs/stories/2-1-neon-postgresql-account-and-database-setup.md` (Status: drafted)

**Guide reference:** `docs/guides/neon-infrastructure-setup-guide.md` — detailed setup walkthrough.

**Neon connection URL types:**
- Pooled URL (ends in `-pooler`): use for application queries (better for serverless)
- Direct URL: use for migrations (no PgBouncer in middle for DDL)