---
status: planned
created: 2026-04-17
priority: medium
tags:
- epic
- dashboard
- ui
- validation
depends_on:
- 006-epic-3-auth
created_at: 2026-04-17T01:10:07.076854Z
updated_at: 2026-04-17T01:16:44.791598Z
---

# Epic 4: Hello World Dashboard (Stack Validation)

> **Status**: planned · **Priority**: medium · **Created**: 2026-04-17

## Overview

Complete the infrastructure validation loop with a working protected dashboard that proves database connectivity, authentication, and file serving all work end-to-end in production.

**Value:** This epic closes the loop — proves ONE complete feature flows successfully through all three environments with real data.

**Success definition:** A collaborator can sign in and view live database data + project status files, served from production Cloud Run.

## Design

### Pages

| Route | Content | Validates |
|-------|---------|-----------|
| `/dashboard` | Hello World + DB query result | Database connectivity in Cloud Run |
| `/dashboard/workflow` | Renders `docs/bmm-workflow-status.yaml` | File system access in container |
| `/dashboard/sprint` | Renders `docs/sprint-status.yaml` | File system access + YAML parsing |
| `/admin` | Manage access (view logs) | Admin role check works |

### Component Architecture

```
app/
├── (protected)/
│   ├── layout.tsx          # Auth gate via middleware
│   └── dashboard/
│       ├── page.tsx         # Hello World + DB fetch
│       ├── workflow/page.tsx # YAML file render
│       └── sprint/page.tsx  # YAML file render
└── admin/
    └── page.tsx             # Admin view
```

### Data Flow

**Hello World page:** Server component fetches from PostgreSQL via `query()`. Renders DB record server-side — proves connectivity.

**Status pages:** `fs.readFile()` reads YAML from `/docs/` dir inside container. Parsed with `js-yaml`. Rendered as pre-formatted display.

**Design:** Minimal, functional UI with Tailwind. Not the focus — infrastructure validation is.

## Plan

- [ ] Story 4.1: Dashboard layout + navigation (protected route wrapper)
- [ ] Story 4.2: Hello World page (PostgreSQL data fetch + display)
- [ ] Story 4.3: Workflow status page (YAML file render)
- [ ] Story 4.4: Sprint status page (YAML file render)
- [ ] Story 4.5: Admin page (access log view)
- [ ] Story 4.6: End-to-end validation across all three environments

## Test

### Epic Success Criteria

- [ ] Unauthenticated user → redirected to sign-in
- [ ] Authenticated + whitelisted → sees Dashboard with DB data
- [ ] Dashboard shows PostgreSQL query result (not mock data)
- [ ] Workflow status page renders YAML content correctly
- [ ] Sprint status page renders YAML content correctly
- [ ] All pages accessible in dev, staging, and production environments
- [ ] No "cold start" errors after Neon auto-suspend

## Notes

**Source:** `docs/2-planning/epics.md` Epic 4 section (2025-11-06)

**Depends on:** Epic 2 (database), Epic 3 (auth).

**YAML files in container:** The Docker image must COPY `docs/` directory so YAML files are available at runtime inside Cloud Run. Add to Dockerfile: `COPY docs/ ./docs/`

**UI ambition:** Keep it functional, not fancy. This validates the infrastructure, not the UX. A clean table or pre block is sufficient for status pages.
