---
status: complete
created: '2026-04-17'
tags:
  - guide
  - neon
  - postgresql
  - database
priority: medium
created_at: '2026-04-17T01:14:51.340214+00:00'
---
# Guide: Neon PostgreSQL Infrastructure Setup

## Overview

Operational guide for Neon PostgreSQL setup: creating databases, configuring connection strings, and managing secrets.

## Design

### Neon project structure

**Project:** `role-directory` (one project, three databases)

| Database | Environment | Secret Manager Key |
|----------|-------------|-------------------|
| `role_directory_dev` | dev | `role-directory-dev-db-url` |
| `role_directory_stg` | staging | `role-directory-stg-db-url` |
| `role_directory_prd` | production | `role-directory-prd-db-url` |

### Connection URL types

Each database has two URLs:
- **Pooled URL** (`*-pooler.*.neon.tech`): use for application queries (serverless-optimized)
- **Direct URL** (`*.*.neon.tech`): use for migrations (DDL statements bypass PgBouncer)

## Plan

### Create databases

1. Sign up at [neon.tech](https://neon.tech) (free tier)
2. Create project: `role-directory`
3. Create databases: `role_directory_dev`, `role_directory_stg`, `role_directory_prd`
4. Copy pooled and direct connection strings for each database

### Store in Secret Manager

```bash
# For each environment
gcloud secrets create role-directory-dev-db-url --replication-policy="automatic"
echo -n "postgresql://user:pass@ep-xxx-pooler.region.neon.tech/role_directory_dev?sslmode=require" | \
  gcloud secrets versions add role-directory-dev-db-url --data-file=-

# Repeat for stg and prd
```

### Grant Cloud Run access to secrets

```bash
# Get Cloud Run service account
SA=$(gcloud run services describe role-directory-dev \
  --region us-central1 --format="value(spec.template.spec.serviceAccountName)")

# Grant Secret Accessor role
gcloud secrets add-iam-policy-binding role-directory-dev-db-url \
  --member="serviceAccount:$SA" \
  --role="roles/secretmanager.secretAccessor"
```

### Verify connectivity

```bash
psql "postgresql://user:pass@ep-xxx.region.neon.tech/role_directory_dev?sslmode=require" \
  -c "\l"
```

## Test

- [x] Three databases created in Neon
- [x] Connection strings stored in Secret Manager
- [x] Cloud Run services can access their respective secrets
- [x] `psql` connection works with `sslmode=require`
- [x] Auto-suspend enabled (default, free tier)

## Notes

**Sources:** `docs/guides/neon-infrastructure-setup-guide.md`, `docs/guides/neon-auth-setup-guide.md`

**Auto-suspend behavior:** Neon suspends after ~5 minutes of inactivity. First query after suspend takes 2-3 seconds. The `@neondatabase/serverless` driver handles this transparently. Acceptable for MVP traffic.

**Free tier limits:** 0.5 GiB storage, 190 compute hours/month. More than enough for MVP.