# Version Management Guide

**Last Updated:** 2025-11-08

---

## Quick Start

To create a new release with proper version display:

```bash
# Use the automated script (recommended)
./scripts/create-release.sh 1.0.0

# OR follow manual steps below
```

---

## Understanding Version Display

### What Users See

The app displays version info in the bottom-right corner:

```
v1.0.0
11/8/2025, 3:45:23 PM
SHA: abc1234
```

### Version Flow

```
package.json (v1.0.0)
    ↓ npm version command
Git Commit + Tag (v1.0.0)
    ↓ git push
GitHub Release (v1.0.0)
    ↓ CI/CD triggered
Docker Build
    ↓ --build-arg NEXT_PUBLIC_APP_VERSION=1.0.0
Next.js Build
    ↓ process.env.NEXT_PUBLIC_APP_VERSION
App Runtime
    ↓ Displays in UI
User Sees: v1.0.0
```

---

## Creating a Release (Automated)

### Using the Helper Script

```bash
# Navigate to project root
cd /path/to/role-directory

# Run the script with desired version
./scripts/create-release.sh 1.0.0
```

**What the script does:**
1. ✅ Validates semantic versioning format
2. ✅ Checks for clean git state
3. ✅ Updates `package.json` to version `1.0.0`
4. ✅ Updates `package-lock.json` automatically
5. ✅ Commits: `chore: bump version to 1.0.0`
6. ✅ Creates tag: `v1.0.0`
7. ✅ Pushes commit and tag to GitHub
8. ✅ Shows link to create GitHub Release

**After script completes:**
1. Click the provided GitHub link
2. Select tag `v1.0.0` (already created)
3. Click "Generate release notes"
4. Review and edit release notes
5. Click "Publish release"

---

## Creating a Release (Manual)

### Step 1: Update package.json

```bash
# Update version (without creating git tag yet)
npm version 1.0.0 --no-git-tag-version
```

This updates both:
- `package.json` → `"version": "1.0.0"`
- `package-lock.json` → `"version": "1.0.0"`

### Step 2: Commit Version Bump

```bash
git add package.json package-lock.json
git commit -m "chore: bump version to 1.0.0"
```

### Step 3: Create Git Tag

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0 - Infrastructure & CI/CD Complete"

# Verify tag created
git tag -l "v1.0.0"
git show v1.0.0
```

### Step 4: Push to GitHub

```bash
# Push commit
git push origin main

# Push tag
git push origin v1.0.0
```

### Step 5: Create GitHub Release

1. Go to: `https://github.com/YOUR_ORG/role-directory/releases/new`
2. **Choose a tag:** Select `v1.0.0` from dropdown
3. **Release title:** `v1.0.0 - Infrastructure & CI/CD Complete`
4. **Description:** Click "Generate release notes" or write custom notes
5. Click **"Publish release"**

---

## Deployment After Release

### Automatic Deployment

When you create a GitHub Release, **nothing happens automatically**. The release is just documentation.

### Manual Deployment

After creating the release, deploy manually:

```bash
# Option 1: Push a new commit to main (triggers CI/CD)
git push origin main

# Option 2: Wait for next feature commit to trigger deployment
```

The next CI/CD run will:
1. Extract version from `package.json` (now `1.0.0`)
2. Build Docker image with version `1.0.0`
3. App will display `v1.0.0` in UI

---

## Version Numbering Strategy

### Semantic Versioning

```
MAJOR.MINOR.PATCH
  ↓     ↓     ↓
 1  .  0  .  0

MAJOR: Breaking changes, new architecture
MINOR: New features, backward compatible
PATCH: Bug fixes, hotfixes
```

### Our Convention

| Release | Epic | Change Type | Example |
|---------|------|-------------|---------|
| **v1.0.0** | Epic 1 | First stable release | Infrastructure complete |
| **v1.1.0** | Epic 2 | New feature | Database integration |
| **v1.1.1** | - | Bug fix | Hotfix for Epic 2 |
| **v1.2.0** | Epic 3 | New feature | Authentication |
| **v2.0.0** | Epic 4 | Breaking change | Full product GA |

---

## Troubleshooting

### Version Not Updating in App

**Problem:** App still shows old version after release.

**Cause:** The new version hasn't been deployed yet.

**Solution:**
```bash
# Trigger new deployment by pushing to main
git commit --allow-empty -m "trigger: deploy version 1.0.0"
git push origin main

# Or wait for next feature commit
```

### Tag Already Exists

**Problem:** `git tag v1.0.0` fails with "already exists"

**Solution:**
```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag (if pushed)
git push origin :refs/tags/v1.0.0

# Create tag again with correct version
```

### package.json Version Doesn't Match Tag

**Problem:** Tag is `v1.0.0` but package.json shows `1.0.1`

**Solution:**
```bash
# Delete the incorrect tag
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0

# Update package.json to correct version
npm version 1.0.0 --no-git-tag-version

# Commit and create tag again
git add package.json package-lock.json
git commit -m "chore: fix version to 1.0.0"
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main
git push origin v1.0.0
```

### Release Notes Not Showing Commits

**Problem:** GitHub Release has no content.

**Solution:**
1. Make sure tag is pushed: `git push origin v1.0.0`
2. On GitHub Release page, click "Choose a tag" and select `v1.0.0`
3. Click "Generate release notes" button
4. GitHub will auto-generate from commits since last tag

---

## CI/CD Integration

### How CI/CD Uses Version

**File:** `.github/workflows/ci-cd.yml`

```yaml
- name: Extract version from package.json
  id: version
  run: |
    VERSION=$(node -p "require('./package.json').version")
    echo "VERSION=$VERSION" >> $GITHUB_OUTPUT

- name: Build and tag Docker image
  run: |
    docker build \
      --build-arg NEXT_PUBLIC_APP_VERSION=${{ steps.version.outputs.VERSION }} \
      --build-arg NEXT_PUBLIC_BUILD_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
      --build-arg NEXT_PUBLIC_COMMIT_SHA=${{ github.sha }} \
      -t $IMAGE .
```

### Docker Build Args

**File:** `Dockerfile`

```dockerfile
ARG NEXT_PUBLIC_APP_VERSION=1.0.0
ARG NEXT_PUBLIC_BUILD_TIME=unknown
ARG NEXT_PUBLIC_COMMIT_SHA=local

ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_BUILD_TIME=$NEXT_PUBLIC_BUILD_TIME
ENV NEXT_PUBLIC_COMMIT_SHA=$NEXT_PUBLIC_COMMIT_SHA
```

### App Display

**File:** `src/app/page.tsx`

```tsx
const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || 'local';
const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA || 'dev';
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

## Quick Reference Commands

```bash
# Check current version
node -p "require('./package.json').version"

# List all tags
git tag -l

# Check remote tags
git ls-remote --tags origin

# View tag details
git show v1.0.0

# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0

# Create release (automated)
./scripts/create-release.sh 1.0.0

# Trigger deployment
git push origin main
```

---

## Related Documentation

- **Release Guide:** `docs/guides/release-and-deployment-guide.md`
- **CI/CD Setup:** `docs/guides/github-actions-setup-guide.md`
- **Docker Guide:** `docs/guides/docker-usage-guide.md`
- **Architecture:** `docs/3-solutioning/architecture.md`

---

**Last Updated:** 2025-11-08  
**Version:** 1.0

