# Artifact Registry Migration - Quick Start

## 🎯 What Was Done

Your project has been migrated from Google Container Registry (GCR) to Artifact Registry. This fixes the build failure and future-proofs your infrastructure.

## 🚀 Quick Setup (3 Steps)

### Step 1: Create the Artifact Registry Repository

```bash
cd scripts
./setup-artifact-registry.sh
```

This will:
- Enable Artifact Registry API
- Create the `role-directory` repository
- Configure Docker authentication

### Step 2: Verify Service Account Permissions

```bash
cd scripts
./setup-github-actions-sa.sh
```

This ensures your GitHub Actions service account has the correct permissions.

### Step 3: Test the Migration

```bash
cd /Users/me/role-directory

# Add all changes
git add .

# Commit the migration
git commit -m "feat: migrate to Artifact Registry from GCR

- Updated CI/CD workflows to use Artifact Registry
- Created setup script for Artifact Registry
- Updated service account permissions
- Added comprehensive migration guide
- Updated README with new image URLs

Fixes build failure: denied: gcr.io repo does not exist"

# Push to trigger CI/CD
git push origin main
```

### Step 4: Monitor the Deployment

1. Go to GitHub Actions tab in your repository
2. Watch the "CI/CD - Build and Deploy to Dev" workflow
3. Verify it completes successfully

## ✅ What Changed

### Image URLs

**Before:**
```
gcr.io/PROJECT_ID/role-directory:TAG
```

**After:**
```
southamerica-east1-docker.pkg.dev/PROJECT_ID/role-directory/app:TAG
```

### Files Modified

- `.github/workflows/ci-cd.yml` - Dev deployment
- `.github/workflows/promote-dev-to-staging.yml` - Staging promotion
- `.github/workflows/promote-staging-to-production.yml` - Production promotion
- `scripts/setup-github-actions-sa.sh` - Simplified permissions
- `README.md` - Updated documentation

### New Files

- `scripts/setup-artifact-registry.sh` - Setup script
- `docs/guides/artifact-registry-migration.md` - Full migration guide
- `docs/reports/artifact-registry-migration-2025-11-08.md` - Detailed report

## 📚 Documentation

For detailed information:
- **Full Migration Guide:** `docs/guides/artifact-registry-migration.md`
- **Detailed Report:** `docs/reports/artifact-registry-migration-2025-11-08.md`

## 🆘 Troubleshooting

### Error: "repository does not exist"

Run the setup script:
```bash
cd scripts
./setup-artifact-registry.sh
```

### Error: "denied: Permission denied"

Update service account permissions:
```bash
cd scripts
./setup-github-actions-sa.sh
```

### Build Still Failing?

Check GitHub Secrets:
1. Go to repository Settings → Secrets and variables → Actions
2. Verify these secrets exist:
   - `GCP_SERVICE_ACCOUNT_KEY`
   - `GCP_PROJECT_ID`

## 💰 Cost Impact

**Minimal:** Storage cost increases by ~$0.10-0.37/month, but same-region egress is now FREE.

Total estimated cost remains: **$0-3/month**

## 🎉 Next Steps

After successful deployment:

1. **Test the application:**
   ```bash
   curl https://[DEV_URL]/api/health
   ```

2. **Verify image in Artifact Registry:**
   ```bash
   gcloud artifacts docker images list \
     southamerica-east1-docker.pkg.dev/$(gcloud config get-value project)/role-directory/app
   ```

3. **Monitor for 1-2 weeks**, then optionally clean up old GCR images

---

**Questions?** See the full migration guide: `docs/guides/artifact-registry-migration.md`

