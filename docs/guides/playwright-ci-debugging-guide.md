# Playwright CI Debugging Guide

This guide explains how to debug Playwright test failures in GitHub Actions CI using trace viewer and HTML reports.

---

## 📋 Table of Contents

- [Understanding Trace Configuration](#understanding-trace-configuration)
- [Downloading GitHub Actions Artifacts](#downloading-github-actions-artifacts)
- [Using Playwright Trace Viewer](#using-playwright-trace-viewer)
- [Common CI Issues and Solutions](#common-ci-issues-and-solutions)
- [Best Practices](#best-practices)

---

## 🔍 Understanding Trace Configuration

### Current Configuration

Our `playwright.config.ts` is configured with:

```typescript
{
  retries: process.env.CI ? 2 : 0,  // Retry failed tests twice in CI
  trace: 'on-first-retry',          // Record trace on first retry
  screenshot: 'only-on-failure',    // Capture screenshots on failure
  video: 'retain-on-failure',       // Keep videos of failed tests
}
```

### What This Means

1. **Local Development**:
   - Tests run once (no retries)
   - No traces recorded (faster execution)
   - Screenshots/videos only on failure

2. **CI Environment**:
   - Tests retry up to 2 times on failure
   - **First retry records full trace** (all actions, network, console)
   - Screenshots and videos captured for failures

### Why `on-first-retry`?

- **Storage efficient**: Only creates traces when needed (on retry)
- **Debugging complete**: Captures everything that happened during the retry
- **Performance**: Doesn't slow down successful first runs
- **CI-optimized**: Perfect balance for GitHub Actions

---

## 📥 Downloading GitHub Actions Artifacts

### Step 1: Navigate to Failed Workflow

1. Go to your GitHub repository
2. Click **Actions** tab
3. Find the failed workflow run
4. Click on the failed run

### Step 2: Download Artifacts

1. Scroll to the **Artifacts** section at the bottom of the page
2. Look for artifacts like:
   - `playwright-report` - HTML report with traces
   - `test-results` - JUnit XML and other outputs
3. Click the artifact name to download (ZIP file)

**GitHub Docs**: [Downloading Workflow Artifacts](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/downloading-workflow-artifacts)

### Step 3: Extract and Open Report

```bash
# Extract the downloaded artifact
unzip playwright-report.zip

# Open the HTML report
open playwright-report/index.html
# Or on Linux:
xdg-open playwright-report/index.html
```

---

## 🎬 Using Playwright Trace Viewer

### Opening a Trace

1. **Open HTML Report**: `playwright-report/index.html`
2. **Find Failed Test**: Look for tests with ❌ status
3. **Click on the Test**: Expands test details
4. **Switch to Retry Tab**: Click **"Retry #1"** tab
5. **View Trace**: Click **"Trace"** to open trace viewer

### What You'll See in Trace Viewer

```
┌─────────────────────────────────────────────────────┐
│ Timeline (top)                                      │
│ ──────────────────────────────────────────────────  │
│ Each action shown as a bar with duration            │
└─────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────────────────────┐
│ Actions (left)   │ Details (right)                  │
│                  │                                  │
│ ○ page.goto()    │ Screenshots                      │
│ ○ page.click()   │ DOM snapshot                     │
│ ○ expect()       │ Console logs                     │
│ ○ page.fill()    │ Network requests                 │
│                  │ Source code                      │
└──────────────────┴──────────────────────────────────┘
```

### Key Features

| Feature | Description | Use Case |
|---------|-------------|----------|
| **Timeline** | Visual representation of test execution | Identify slow operations |
| **Actions** | Step-by-step list of all actions | See exact sequence of events |
| **Screenshots** | Before/after images for each action | Visual debugging |
| **DOM Snapshot** | Page structure at each step | Inspect elements |
| **Console** | Browser console logs | Find JS errors |
| **Network** | All network requests/responses | Debug API calls |
| **Source** | Test source code | Context of failure |

### Debugging Workflow

1. **Identify Failing Action**: Click through actions in left panel
2. **Inspect Screenshot**: See what the page looked like
3. **Check Console**: Look for JavaScript errors
4. **Review Network**: Check if API calls succeeded
5. **Examine DOM**: Verify elements exist with correct selectors
6. **Compare Timing**: Use timeline to spot delays

---

## 🐛 Common CI Issues and Solutions

### Issue 1: Timing Issues (Race Conditions)

**Symptoms**:
- Test passes locally but fails in CI
- Intermittent failures
- "Element not found" errors

**Debug with Trace**:
1. Open trace viewer
2. Look at timeline - is there a long gap?
3. Check network tab - are requests delayed?
4. Compare screenshot timing - did content load late?

**Solution**:
```typescript
// ❌ Bad: Hard wait
await page.waitForTimeout(1000);

// ✅ Good: Wait for specific condition
await page.waitForSelector('[data-testid="profile"]');
await page.waitForLoadState('networkidle');
```

### Issue 2: Authentication State Not Saved

**Symptoms**:
- Login works but session not persisted
- Redirect to login page unexpectedly

**Debug with Trace**:
1. Check if cookies are visible in Network tab
2. Look at the moment storageState is saved
3. Verify profile picture or auth indicator appears

**Solution**:
```typescript
// ❌ Bad: Save state immediately after login
await page.click('[data-testid="login-button"]');
await page.context().storageState({ path: 'auth.json' });

// ✅ Good: Wait for session to be fully established
await page.click('[data-testid="login-button"]');
await page.waitForSelector('[data-testid="profile-picture"]'); // Wait for auth
await page.context().storageState({ path: 'auth.json' });
```

### Issue 3: Slow CI Machines

**Symptoms**:
- Tests timeout in CI but not locally
- Actions take longer than expected

**Debug with Trace**:
1. Compare timeline durations between local and CI
2. Identify slowest operations
3. Check if timeouts are too strict

**Solution**:
```typescript
// Configure CI-specific timeouts
export default defineConfig({
  timeout: process.env.CI ? 45 * 1000 : 60 * 1000,
  use: {
    actionTimeout: 15 * 1000,
    navigationTimeout: 30 * 1000,
  },
});
```

### Issue 4: Missing Environment Variables

**Symptoms**:
- API calls fail with 401/403
- Configuration errors

**Debug with Trace**:
1. Check console for "undefined" errors
2. Look at network requests - are auth headers present?
3. Review request payloads

**Solution**:
```typescript
// Use config factory with validation
import { getTestConfig, requireProductionConfig } from '@/tests/support/factories/config-factory';

test('production test', async ({ request }) => {
  const { productionURL, gcpAuthToken } = requireProductionConfig(); // Throws if missing
  // ...
});
```

---

## ✅ Best Practices

### 1. Always Check Trace First

When a test fails in CI:
1. **Don't guess** - download the trace
2. **Visual inspection** - see exactly what happened
3. **Network analysis** - check API calls
4. **Console logs** - look for errors

### 2. Use Explicit Waits

```typescript
// ❌ Avoid
await page.waitForTimeout(5000);

// ✅ Prefer
await page.waitForSelector('[data-testid="content"]');
await page.waitForLoadState('networkidle');
await page.waitForResponse(resp => resp.url().includes('/api/'));
```

### 3. Add Debug Logs

```typescript
test('user login', async ({ page }) => {
  console.log('Navigating to login page...');
  await page.goto('/login');
  
  console.log('Filling credentials...');
  await page.fill('[name="email"]', 'user@example.com');
  
  console.log('Submitting form...');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for redirect...');
  await page.waitForURL('/dashboard');
});
```

Logs appear in trace viewer console tab!

### 4. Use Page Object Pattern

```typescript
// page-objects/LoginPage.ts
export class LoginPage {
  async login(email: string, password: string) {
    console.log(`Logging in as ${email}`);
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
    
    // Wait for auth to complete
    await this.page.waitForSelector('[data-testid="user-menu"]');
    console.log('Login successful - auth token received');
  }
}
```

### 5. Configure Appropriate Retries

```typescript
// playwright.config.ts
export default defineConfig({
  // Retry flaky tests in CI
  retries: process.env.CI ? 2 : 0,
  
  // But don't hide real failures
  maxFailures: process.env.CI ? 1 : undefined,
});
```

### 6. Name Tests Descriptively

```typescript
// ❌ Bad
test('test 1', async ({ page }) => { /* ... */ });

// ✅ Good
test('[1.6-E2E-001] should return 200 OK with valid health check response', async ({ page }) => {
  // ...
});
```

Makes it easier to find the right test in trace viewer!

---

## 🔧 Local Trace Recording

You can also record traces locally for debugging:

### Option 1: Always Record

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    trace: 'on', // Always record (slower)
  },
});
```

### Option 2: Manual Trace

```bash
# Run with trace
npx playwright test --trace on

# Then view trace
npx playwright show-trace trace.zip
```

### Option 3: Per-Test Trace

```typescript
test('debug this test', async ({ page }, testInfo) => {
  // Enable trace for this test only
  await testInfo.attach('trace', {
    body: await page.context().tracing.stop(),
    contentType: 'application/zip'
  });
});
```

---

## 📚 Additional Resources

- **Playwright Docs**: https://playwright.dev/docs/trace-viewer
- **GitHub Actions Artifacts**: https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/downloading-workflow-artifacts
- **Debugging Guide**: https://playwright.dev/docs/debug
- **CI Best Practices**: https://playwright.dev/docs/ci-intro

---

## 🎯 Quick Checklist

When debugging CI failures:

- [ ] Download playwright-report artifact from GitHub Actions
- [ ] Extract and open `index.html`
- [ ] Find failed test and click "Retry #1" tab
- [ ] Open trace viewer
- [ ] Check timeline for delays
- [ ] Inspect screenshots before failure
- [ ] Review console logs for errors
- [ ] Check network tab for failed requests
- [ ] Compare with local execution
- [ ] Fix issue and push changes
- [ ] Verify fix in CI with new trace

---

## 💡 Pro Tips

1. **Bookmark the trace viewer URL** - Makes repeated debugging faster
2. **Compare successful and failed runs** - Download both artifacts
3. **Check multiple retries** - Sometimes Retry #2 provides more info
4. **Use CI environment locally** - `CI=true npm run test:e2e`
5. **Record successful runs too** - `trace: 'on'` to baseline behavior

---

**Remember**: Trace viewer is your best friend when debugging CI failures. Always check it before making changes!

