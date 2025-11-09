# Versioning Guide

**Current Version:** `v1.0.3`  
**Standard:** [Semantic Versioning 2.0.0](https://semver.org)  
**Last Updated:** 2025-11-09

---

## Quick Reference

| What | Version | Status |
|------|---------|--------|
| **Current Release** | `v1.0.3` | Database config (Story 2.2) |
| **Next Release** | `v1.0.4` | Migration setup (Story 2.3) |
| **Next Milestone** | `v1.1.0` | Epic 2 Complete |
| **MVP Target** | `v1.3.0` | All 4 Epics Complete |

---

## Version Strategy

### Core Principle

> **One Epic = One Minor Version**  
> Stories within an epic increment the PATCH number.

### Semantic Versioning Format

According to [semver.org](https://semver.org):

```
MAJOR . MINOR . PATCH
  1   .   0   .   3

  │       │       └─ Bug fixes, small improvements (backward compatible)
  │       └───────── New features, epic completion (backward compatible)  
  └───────────────── Breaking changes (incompatible API changes)
```

### When to Increment

#### PATCH (X.Y.Z+1) - Most Common

**Increment when:**
- ✅ Individual story completed within an epic
- ✅ Bug fix (no new features)
- ✅ Documentation update
- ✅ Performance improvement
- ✅ Security patch (non-breaking)

**Examples:**
- `1.0.3` → `1.0.4` (Story 2.3 complete)
- `1.1.0` → `1.1.1` (Hotfix after release)

#### MINOR (X.Y+1.0) - Epic Milestones

**Increment when:**
- ✅ Epic completed (all stories done)
- ✅ New feature added (backward compatible)
- ✅ New API endpoints
- ✅ Major capability added

**Examples:**
- `1.0.6` → `1.1.0` (Epic 2 complete)
- `1.1.8` → `1.2.0` (Epic 3 complete)

**Reset PATCH to 0** when incrementing MINOR.

#### MAJOR (X+1.0.0) - Breaking Changes

**Increment when:**
- ✅ Breaking API changes (incompatible with previous)
- ✅ Database schema breaking changes
- ✅ Authentication method change (breaks sessions)
- ✅ Custom domain migration (changes OAuth URLs)
- ✅ Removal of deprecated features

**Example:** `1.3.0` → `2.0.0` (Production GA with breaking changes)

**Reset MINOR and PATCH to 0** when incrementing MAJOR.

---

## Epic to Version Mapping

```
Epic 1: Foundation & Deployment       [████████████████████] 100% → v1.0.0 ✅
Epic 2: Database Infrastructure       [████████░░░░░░░░░░░░]  33% → v1.1.0 🎯
Epic 3: Authentication                [░░░░░░░░░░░░░░░░░░░░]   0% → v1.2.0 ⏳
Epic 4: Dashboard Validation          [░░░░░░░░░░░░░░░░░░░░]   0% → v1.3.0 ⏳
```

### Detailed Story Mapping

| Epic | Stories | Current | Target |
|------|---------|---------|--------|
| **Epic 1** | 11 stories | v1.0.0 ✅ | Complete |
| **Epic 2** | 6 stories | v1.0.3 (Story 2.2) | v1.1.0 |
| **Epic 3** | 8 stories | Not started | v1.2.0 |
| **Epic 4** | 7 stories | Not started | v1.3.0 (MVP) |

---

## Creating Releases

### Automated (Recommended)

```bash
# Using the helper script
./scripts/create-release.sh 1.0.4

# What it does:
# 1. Validates semantic versioning format
# 2. Checks for clean git state
# 3. Updates package.json and package-lock.json
# 4. Commits: "chore: bump version to 1.0.4"
# 5. Creates tag: v1.0.4
# 6. Pushes commit and tag to GitHub
# 7. Shows link to create GitHub Release
```

### Manual Process

```bash
# 1. Update version (without creating git tag yet)
npm version 1.0.4 --no-git-tag-version

# 2. Commit version bump
git add package.json package-lock.json
git commit -m "chore: bump version to 1.0.4"

# 3. Create git tag
git tag -a v1.0.4 -m "Release v1.0.4 - Migration Setup Complete"

# 4. Push to GitHub
git push origin main
git push origin v1.0.4

# 5. Create GitHub Release at:
# https://github.com/YOUR_ORG/role-directory/releases/new
```

---

## Quick Commands

```bash
# Check current version
node -p "require('./package.json').version"

# List all tags
git tag -l

# View tag details
git show v1.0.3

# Delete local tag
git tag -d v1.0.3

# Delete remote tag
git push origin :refs/tags/v1.0.3

# Trigger deployment
git push origin main
```

---

## Decision Tree

```
┌─────────────────────────────────┐
│  What did you change?           │
└───────────┬─────────────────────┘
            │
            ├─ Breaking change? ──→ MAJOR (2.0.0)
            │
            ├─ Epic complete? ────→ MINOR (1.1.0)
            │
            ├─ New feature? ──────→ PATCH (1.0.4)*
            │
            └─ Bug fix/docs? ─────→ PATCH (1.0.4)

* New feature in existing epic = PATCH
* New feature as epic milestone = MINOR
```

---

## Pre-release Versions

Use for testing before official release:

### Format

```
MAJOR.MINOR.PATCH-prerelease.number

Examples:
- 1.1.0-alpha.1    (Early testing)
- 1.1.0-beta.1     (Feature complete, testing)
- 1.1.0-rc.1       (Release candidate)
```

### Precedence

From [semver.org](https://semver.org):

```
1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-beta < 1.0.0-rc.1 < 1.0.0
```

---

## Common Mistakes to Avoid

### ❌ DON'T: Use 4-Part Versions

```bash
❌ v1.0.0.1   # Not valid semver
✅ v1.0.1     # Correct format
```

### ❌ DON'T: Skip PATCH Number

```bash
❌ v1.1       # Incomplete
✅ v1.1.0     # Correct
```

### ❌ DON'T: Forget to Reset Lower Numbers

```bash
# When incrementing MINOR:
❌ v1.0.6 → v1.1.6    # Wrong: kept PATCH
✅ v1.0.6 → v1.1.0    # Correct: reset PATCH

# When incrementing MAJOR:
❌ v1.3.2 → v2.3.2    # Wrong: kept MINOR and PATCH
✅ v1.3.2 → v2.0.0    # Correct: reset both
```

---

## CI/CD Integration

### How Version is Used

**GitHub Actions:** `.github/workflows/ci-cd.yml`

```yaml
- name: Extract version from package.json
  id: version
  run: |
    VERSION=$(node -p "require('./package.json').version")
    echo "VERSION=$VERSION" >> $GITHUB_OUTPUT

- name: Build Docker image
  run: |
    docker build \
      --build-arg NEXT_PUBLIC_APP_VERSION=${{ steps.version.outputs.VERSION }} \
      --build-arg NEXT_PUBLIC_BUILD_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
      --build-arg NEXT_PUBLIC_COMMIT_SHA=${{ github.sha }} \
      -t $IMAGE .
```

**Dockerfile:**

```dockerfile
ARG NEXT_PUBLIC_APP_VERSION=1.0.0
ARG NEXT_PUBLIC_BUILD_TIME=unknown
ARG NEXT_PUBLIC_COMMIT_SHA=local

ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_BUILD_TIME=$NEXT_PUBLIC_BUILD_TIME
ENV NEXT_PUBLIC_COMMIT_SHA=$NEXT_PUBLIC_COMMIT_SHA
```

**App Display:** `src/app/page.tsx`

```tsx
const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || 'local';
const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA || 'dev';
```

---

## Troubleshooting

### Version Not Updating in App

**Problem:** App still shows old version after release.

**Solution:**
```bash
# Trigger new deployment by pushing to main
git commit --allow-empty -m "trigger: deploy version 1.0.4"
git push origin main
```

### Tag Already Exists

**Problem:** `git tag v1.0.4` fails with "already exists"

**Solution:**
```bash
# Delete local tag
git tag -d v1.0.4

# Delete remote tag (if pushed)
git push origin :refs/tags/v1.0.4

# Create tag again with correct version
```

---

## Best Practices

### ✅ DO

- Update `package.json` version before creating tag
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Create annotated tags with `-a` flag
- Push both commit AND tag to GitHub
- Test deployment after creating release
- Document breaking changes in release notes

### ❌ DON'T

- Create tags without updating `package.json`
- Use lightweight tags (always use `-a` for annotated tags)
- Skip the commit step (tag should reference version bump commit)
- Create releases on Friday afternoons
- Delete tags after pushing (causes deployment issues)
- Use non-semantic version numbers

---

## Related Documentation

- [Release and Deployment Guide](./release-and-deployment-guide.md) - Complete deployment procedures
- [Epic Breakdown](../2-planning/epics.md) - All stories and epics
- [Sprint Status](../sprint-status.yaml) - Current implementation status
- [Semantic Versioning](https://semver.org) - Official specification

---

**Version:** 1.0  
**Last Updated:** 2025-11-09  
**Maintained By:** Development Team

