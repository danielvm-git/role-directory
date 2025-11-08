# Migration from GCR to Artifact Registry

## Overview

This guide covers the migration from Google Container Registry (GCR) to Artifact Registry. GCR is being deprecated, and Artifact Registry is Google's recommended solution for storing container images.

**Date:** November 8, 2025  
**Status:** Complete - All workflows updated

## What Changed

### Image URLs

**Before (GCR):**
```
gcr.io/PROJECT_ID/role-directory:TAG
```

**After (Artifact Registry):**
```
southamerica-east1-docker.pkg.dev/PROJECT_ID/role-directory/app:TAG
```

### Key Differences

1. **Regional Hosting**: Artifact Registry repositories are regional (we use `southamerica-east1`)
2. **Path Structure**: Additional `/app` path component for image names
3. **Authentication**: Different Docker auth endpoint
4. **Permissions**: Uses `artifactregistry.writer` role instead of GCR-specific roles

## Migration Steps

### Step 1: Create Artifact Registry Repository

Run the setup script:

```bash
cd scripts
./setup-artifact-registry.sh
```

This will:
- Enable Artifact Registry API
- Create a repository named `role-directory` in `southamerica-east1`
- Configure Docker authentication

### Step 2: Verify Service Account Permissions

Ensure your GitHub Actions service account has the correct permissions:

```bash
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:serviceAccount:github-actions-deployer@YOUR_PROJECT_ID.iam.gserviceaccount.com"
```

Required roles:
- `roles/run.developer` - Deploy to Cloud Run
- `roles/iam.serviceAccountUser` - Use service accounts
- `roles/artifactregistry.writer` - Push/pull images
- `roles/cloudbuild.builds.editor` - Build operations

If missing, run:
```bash
cd scripts
./setup-github-actions-sa.sh
```

### Step 3: Updated Workflows

All GitHub Actions workflows have been updated automatically:

#### Files Modified:
- `.github/workflows/ci-cd.yml`
- `.github/workflows/promote-dev-to-staging.yml`
- `.github/workflows/promote-staging-to-production.yml`

#### Key Changes in Workflows:

**Docker Authentication:**
```yaml
# Before
- name: Configure Docker for GCR
  run: gcloud auth configure-docker

# After
- name: Configure Docker for Artifact Registry
  run: gcloud auth configure-docker ${GCP_REGION}-docker.pkg.dev
```

**Image Building and Tagging:**
```yaml
# Before
IMAGE_NAME="gcr.io/${GCP_PROJECT_ID}/role-directory"

# After
IMAGE_NAME="${GCP_REGION}-docker.pkg.dev/${GCP_PROJECT_ID}/role-directory/app"
```

### Step 4: Test the Migration

1. **Push a new commit to main branch:**
   ```bash
   git add .
   git commit -m "Migrate to Artifact Registry"
   git push origin main
   ```

2. **Monitor the CI/CD workflow:**
   - Go to GitHub Actions tab
   - Watch the "CI/CD - Build and Deploy to Dev" workflow
   - Verify the image pushes successfully to Artifact Registry

3. **Verify the image in GCP Console:**
   - Navigate to Artifact Registry in GCP Console
   - Select the `role-directory` repository
   - Confirm the image appears with dev tags

### Step 5: Verify Cloud Run Deployment

Check that Cloud Run deployed successfully with the new image:

```bash
gcloud run services describe role-directory-dev \
  --region=southamerica-east1 \
  --format="value(spec.template.spec.containers[0].image)"
```

Should output:
```
southamerica-east1-docker.pkg.dev/PROJECT_ID/role-directory/app:dev-TIMESTAMP
```

## Local Development

### Configure Local Docker

To push images from your local machine:

```bash
gcloud auth configure-docker southamerica-east1-docker.pkg.dev
```

### Build and Push Locally

```bash
# Set variables
export PROJECT_ID=$(gcloud config get-value project)
export REGION="southamerica-east1"
export IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/role-directory/app"

# Build
docker build -t ${IMAGE_NAME}:local .

# Push
docker push ${IMAGE_NAME}:local
```

## Rollback Plan

If you need to rollback to GCR (not recommended):

1. **Revert workflow files:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Update service account permissions:**
   Add back GCR-specific roles if needed

3. **Redeploy using GCR images:**
   Use existing GCR images for deployments

## Cost Comparison

### GCR (Legacy)
- Storage: $0.026/GB/month
- Network egress: Standard rates
- Being deprecated

### Artifact Registry (Current)
- Storage: $0.10/GB/month
- Network egress: Free within same region
- Modern features: vulnerability scanning, SBOM generation
- Regional hosting improves latency

**Cost Impact:** Minimal for our use case (< 10GB storage expected)

## Benefits of Artifact Registry

1. **Modern Features:**
   - Native vulnerability scanning
   - Software Bill of Materials (SBOM) generation
   - Fine-grained access control
   - Audit logging

2. **Performance:**
   - Regional hosting reduces latency
   - Free egress within same region

3. **Future-Proof:**
   - Active development and support
   - Integration with newer GCP services

4. **Better Organization:**
   - Multiple repositories per project
   - Clear naming conventions
   - Tag immutability options

## Monitoring

### View Repository in Console

```bash
# Open in browser
gcloud artifacts repositories describe role-directory \
  --location=southamerica-east1 \
  --format="value(name)" | \
  xargs -I {} echo "https://console.cloud.google.com/artifacts/docker/{}"
```

### List Images

```bash
gcloud artifacts docker images list \
  southamerica-east1-docker.pkg.dev/$(gcloud config get-value project)/role-directory/app
```

### List Tags for Specific Image

```bash
gcloud artifacts docker tags list \
  southamerica-east1-docker.pkg.dev/$(gcloud config get-value project)/role-directory/app
```

## Cleanup Old GCR Images (Optional)

After verifying Artifact Registry works correctly for a few days:

### List GCR Images

```bash
gcloud container images list --repository=gcr.io/$(gcloud config get-value project)
```

### Delete Old GCR Images

```bash
# List images to delete
gcloud container images list-tags gcr.io/$(gcloud config get-value project)/role-directory

# Delete specific tag
gcloud container images delete gcr.io/$(gcloud config get-value project)/role-directory:TAG --quiet

# Or delete all (DANGEROUS - use with caution)
gcloud container images delete gcr.io/$(gcloud config get-value project)/role-directory --quiet
```

**⚠️ Warning:** Only delete GCR images after thoroughly testing Artifact Registry and keeping recent images as backup.

## Troubleshooting

### Error: "denied: Permission denied"

**Cause:** Service account lacks Artifact Registry permissions

**Solution:**
```bash
cd scripts
./setup-github-actions-sa.sh
```

### Error: "repository does not exist"

**Cause:** Artifact Registry repository not created

**Solution:**
```bash
cd scripts
./setup-artifact-registry.sh
```

### Error: "unauthorized: authentication required"

**Cause:** Docker not authenticated

**Solution:**
```bash
gcloud auth configure-docker southamerica-east1-docker.pkg.dev
```

### Error: "Failed to pull image"

**Cause:** Cloud Run can't access Artifact Registry

**Solution:** Verify service account used by Cloud Run has `artifactregistry.reader` role:

```bash
# Get Cloud Run service account
SERVICE_ACCOUNT=$(gcloud run services describe role-directory-dev \
  --region=southamerica-east1 \
  --format="value(spec.template.spec.serviceAccountName)")

# Grant reader role
gcloud artifacts repositories add-iam-policy-binding role-directory \
  --location=southamerica-east1 \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/artifactregistry.reader"
```

## References

- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)
- [Migrating from GCR](https://cloud.google.com/artifact-registry/docs/transition/transition-from-gcr)
- [Docker Repository](https://cloud.google.com/artifact-registry/docs/docker)
- [IAM Permissions](https://cloud.google.com/artifact-registry/docs/access-control)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review GitHub Actions logs
3. Check GCP Cloud Console logs
4. Consult the team

