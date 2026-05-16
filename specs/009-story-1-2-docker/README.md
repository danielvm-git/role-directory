---
status: complete
created: 2026-04-17
priority: high
tags:
- epic-1
- docker
- container
parent: 004-epic-1-foundation
created_at: 2026-04-17T01:11:47.510953Z
updated_at: 2026-04-17T01:16:28.267161Z
completed_at: 2026-04-17T01:16:28.267161Z
---

# Story 1.2: Docker Containerization Setup

## Overview

As a **developer**, I want a production-ready Dockerfile with multi-stage build, so that the application can be deployed to Cloud Run in an optimized container.

## Design

**Multi-stage build:**
- Stage 1 (builder): `node:22-alpine` — `npm ci`, `npm run build`
- Stage 2 (runner): `node:22-alpine` — copies `/app/.next/standalone` + `/app/public`, runs `node server.js`

**Key config:**
- `PORT=8080` (Cloud Run standard)
- `NEXT_TELEMETRY_DISABLED=1`
- `.dockerignore`: excludes `node_modules/`, `.git/`, `.next/`, `.env*`
- Output: `output: 'standalone'` in `next.config.ts`

**Target:** Image size <500MB.

## Plan

- [x] Add `output: 'standalone'` to `next.config.ts`
- [x] Create multi-stage `Dockerfile` (builder + runner stages)
- [x] Create `.dockerignore` (node_modules, .git, .next, .env*)
- [x] Test local: `docker build -t role-directory . && docker run -p 8080:8080 role-directory`
- [x] Verify app accessible at `http://localhost:8080`
- [x] Verify image size <500MB

## Test

- [x] `docker build` completes without errors
- [x] Image size <500MB
- [x] Container runs: `docker run -p 8080:8080 -e NODE_ENV=production role-directory`
- [x] App accessible at `http://localhost:8080`
- [x] Environment variables accepted at runtime (not baked in)

## Notes

**Source:** `docs/stories/1-2-docker-containerization-setup.md` (Status: done)

**Why standalone output:** Next.js standalone mode copies only necessary files. Reduces image size significantly. Required pattern for Cloud Run deployments.