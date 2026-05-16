---
status: complete
created: '2026-04-17'
tags:
  - discovery
  - vision
  - product
priority: high
created_at: '2026-04-17T01:08:34.307311+00:00'
---

# Product Brief: role-directory

> **Status**: complete · **Priority**: high · **Created**: 2026-04-17

## Overview

role-directory is a read-only web application deployed on Google Cloud Run that serves as a private project dashboard with time-limited access control. The primary goal is to establish a production-ready deployment pipeline (dev → stg → prd) while maintaining confidentiality through invitation code-based access.

**Core insight:** This is a *deployment proving ground* with useful collaboration features, not a feature-rich application seeking deployment infrastructure.

### Problem Statement

When building applications in the cloud with public URLs, there's tension between rapid iteration/deployment and maintaining confidentiality during development. Traditional solutions like VPNs or IP whitelisting are cumbersome for sharing progress with distributed collaborators.

### Proposed Solution

A Next.js application with a simple invitation code system that:
- **Gates all access** behind time-limited (24-hour) invitation codes
- **Provides an admin interface** for generating and managing codes
- **Displays project artifacts** (workflow status, sprint status) to authenticated collaborators
- **Deploys through GitHub Actions** with full dev/stg/prd environments

### Key Differentiators

- **Time-limited access** (24-hour expiry) — automatic revocation without manual intervention
- **Reusable codes** — share a single code with multiple collaborators
- **Integrated project dashboard** — shows the app AND the development process
- **Production-ready from day one** — full CI/CD + multi-environment

## Design

### Target Users

**Trusted Collaborators / Stakeholders**
- Need access without permanent accounts
- Easy code-based entry (no passwords, no OAuth)
- View project status and dashboard content

**danielvm (Project Owner/Admin)**
- Generate time-limited invite codes
- Validate full deployment stack (database, Cloud Run, CI/CD) early
- Confidence that the pipeline works before building complex features

### MVP Scope

**1. Invitation Code Access Control**
- Public landing page with code entry form
- Server-side validation against database
- 24-hour sessions, stored server-side
- Automatic expiry with re-entry message
- Support for code reuse (multiple users per code)

**2. Admin Interface** (protected)
- Generate new invitation codes
- View active codes and expiry times

**3. Collaborator Dashboard** (protected)
- Hello World Page: fetches data from PostgreSQL (proves DB connectivity)
- Workflow Status Page: displays `docs/bmm-workflow-status.yaml`
- Sprint Status Page: displays `docs/sprint-status.yaml`

**4. Full Deployment Pipeline**
- Dockerized Next.js application
- GitHub Actions: commit → dev auto-deploy → manual promote to stg → manual promote to prd
- Three isolated Cloud Run environments

## Plan

- [x] Define problem statement and target users
- [x] Scope MVP features
- [x] Identify success metrics
- [x] Establish infrastructure-first approach rationale

## Test

### MVP Success Criteria

**Infrastructure Validation:**
- [x] Successful deployment to all three environments (dev, stg, prd)
- [x] Database connectivity working in Cloud Run
- [x] GitHub Actions builds and deploys on commit
- [x] Changes flow: commit → dev → manual promotion → stg → manual promotion → prd

**Access Control:**
- [x] Valid codes grant 24-hour access
- [x] Expired codes are properly rejected
- [x] Multiple users can use the same code
- [x] Admin can generate new codes easily

## Notes

**Source:** `docs/1-discovery/product-brief-role-directory-2025-11-06.md` (2025-11-06)

**Infrastructure-first rationale:** This project inverts the typical development flow. Rather than building features and figuring out deployment later, we build just enough features to thoroughly validate deployment infrastructure. Each capability tests a different infrastructure concern:
- Invitation codes → Session management in serverless environment
- Admin interface → Protected routes and authorization patterns
- Dashboard pages → Database queries and file system access
- Three environments → CI/CD pipeline and promotion workflows
- Docker deployment → Container optimization and Cloud Run specifics
