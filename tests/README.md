# Test Suite Documentation

**Project:** role-directory  
**Test Framework:** Playwright (E2E) + Vitest (Unit/Component)  
**Architecture:** Phase 2 Automated Testing  
**Generated:** 2025-11-06

---

## Overview

This test suite provides comprehensive coverage for the role-directory application using modern testing best practices:

- **Playwright**: E2E and API tests with multi-browser support
- **Vitest**: Fast unit and component tests
- **Fixture Architecture**: Auto-cleanup test infrastructure
- **Data Factories**: Faker-based test data generation

**Architecture Reference:** `docs/test-design-epic-1.md`

---

## Prerequisites

- Node.js 22.x (see `.nvmrc`)
- npm or yarn
- Running application (for E2E tests)

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.test.example .env.test
# Edit .env.test with your test environment values
```

### 3. Install Playwright Browsers

```bash
npx playwright install
```

---

## Running Tests

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test tests/e2e/health-check.spec.ts

# Debug mode
npm run test:e2e:debug
```

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test:unit

# Run in watch mode
npm run test:unit:watch

# Run with coverage
npm run test:unit:coverage

# Run specific test file
npx vitest tests/unit/health-route.test.ts
```

### All Tests

```bash
# Run entire test suite
npm test
```

---

## Test Organization

```
tests/
├── e2e/                                          # End-to-end tests (Playwright)
│   ├── health-check.spec.ts                     # API health check tests
│   ├── landing-page.spec.ts                     # Landing page UI tests
│   └── cloud-run-production-verification.spec.ts # Story 1.8 verification (infrastructure)
├── api/                                          # API integration tests (future)
├── unit/                                         # Unit tests (Vitest)
│   └── health-route.test.ts                     # Route handler unit tests
├── support/                                      # Test infrastructure (CRITICAL)
│   ├── fixtures/                                # Playwright fixtures with auto-cleanup
│   │   ├── index.ts                             # Main fixture export (import from here)
│   │   └── factories/                           # Data factories (faker-based)
│   │       └── user-factory.ts
│   ├── helpers/                                  # Utility functions
│   │   └── wait-for.ts                          # Deterministic waiting (no hard waits)
│   ├── page-objects/                             # Page Object Models (optional)
│   └── setup.ts                                 # Vitest global setup
└── README.md                                     # This file
```

---

## Test Patterns

### Given-When-Then Structure

All tests follow Given-When-Then (Gherkin) format for clarity:

```typescript
test('should display error for invalid credentials', async ({ page }) => {
  // GIVEN: User is on login page
  await page.goto('/login');

  // WHEN: User submits invalid credentials
  await page.fill('[data-testid="email-input"]', 'invalid@example.com');
  await page.click('[data-testid="login-button"]');

  // THEN: Error message is displayed
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});
```

### Fixture Architecture

Use custom fixtures for auto-cleanup:

```typescript
import { test, expect } from '../support/fixtures';

test('should create user', async ({ page, userFactory }) => {
  // userFactory automatically cleans up after test
  const user = await userFactory.createUser({ email: 'test@example.com' });
  
  // Use user in test...
});
```

### Selector Strategy

**Priority order:**

1. `data-testid` attributes (most stable)
2. ARIA roles and labels (accessibility)
3. Text content (for user-facing elements)
4. CSS selectors (last resort)

**Example:**

```typescript
// ✅ Good: data-testid
await page.click('[data-testid="submit-button"]');

// ✅ Good: ARIA role
await page.click('button[role="button"]:has-text("Submit")');

// ⚠️ Acceptable: Text content
await page.click('text=Submit');

// ❌ Avoid: Brittle CSS selectors
await page.click('.btn.btn-primary.submit-btn'); // Too fragile!
```

### Network-First Pattern

Intercept routes **before** navigation to avoid race conditions:

```typescript
test('should mock API response', async ({ page }) => {
  // CRITICAL: Intercept BEFORE navigate
  await page.route('**/api/user', (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({ id: 1, name: 'Test User' }),
    }),
  );

  // NOW navigate
  await page.goto('/dashboard');

  await expect(page.locator('[data-testid="user-name"]')).toHaveText('Test User');
});
```

---

## Test Priorities

**P0 (Critical)**: Run on every commit, must pass 100%
- Health check endpoint
- Core deployment validation
- Security-critical paths

**P1 (High)**: Run on PR to main, ≥95% pass rate
- Important user features
- Configuration validation
- Common workflows

**P2 (Medium)**: Run nightly, ≥80% pass rate
- Secondary features
- Edge cases
- Documentation validation

**P3 (Low)**: Run on-demand
- Exploratory tests
- Performance benchmarks

---

## Debugging

### Playwright Trace Viewer

Playwright automatically captures traces on failure. View them:

```bash
npx playwright show-report
```

### Debug Mode

Run tests in debug mode with breakpoints:

```bash
npm run test:e2e:debug

# Or for specific test
npx playwright test --debug tests/e2e/landing-page.spec.ts
```

### Visual Debugging

Playwright captures:
- **Screenshots**: Only on failure
- **Videos**: Retained on failure only
- **Traces**: Full trace with network, console, DOM snapshots

All artifacts saved to `test-results/`

---

## CI/CD Integration

Tests run automatically in GitHub Actions:

```yaml
# .github/workflows/test.yml
- name: Run E2E tests
  run: npm run test:e2e
  
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: test-results
    path: test-results/
```

---

## Knowledge Base References

The test suite follows patterns from the Master Test Architect knowledge base:

- **Fixture Architecture**: `bmad/bmm/testarch/knowledge/fixture-architecture.md`
- **Data Factories**: `bmad/bmm/testarch/knowledge/data-factories.md`
- **Network-First**: `bmad/bmm/testarch/knowledge/network-first.md`
- **Test Quality**: `bmad/bmm/testarch/knowledge/test-quality.md`
- **Selector Resilience**: `bmad/bmm/testarch/knowledge/selector-resilience.md`
- **Timing Debugging**: `bmad/bmm/testarch/knowledge/timing-debugging.md`

---

## Best Practices

### ✅ Do

- Use `data-testid` for stable selectors
- Write atomic tests (one assertion per test)
- Use Given-When-Then structure
- Clean up test data (fixtures handle this)
- Wait for specific conditions (no hard waits)
- Intercept routes before navigation

### ❌ Don't

- Use hard waits (`await page.waitForTimeout(5000)`)
- Use brittle CSS selectors
- Test implementation details
- Leave test data in database
- Navigate before route interception
- Duplicate coverage at multiple levels

---

## Troubleshooting

### "Timed out waiting for..."

- Check selector is correct (`data-testid`)
- Verify element is visible/enabled
- Use network-first pattern for API-dependent elements
- Increase timeout if legitimately slow

### "Element not found"

- Use Playwright Inspector: `npx playwright test --debug`
- Check for dynamic rendering (wait for network)
- Verify selector in trace viewer

### "Flaky test" (passes sometimes, fails other times)

- Replace hard waits with deterministic waits
- Use network-first route interception
- Check for race conditions (async operations)
- Review: `bmad/bmm/testarch/knowledge/test-healing-patterns.md`

---

## Infrastructure Verification Tests

### Story 1.8: Cloud Run Production Service Verification

Special test suite for verifying production Cloud Run service configuration.

**Prerequisites:**

```bash
# Set environment variables
export PRODUCTION_URL=$(gcloud run services describe role-directory-production --format="value(status.url)")
export GCP_AUTH_TOKEN=$(gcloud auth print-identity-token)
```

**Run Tests:**

```bash
# Run production verification tests
npx playwright test tests/e2e/cloud-run-production-verification.spec.ts

# Expected: All tests pass after manual service setup
```

**Test Coverage:**
- ✅ Production URL accessible with authentication (AC-1)
- ✅ IAM authentication required (not public) (AC-5)
- ✅ No cold starts (min 2 instances) (P0)
- ✅ Concurrent request handling (P1)
- ✅ P95 response time <200ms (NFR-2)
- ✅ High availability verification (AC-2)
- ✅ Manual verification guide (gcloud commands)

**See:** `docs/stories/1-8-atdd-checklist.md` for complete ATDD workflow

---

## Next Steps

1. ✅ Test framework initialized
2. ✅ Infrastructure verification tests (Story 1.8)
3. ⏳ Add E2E tests for Epic 2 (Database connectivity)
4. ⏳ Add E2E tests for Epic 3 (Authentication)
5. ⏳ Add Component tests for UI features
6. ⏳ Integrate tests into CI/CD pipeline (Story 1.3 update)

---

**Generated by:** Murat (Master Test Architect - TEA Agent)  
**Workflow:** `bmad/bmm/testarch/framework`  
**Date:** 2025-11-06

<!-- Powered by BMAD-CORE™ -->

