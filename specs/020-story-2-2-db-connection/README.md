---
status: draft
created: 2026-04-17
priority: high
tags:
- epic-2
- zod
- config
- database
depends_on:
- '019'
parent: 005-epic-2-database
created_at: 2026-04-17T01:13:55.092787Z
updated_at: 2026-04-17T01:16:44.827118Z
---

# Story 2.2: Database Connection Config with Zod Validation

## Overview

As a **developer**, I want a type-safe configuration module with Zod validation and a database connection module with proper pooling, so that the application validates configuration on startup and can reliably connect to PostgreSQL from Cloud Run.

## Design

### `lib/config.ts` — Zod-validated config

```typescript
import { z } from 'zod';

const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  PORT: z.coerce.number().default(8080),
  ALLOWED_EMAILS: z.string().transform(s => s.split(',').map(e => e.trim())),
});

export type Config = z.infer<typeof configSchema>;

let _config: Config | null = null;
export function getConfig(): Config {
  if (!_config) _config = configSchema.parse(process.env);
  return _config;
}
```

### `lib/db.ts` — Database connection

```typescript
import { neon } from '@neondatabase/serverless';
import { getConfig } from './config';

const sql = neon(getConfig().DATABASE_URL);

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const result = await sql(text, params);
  const duration = Date.now() - start;
  if (duration > 200) console.warn({ query: text, duration }, 'slow query');
  return result;
}
```

**Behaviors:**
- Config validated once at startup; throws detailed error if invalid
- `query()` uses parameterized queries (SQL injection prevention)
- Slow queries (>200ms) logged to stdout (captured by Cloud Run)
- Neon cold start (2-3s after auto-suspend) handled transparently by driver

## Plan

- [ ] Create `lib/config.ts` with Zod schema for all env vars
- [ ] Create `lib/db.ts` with `query()` function + slow query logging
- [ ] Add `DATABASE_URL` to `.env.example`
- [ ] Update health check endpoint to test DB connectivity
- [ ] Write integration test: invalid env → descriptive error on startup
- [ ] Test: parameterized query executes successfully against Neon

## Test

- [ ] `getConfig()` throws descriptive error for missing `DATABASE_URL`
- [ ] `getConfig()` throws error for invalid PostgreSQL URL
- [ ] `query()` executes simple `SELECT 1` against Neon
- [ ] Slow query logging triggers at >200ms
- [ ] Config validated at startup (not lazily per request)
- [ ] Connection handles Neon cold start without errors

## Notes

**Source:** `docs/stories/2-2-database-connection-configuration-with-zod-validated-config.md` (Status: drafted)

**Why fail-fast config:** Better to crash at startup with a clear error than to serve requests until the first DB query reveals a misconfiguration.