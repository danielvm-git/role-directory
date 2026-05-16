---
status: complete
created: 2026-04-17
priority: high
tags:
- epic-1
- api
- health-check
parent: 004-epic-1-foundation
created_at: 2026-04-17T01:11:54.479838Z
updated_at: 2026-04-17T01:16:11.640844Z
completed_at: 2026-04-17T01:16:11.640844Z
---

# Story 1.6: Health Check Endpoint

## Overview

As a **developer**, I want a health check endpoint that reports application status, so that CI/CD and Cloud Run can verify the application is running correctly.

## Design

**File:** `app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    { status: 200 }
  );
}
```

**No auth required** — public endpoint for health checks.

**Response time:** <100ms warm. After Epic 2, optionally include `{ db: 'ok' | 'error' }`.

**Error behavior:** If critical failure (e.g., config invalid), return 500 with `{ status: 'error', message: '...' }`.

## Plan

- [x] Create `app/api/health/route.ts`
- [x] Export `GET` handler returning JSON
- [x] Include `timestamp` in response for cache-busting
- [x] Verify endpoint returns 200 with correct body
- [x] Add database status check (after Epic 2)

## Test

- [x] `GET /api/health` returns 200
- [x] Response body: `{ "status": "ok", "timestamp": "<ISO 8601>" }`
- [x] Response time <100ms (warm)
- [x] No auth required (public)
- [x] CI/CD health check step uses this endpoint

## Notes

**Source:** `docs/stories/1-6-health-check-endpoint.md` (Status: done)

Used by: deployment pipeline (Story 1.5), promotion workflows (Stories 1.9, 1.10), Cloud Run liveness probe.