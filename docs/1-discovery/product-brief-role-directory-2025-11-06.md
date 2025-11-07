# Product Brief: role-directory

**Date:** 2025-11-06
**Author:** danielvm
**Context:** Greenfield web application with secure collaboration

---

## Executive Summary

Role-directory is a read-only web application deployed on Google Cloud Run that serves as a private project dashboard with time-limited access control. The primary goal is to establish a production-ready deployment pipeline (dev → stg → prd) while maintaining confidentiality through invitation code-based access. This enables secure collaboration with trusted stakeholders while building in the open cloud environment.

---

## Core Vision

### Problem Statement

When building applications in the cloud with public URLs, there's a tension between rapid iteration/deployment and maintaining confidentiality during development. Traditional solutions like VPNs or IP whitelisting are cumbersome for sharing progress with distributed collaborators. The developer needs to:

1. Deploy to real cloud infrastructure (not localhost) to validate the full stack
2. Use modern CI/CD workflows (commit → auto-deploy to staging → promote to production)
3. Share progress with specific collaborators without exposing unfinished work publicly
4. Maintain control over who can access the application at any given time

### Proposed Solution

A Next.js application with a simple invitation code system that:

- **Gates all access** behind time-limited (24-hour) invitation codes
- **Provides an admin interface** for generating and managing codes
- **Tracks access server-side** using database or session storage
- **Displays project artifacts** (workflow status, sprint status) to authenticated collaborators
- **Deploys through GitHub Actions** with full dev/stg/prd environments

The invitation code acts as a lightweight, time-boxed access control mechanism that's easy to manage and share.

### Key Differentiators

- **Time-limited access** (24-hour expiry) provides automatic access revocation without manual intervention
- **Reusable codes** allow sharing a single code with multiple collaborators
- **Integrated project dashboard** shows both the application AND the development process (workflow/sprint status)
- **Production-ready from day one** with full CI/CD pipeline and multi-environment setup

---

## Target Users

### Primary Users

**Trusted Collaborators / Stakeholders**

- **Current Situation:** Need to see development progress on danielvm's project but shouldn't have permanent access or ability to share with others
- **Specific Needs:**
  - Easy access with a simple code (no accounts, no passwords)
  - Clear visibility into what's being built (Hello World demo + project status)
  - Understand development progress (workflow and sprint tracking)
- **Technical Comfort:** Mixed - some technical, some non-technical stakeholders
- **What They Value Most:** Transparency into progress without friction

**danielvm (Project Owner/Admin)**

- **Current Situation:** Building in the cloud, wants to share progress selectively, needs to maintain confidentiality
- **Specific Needs:**
  - Quick code generation to share with new collaborators
  - Automatic expiry so access doesn't need manual revocation
  - Confidence that the deployment pipeline works correctly
  - Ability to validate full stack (database, Cloud Run, CI/CD) early
- **What He Values Most:** Control, simplicity, and infrastructure validation

---

## Success Metrics

### MVP Success Criteria

**Infrastructure Validation:**
- ✅ Successful deployment to all three environments (dev, stg, prd)
- ✅ Database connectivity working in Cloud Run
- ✅ GitHub Actions successfully builds and deploys on commit
- ✅ Changes flow smoothly: commit → stg → manual promotion → prd

**Access Control:**
- ✅ Valid codes grant 24-hour access
- ✅ Expired codes are properly rejected
- ✅ Multiple users can use the same code
- ✅ Admin can generate new codes easily

**Functional Goals:**
- ✅ Collaborators can view Hello World page with database data
- ✅ Collaborators can see workflow status YAML
- ✅ Collaborators can see sprint status YAML
- ✅ Expired users see clear message and can enter new code

---

## MVP Scope

### Core Features

**1. Invitation Code Access Control**
- Public landing page with code entry form
- Server-side validation of invitation codes against database
- Session/token management (24-hour duration, stored server-side or in database)
- Automatic expiry with "code expired" message
- Redirect to code entry after expiry (can enter new code)
- Support for code reuse (multiple users per code)

**2. Admin Interface (Protected)**
- Generate new invitation codes (random generation)
- View active codes and their expiry times
- Simple UI - doesn't need to be fancy, just functional

**3. Collaborator Dashboard (Protected by codes)**
- **Hello World Page:** Fetches and displays simple data from PostgreSQL (proof of database connectivity)
- **Workflow Status Page:** Displays contents of `docs/bmm-workflow-status.yaml`
- **Sprint Status Page:** Displays contents of `docs/sprint-status.yaml` (when it exists)

**4. Full Deployment Pipeline**
- Dockerized Next.js application
- PostgreSQL connection with connection pooling
- GitHub Actions CI/CD:
  - Lint & type check
  - Build Docker image
  - Deploy to Cloud Run (dev environment on commit to main)
  - Manual promotion to staging
  - Manual promotion to production
- Three environments: dev, stg, prd (separate Cloud Run services)

**5. Database Schema**
- `invitation_codes` table: code, created_at, expires_at
- `access_sessions` table: session_id, code_used, created_at, expires_at, last_accessed
- (Existing role/pricing tables are present but not used in MVP)

### Out of Scope for MVP

**Deferred to Future Phases:**
- User accounts or authentication
- Actual role/pricing data display and features
- Search, filtering, or complex data interactions
- Analytics or detailed usage tracking
- Email notifications
- Code usage limits (X uses per code)
- Admin dashboard with usage analytics
- Mobile-specific UI
- SSO or OAuth integration
- Rate limiting or abuse prevention (beyond basic expiry)

### Future Vision

**Phase 2: Core Application Features**
- Display and explore role catalog data
- Pricing information by region
- Career track visualization
- Search and filtering capabilities

**Phase 3: Enhanced Access Control**
- Usage analytics per code
- Limit number of uses per code
- Email/Slack notifications when codes are generated
- Admin dashboard with detailed access logs

**Phase 4: Full Application**
- Public launch (remove invitation codes or make them opt-in for early access)
- User accounts (if needed)
- Advanced features based on user feedback

---

## Technical Preferences

### Core Technology Stack

**Frontend Framework:**
- Next.js 15.x (App Router)
- React 18.x
- TypeScript 5.8.x
- Node.js 22.x runtime

**Database:**
- PostgreSQL
- Read-optimized queries
- Connection pooling for Cloud Run (pg-pool or similar)

**Deployment:**
- Google Cloud Run (containerized)
- Docker
- GitHub Actions for CI/CD
- Three environments: dev, stg, prd

**Testing Strategy:**
- Unit & Integration: Vitest + React Testing Library (70%+ coverage, <30s execution)
- API Integration: Supertest + Vitest (100% API route coverage)
- E2E Smoke Tests: Playwright (5-10 critical scenarios, <2min execution)
- CI/CD Pipeline stages: Lint → Type Check → Unit Tests → Build → E2E → Deploy → Health Check

**Session Management:**
- Server-side session storage (database or Redis if needed)
- HTTP-only cookies for session tokens
- 24-hour TTL enforced server-side

---

## Organizational Context

### Project Goals

**Primary Goal:** Establish a production-ready deployment pipeline and infrastructure foundation that supports rapid, confident iteration.

**Secondary Goal:** Enable selective collaboration on confidential work without infrastructure complexity (VPNs, IP whitelisting).

### Strategic Value

- **Infrastructure First:** Validates the full tech stack (Next.js + PostgreSQL + Cloud Run + GitHub Actions) before building complex features
- **Risk Mitigation:** Ensures deployment automation works correctly early, preventing late-stage surprises
- **Collaboration Enabler:** Allows non-technical stakeholders to see progress without technical setup
- **Reusable Pattern:** The invitation code system can be reused for future projects or early access programs

---

## Timeline Constraints

### MVP Timeline

**Target:** Implement MVP as quickly as possible to validate infrastructure and deployment pipeline.

**Critical Path:**
1. Database schema + invitation code logic
2. Access control middleware
3. Admin interface for code generation
4. Three protected pages (Hello World, Workflow Status, Sprint Status)
5. GitHub Actions pipeline configuration
6. Deploy to all three environments

**Deployment Strategy:**
- Dev environment: Auto-deploy on every commit to `main`
- Staging: Manual promotion from dev (or auto-deploy from `staging` branch)
- Production: Manual promotion from staging (or deploy from `production` branch)

---

## Risks and Assumptions

### Key Assumptions

1. **Security Model:** 24-hour expiring codes are sufficient security for confidential but not sensitive/regulated data
2. **Collaborator Behavior:** Trusted collaborators won't share codes publicly
3. **Code Complexity:** Random alphanumeric codes (8-12 characters) are sufficient
4. **PostgreSQL Access:** Cloud Run can connect to PostgreSQL (Cloud SQL or external) with acceptable latency
5. **Cost:** Cloud Run free tier or low-cost tier is sufficient for light usage during MVP

### Risks & Mitigation

**Risk:** Codes get shared publicly
- **Mitigation:** 24-hour expiry limits exposure window; can regenerate codes if leaked

**Risk:** GitHub Actions configuration issues delay deployment
- **Mitigation:** Start with simplest possible pipeline, iterate to add testing stages

**Risk:** Database connection pooling issues in serverless Cloud Run
- **Mitigation:** Research Cloud Run + PostgreSQL patterns early; consider Cloud SQL Proxy

**Risk:** Session management complexity
- **Mitigation:** Start with simple database-backed sessions; optimize later if needed

---

_This Product Brief captures the vision and requirements for role-directory._

_It was created through collaborative discovery and reflects the unique needs of this greenfield project._

_Next: PRD workflow will transform this brief into detailed product requirements with epics and stories._

