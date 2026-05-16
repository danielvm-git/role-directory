---
status: complete
created: 2026-04-17
priority: high
tags:
- epic-1
- ci
- github-actions
parent: 004-epic-1-foundation
created_at: 2026-04-17T01:11:47.544962Z
updated_at: 2026-04-17T01:16:11.537618Z
completed_at: 2026-04-17T01:16:11.537618Z
---

# Story 1.3: GitHub Actions CI Pipeline

## Overview

As a **developer**, I want a GitHub Actions workflow that runs lint, type check, and build on every commit to main, so that code quality is automatically validated before deployment.

## Design

**Workflow file:** `.github/workflows/ci-cd-dev.yml`
**Trigger:** `push` to `main`
**Stages (in order):**
1. Checkout code (`actions/checkout@v4`)
2. Set up Node.js 22.x (`actions/setup-node@v4` with npm cache)
3. Install dependencies (`npm ci`)
4. Run ESLint (`npm run lint`)
5. Run TypeScript check (`npm run type-check`)
6. Build (`npm run build`)

**Performance:** `node_modules` cached via `actions/cache` keyed on `package-lock.json`. Target: <5 minutes total.

## Plan

- [x] Create `.github/workflows/ci-cd-dev.yml`
- [x] Configure `push` trigger on `main` branch
- [x] Add `setup-node@v4` with npm caching
- [x] Add lint, type-check, build steps
- [x] Add workflow status badge to README
- [x] Verify pipeline runs and passes on first commit

## Test

- [x] Workflow triggers on commit to `main`
- [x] All 3 stages complete successfully
- [x] Pipeline fails fast if lint errors exist
- [x] Completes in <5 minutes
- [x] Status visible in GitHub commit/PR UI

## Notes

**Source:** `docs/stories/1-3-github-actions-ci-pipeline.md` (Status: done)

Note: This workflow does NOT deploy. Deployment added in Story 1.5 as an additional stage.