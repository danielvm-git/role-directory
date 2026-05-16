---
status: complete
created: '2026-04-17'
tags:
  - guide
  - docker
  - local-dev
priority: medium
created_at: '2026-04-17T01:14:51.240315+00:00'
---
# Guide: Docker Build and Local Development

## Overview

Operational guide for building and running the role-directory Docker image locally and in CI/CD.

**Requirements:** Docker 20.x+, Docker daemon running.

## Design

**Multi-stage build:** Alpine Node.js 22, Next.js standalone output.
**Target image size:** <500MB.
**Port:** 8080 (Cloud Run standard).

### Key environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` / `development` / `staging` |
| `PORT` | No | Defaults to 8080 |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `ALLOWED_EMAILS` | Yes | Comma-separated email whitelist |

## Plan

### Build

```bash
docker build -t role-directory:local .
docker images role-directory:local   # verify <500MB
```

### Run locally

```bash
# Minimal
docker run -p 8080:8080 -e NODE_ENV=production role-directory:local

# With all env vars
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://..." \
  -e ALLOWED_EMAILS="you@example.com" \
  role-directory:local
```

App: `http://localhost:8080`
Health check: `http://localhost:8080/api/health`

### CI/CD build (GitHub Actions)

```bash
# Build with commit SHA tag
docker build -t gcr.io/PROJECT_ID/role-directory:$GITHUB_SHA .

# Push to Artifact Registry
docker push gcr.io/PROJECT_ID/role-directory:$GITHUB_SHA
```

### Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Port conflict | Another process on 8080 | Change `-p 9090:8080` |
| DB connection error | Missing `DATABASE_URL` | Add env var |
| Build fails | Missing `output: 'standalone'` in next.config | Add config |

## Test

- [x] `docker build` completes in <5 minutes
- [x] Image size <500MB (Alpine + standalone)
- [x] Container starts and responds at `http://localhost:8080`
- [x] Health check returns `{ "status": "ok" }`
- [x] Environment variables passed at runtime (not baked in)

## Notes

**Source:** `docs/DOCKER.md` — full command reference

**Standalone output:** `next.config.ts` must have `output: 'standalone'` for the Dockerfile COPY pattern to work. Without it, the build stage output cannot be efficiently copied to the runner stage.