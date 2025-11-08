# Product Scope

## MVP - Minimum Viable Product

**Goal: Validate three-environment deployment workflow with one complete feature**

**Critical Path (In Priority Order):**

**1. Authentication with Neon Auth**
- OAuth sign-in (Google, GitHub, or other providers)
- Or email/password authentication (if OAuth not preferred)
- Email whitelist for access control (restrict to collaborators only)
- User data automatically synced to Neon PostgreSQL database
- Session management handled by Neon Auth (built-in)
- Pre-built UI components (`<SignIn />`, `<UserButton />`)
- **Initial Setup**: Configure OAuth providers in Neon Console, whitelist emails in code

**2. Single Protected Page: "Hello World" Dashboard**
- **ONE page that proves the entire stack:**
  - Requires authenticated user (OAuth or email/password via Neon Auth)
  - Fetches and displays data from PostgreSQL (proves database connectivity)
  - Simple query: SELECT from existing role/pricing tables or version info
  - Displays authenticated user info from Neon Auth
  - Renders query results as formatted display (proves full request cycle)
- **This single page validates**: OAuth → Neon Auth → Session → Cloud Run → PostgreSQL → Rendering

**3. Full Three-Environment Deployment Pipeline**
- **Dockerized Next.js Application**
  - Multi-stage build for size optimization
  - Production-ready Dockerfile
  - Environment variable injection (database URLs, secrets)
- **GitHub Actions CI/CD - Simplified Initial Pipeline**
  - Trigger on commit to `main`
  - Stages: **Lint → Type Check → Build → Deploy to Dev**
  - Manual promotion workflows: Dev → Staging, Staging → Production
  - Basic health check after deployment (HTTP 200 check)
- **Three Environments (Core Validation)**
  - **Dev**: Auto-deploy on commit to `main`, rapid iteration
  - **Staging**: Manual promotion from Dev, stable validation
  - **Production**: Manual promotion from Staging, protected showcase
  - Each environment has separate Cloud Run service + separate PostgreSQL database

**4. Database Schema (MVP Tables)**
- **Neon Auth Tables** (auto-created by Neon Auth):
  - User profiles, authentication data, sessions
  - Automatically synced by Neon Auth (no custom code needed)
- *(Existing role/pricing tables remain for Hello World page queries)*
- **No custom auth tables needed** - Neon Auth handles all user/session data

**5. Initial Testing Strategy (Minimal)**
- **CI Pipeline**: Lint (ESLint) + Type Check (TypeScript) + Build verification
- **Manual Testing**: Verify OAuth sign-in and Hello World dashboard work in each environment
- *(Comprehensive automated tests deferred to Growth phase)*

## Growth Features (Post-MVP)

**Phase 2: Testing & Quality Automation** *(Deferred from MVP)*
- **Unit & Integration Tests**: Vitest + React Testing Library (70%+ coverage target)
  - Test: Code validation logic, session management, API routes
- **API Integration Tests**: Supertest + Vitest (100% API route coverage)
  - Test: All endpoints, authentication, error cases
- **E2E Smoke Tests**: Playwright (5-10 critical user flows)
  - Test: Code entry → access, expiry handling, page rendering
- Add test stages to CI/CD pipeline (after build, before deploy)

**Phase 3: Admin Interface & Enhanced Access Control**
- **Admin UI** for code generation (instead of SQL scripts)
  - Generate new invitation codes (random alphanumeric, 8-12 characters)
  - View active codes with expiry timestamps
  - Protected by environment variable or simple admin password
- Usage analytics per code (how many users, when accessed)
- Limit number of uses per code (configurable)
- Admin dashboard with access logs and usage trends

**Phase 4: Additional Dashboard Pages** *(Deferred from MVP)*
- **Workflow Status Page**: Displays `docs/bmm-workflow-status.yaml`
  - Reads file from file system, proves file access in Cloud Run
- **Sprint Status Page**: Displays `docs/sprint-status.yaml`
  - Same pattern, graceful handling if file doesn't exist

**Phase 5: Monitoring & Operations**
- Structured logging with log levels (info, warn, error)
- Error tracking integration (Sentry or similar)
- Basic metrics dashboard (request counts, error rates)
- Automated health checks and alerting
- Email notifications when codes are generated or used

**Phase 6: Core Application Features**
- Display role catalog data (from existing database tables)
- Pricing information by region
- Career track visualization
- Search and filtering capabilities

## Vision (Future)

**Phase 7: Public Launch**
- Remove or make invitation codes optional (early access mode)
- User accounts and authentication (if needed)
- Public marketing site
- Full feature set based on validated role/pricing data model

---
