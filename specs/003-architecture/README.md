---
status: complete
created: '2026-04-17'
tags:
  - architecture
  - design
  - decisions
priority: high
created_at: '2026-04-17T01:09:05.421148+00:00'
---

# Architecture: Serverless Monolith on Cloud Run

> **Status**: complete · **Priority**: high · **Created**: 2026-04-17

## Overview

Serverless monolith architecture on Google Cloud Run with Neon PostgreSQL. Prioritizes **serverless scalability, ~$0-3/month cost, and deployment validation** over feature richness.

**Architecture Style:** Serverless monolith with external auth (Neon Auth) and managed database (Neon PostgreSQL).

**Principles:**
- Serverless-First: Cloud Run + Neon both auto-scale and auto-suspend
- Infrastructure Validation: every feature proves a different deployment layer
- Cost-Optimized: free tiers for all services
- TypeScript Everywhere: type safety from database to UI
- Stateless Containers: database-backed sessions, no in-memory state

## Design

### Technology Decisions

| Category | Decision | Version | Rationale |
|----------|----------|---------|-----------|
| Framework | Next.js | 15.0.3 | App Router, RSC support, modern React |
| UI Library | React | 18.3.1 | Stable production (React 19 still RC at time) |
| Language | TypeScript | 5.6.3 | Type safety, fewer runtime errors |
| Runtime | Node.js | 22.11.0 LTS | Latest LTS with V8 optimizations |
| Styling | Tailwind CSS | 3.4.14 | Utility-first, rapid UI development |
| Database | PostgreSQL | 17.0 | via Neon serverless hosting |
| DB Client | @neondatabase/serverless | 0.10.1 | Optimized for serverless, built-in pooling |
| Auth Provider | Neon Auth | Latest | OAuth + session management, saves 2-3 days vs custom |
| Container | Docker | 27.3.1 | Multi-stage builds for optimized images |
| Hosting | GCP Cloud Run | N/A | Serverless, auto-scale, free tier |
| CI/CD | GitHub Actions | N/A | Integrated with GitHub, free tier |
| Secrets (Runtime) | Google Secret Manager | N/A | 6 secrets free, runtime injection |
| Secrets (CI/CD) | GitHub Secrets | N/A | Deployment credentials |
| Validation | Zod | 3.23.8 | Runtime validation, type inference |
| Logging | Structured JSON to stdout | N/A | Cloud Run captures, no extra deps |

### Project Structure

```
role-directory/
├── .github/workflows/       # CI/CD pipelines
├── app/                     # Next.js 15 App Router
│   ├── api/health/          # Health check endpoint
│   ├── api/auth/            # Auth routes (Epic 3)
│   └── (protected)/         # Dashboard pages
├── lib/
│   ├── db/                  # Database client and queries
│   ├── config.ts            # Zod-validated config
│   └── auth/                # Auth utilities
├── components/              # Shared UI components
├── types/                   # TypeScript type definitions
├── Dockerfile               # Multi-stage build
└── docs/                    # Project documentation
```

### Deployment Architecture

```
GitHub → GitHub Actions (CI: lint + typecheck + build)
                      ↓ (auto on main)
              Cloud Run Dev (role-directory-dev)
                      ↓ (manual promote)
           Cloud Run Staging (role-directory-stg)
                      ↓ (manual promote + safeguards)
        Cloud Run Production (role-directory-prd)

All environments → Neon PostgreSQL (isolated databases)
                 → Google Secret Manager (runtime secrets)
```

### Key Architectural Decisions

**ADC-001: Serverless-first**
Scale to zero for cost optimization. Accept cold start latency (<5s target).

**ADC-002: Database-backed sessions**
No in-memory state — required for stateless Cloud Run containers. Sessions stored in PostgreSQL.

**ADC-003: Same Docker image across environments**
Promote the exact dev image to staging then to production. No rebuilds. Config injected via Secret Manager.

**ADC-004: GitHub Actions for CI/CD**
Integrated with GitHub, free tier, `gcloud` CLI for deployments.

**ADC-005: Zod-validated configuration**
All environment variables validated at startup with `lib/config.ts`. Fail fast rather than subtle runtime errors.

**ADC-006: Neon Auth for Epic 3**
Saves 2-3 days vs custom auth. OAuth + session management handled externally.

## Plan

- [x] Define technology stack with rationale
- [x] Design project structure
- [x] Design deployment pipeline (3 environments)
- [x] Define configuration management approach (Zod + Secret Manager)
- [x] Architecture validation report produced
- [x] Implementation readiness confirmed

## Test

- [x] Architecture validation report approved (`docs/3-solutioning/architecture-validation-report-2025-11-06.md`)
- [x] Implementation readiness report produced
- [x] Tech spec for Epic 1 produced and executed
- [ ] Tech spec for Epic 2 executed
- [ ] Tech spec for Epics 3 & 4 produced

## Notes

**Source:** `docs/3-solutioning/architecture.md` (v1.0, 2025-11-06, danielvm + Winston Architect)

**Testing strategy (Phase 2, deferred):**
- Unit: Vitest 2.1.1
- Component: @testing-library/react 16.0.1
- E2E: Playwright 1.48.0

**Cost breakdown:** All services on free tier. Estimated $0-3/month. Cloud Run, Neon, Secret Manager (6 free secrets), GitHub Actions all within free limits for MVP traffic.
