# PRD Summary

## What We're Building

**role-directory** is a deployment proving ground disguised as a functional web application. The primary goal is to validate a complete production-ready infrastructure stack on Google Cloud Platform before investing in complex features.

## Core Value Proposition

**Infrastructure confidence through practical validation.** Every feature serves to test a different layer of the deployment stack:

- **Invitation codes** → Session management in serverless environment
- **Hello World dashboard** → Database connectivity and query execution  
- **Three environments** → CI/CD pipeline and promotion workflows
- **Docker deployment** → Container optimization and Cloud Run specifics

## MVP Scope (Ruthlessly Focused)

**ONE complete feature flowing through all three environments:**

1. ✅ User enters invitation code
2. ✅ System validates code and creates session
3. ✅ User sees Hello World dashboard with database query results
4. ✅ Feature deployed: Dev → Staging → Production

**What we cut to stay focused:**
- ❌ Admin UI (SQL scripts sufficient)
- ❌ Automated tests in CI/CD (lint + type check + build only)
- ❌ Multiple dashboard pages (one page proves the stack)
- ❌ Comprehensive monitoring (basic Cloud Run logging sufficient)

## Technical Architecture

**Frontend:** Next.js 15 (App Router) + React 18 + TypeScript 5.8  
**Backend:** Next.js API Routes  
**Database:** Neon PostgreSQL Serverless (3 separate databases - free tier)  
**Deployment:** Docker → Cloud Run (3 services: dev, stg, prd)  
**CI/CD:** GitHub Actions  
**Cost Target:** ~$0-3/month (Cloud Run free tier + Neon free tier)

## Success Criteria

**The MVP is complete when:**
- Code committed to `main` → Auto-deploys to Dev
- Manually promoted to Staging → Validated
- Manually promoted to Production → Feature works

**Specific thresholds:**
- Application cold start: <5 seconds (acceptable: <10s)
- Database cold start: <3 seconds (Neon serverless auto-resume)
- Warm database queries: <200ms
- CI/CD pipeline: <10 minutes
- Monthly cost: **~$0-3** (Cloud Run free tier + Neon free tier)

## Requirements Summary

**Functional Requirements:** 6 major areas, 21 specific requirements
- FR-1: Authentication with Neon Auth (4 sub-requirements)
- FR-2: Protected Routes & Authorization (3 sub-requirements)
- FR-3: Hello World Dashboard (4 sub-requirements)
- FR-4: Multi-Environment Deployment (5 sub-requirements)
- FR-5: Database Infrastructure (4 sub-requirements)
- FR-6: Containerization & Docker (3 sub-requirements)

**Non-Functional Requirements:** 6 categories
- NFR-1: Performance (cold start, warm requests, connection pooling)
- NFR-2: Security (sessions, database, input validation, secrets)
- NFR-3: Reliability (error handling, logging, rollback)
- NFR-4: Maintainability (code quality, documentation, structure)
- NFR-5: Scalability (horizontal scaling, cost optimization)
- NFR-6: Deployment & Operations (automation, parity, observability)

## The Magic Thread

**What makes this special:** Infrastructure de-risking through deliberate, incremental validation. danielvm can commit code with confidence, knowing the entire pipeline—from GitHub Actions to Cloud Run to PostgreSQL—has been battle-tested with real features, not toy examples.

This isn't about building a feature-rich application. It's about **earning confidence in the foundation** before building anything complex on top of it.

---
