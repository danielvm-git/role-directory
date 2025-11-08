# Docker Setup and Usage

This document describes how to build and run the Role Directory application using Docker.

## Prerequisites

- Docker 20.x or later installed
- Docker daemon running

## Building the Docker Image

### Local Build

Build the Docker image locally:

```bash
docker build -t role-directory:local .
```

**Expected build time:** 2-5 minutes (depending on network speed)

### Verify Image Size

Check the built image size:

```bash
docker images role-directory:local
```

**Expected size:** < 500MB (Alpine + Next.js standalone output)

## Running the Container

### Basic Run

Run the container with minimal configuration:

```bash
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  role-directory:local
```

The application will be accessible at: http://localhost:8080

### Run with Environment Variables

For development or testing with database connectivity:

```bash
docker run -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e DATABASE_URL="your-database-url" \
  -e NEON_AUTH_PROJECT_ID="your-auth-project-id" \
  -e NEON_AUTH_SECRET_KEY="your-auth-secret" \
  -e ALLOWED_EMAILS="email1@example.com,email2@example.com" \
  role-directory:local
```

### Run in Detached Mode

Run the container in the background:

```bash
docker run -d -p 8080:8080 \
  -e NODE_ENV=production \
  --name role-directory-app \
  role-directory:local
```

View logs:

```bash
docker logs role-directory-app
```

Stop the container:

```bash
docker stop role-directory-app
docker rm role-directory-app
```

## Environment Variables

The following environment variables can be configured at runtime:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `production` | Node environment (development/staging/production) |
| `PORT` | No | `8080` | Port the server listens on (Cloud Run uses 8080) |
| `DATABASE_URL` | Yes (Epic 2+) | - | PostgreSQL connection string |
| `NEON_AUTH_PROJECT_ID` | Yes (Epic 3+) | - | Neon Auth project identifier |
| `NEON_AUTH_SECRET_KEY` | Yes (Epic 3+) | - | Neon Auth secret key for authentication |
| `ALLOWED_EMAILS` | Yes (Epic 3+) | - | Comma-separated list of allowed email addresses |

## Dockerfile Structure

The Dockerfile uses a multi-stage build for optimization:

### Stage 1: Builder
- Base: `node:22-alpine`
- Installs all dependencies (including dev dependencies)
- Builds Next.js application with standalone output
- Generates optimized production assets

### Stage 2: Runner
- Base: `node:22-alpine`
- Copies only production artifacts from builder
- Runs as non-root user (`nextjs:nodejs`)
- Minimal attack surface and image size

## Image Optimization

The Docker image is optimized for:
- **Small size:** Alpine Linux base (~50MB vs ~200MB for Debian)
- **Security:** Non-root user, multi-stage build excludes dev dependencies
- **Performance:** Next.js standalone output with tree-shaking
- **Cloud Run compatibility:** Listens on PORT environment variable

## Cloud Run Deployment

**Note:** For Cloud Run deployment, you don't need to build or push the Docker image manually. Cloud Run uses "deploy from source" with Cloud Build:

```bash
# Cloud Build handles the Docker build automatically
gcloud run deploy role-directory \
  --source . \
  --region southamerica-east1 \
  --allow-unauthenticated
```

See Story 1.4 and 1.5 for complete Cloud Run deployment setup.

## Troubleshooting

### Image Size Too Large

If the image exceeds 500MB:
1. Verify `.dockerignore` excludes `node_modules`, `.next`, `docs`
2. Check `next.config.ts` has `output: 'standalone'`
3. Ensure multi-stage build copies only necessary files

### Container Won't Start

Check logs for errors:

```bash
docker logs role-directory-app
```

Common issues:
- Missing required environment variables (DATABASE_URL in Epic 2+)
- Port already in use (change `-p 3000:8080` to use different host port)
- Insufficient memory (allocate more with `--memory`)

### Application Not Accessible

Verify:
1. Container is running: `docker ps`
2. Port mapping is correct: `-p 8080:8080`
3. Firewall allows connections to port 8080
4. Access via http://localhost:8080 (not https)

## References

- [Next.js Standalone Output](https://nextjs.org/docs/app/api-reference/next-config-js/output)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)

