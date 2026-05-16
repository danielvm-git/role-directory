---
status: planned
created: 2026-04-17
priority: high
tags:
- epic
- auth
- neon-auth
- access-control
depends_on:
- 005-epic-2-database
created_at: 2026-04-17T01:10:07.044084Z
updated_at: 2026-04-17T01:16:44.758449Z
---

# Epic 3: Authentication & Access Control

> **Status**: planned · **Priority**: high · **Created**: 2026-04-17

## Overview

Implement secure access control for collaborators using Neon Auth with email whitelist, replacing the manual invitation code concept with a production-ready OAuth-based system.

**Value:** Authentication is the gateway to all protected content. Neon Auth handles OAuth and session management, saving 2-3 days of custom implementation.

## Design

### Authentication Strategy

**Chosen:** Neon Auth (email whitelist via OAuth)
- OAuth providers (Google, GitHub) — no custom password system
- Neon Auth manages sessions (no custom session storage needed)
- Email whitelist controls who can access (`ALLOWED_EMAILS` env var)
- Stateless from Cloud Run's perspective — Neon Auth handles session state

**Why Neon Auth over custom:** Saves 2-3 days. OAuth is more secure than invitation codes. Auto-handles token refresh, session expiry, CSRF protection.

### Access Control Flow

```
Public routes: /                 — landing page (sign-in button)
Protected routes: /dashboard/**  — requires valid Neon Auth session
Admin routes: /admin/**          — requires email in ALLOWED_ADMINS list
```

### Middleware Pattern

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = getSession(request); // Neon Auth
  if (!session && isProtectedRoute(request.url)) {
    return redirectToSignIn();
  }
  if (!isAllowedEmail(session.email) && isProtectedRoute(request.url)) {
    return redirectToUnauthorized();
  }
}
```

## Plan

- [ ] Story 3.1: Neon Auth project setup and OAuth configuration
- [ ] Story 3.2: Sign-in page and OAuth callback handler
- [ ] Story 3.3: Session middleware (protect `/dashboard/**` and `/admin/**`)
- [ ] Story 3.4: Email whitelist enforcement (`ALLOWED_EMAILS` config)
- [ ] Story 3.5: Admin role check (`ALLOWED_ADMINS` config)
- [ ] Story 3.6: Sign-out and session cleanup

## Test

- [ ] Unauthenticated users redirected to sign-in
- [ ] OAuth sign-in flow completes successfully
- [ ] Email not on whitelist → shows "Access denied" (not 500)
- [ ] Authenticated + whitelisted → access to `/dashboard/**`
- [ ] Admin email → access to `/admin/**`
- [ ] Non-admin email → 403 on `/admin/**`
- [ ] Session persists across Cloud Run restarts (database-backed)
- [ ] Sign-out clears session

## Notes

**Source:** `docs/2-planning/epics.md` Epic 3 section (2025-11-06)

**Decision: Neon Auth over invitation codes**
Original PRD described invitation codes as the access mechanism. Architecture review recommended Neon Auth instead:
- More secure (OAuth vs shared codes)
- Email whitelist is simpler to manage than code lifecycle
- Neon Auth handles all edge cases (token refresh, CSRF, etc.)
- Free for the usage levels expected

**Depends on:** Epic 2 (database connectivity) for session storage.
