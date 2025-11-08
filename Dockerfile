# Stage 1: Dependencies and Build
FROM node:22-alpine AS builder

WORKDIR /app

# Accept build arguments for version info
ARG NEXT_PUBLIC_APP_VERSION=1.0.0
ARG NEXT_PUBLIC_BUILD_TIME=unknown
ARG NEXT_PUBLIC_COMMIT_SHA=local

# Set environment variables for build
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_BUILD_TIME=$NEXT_PUBLIC_BUILD_TIME
ENV NEXT_PUBLIC_COMMIT_SHA=$NEXT_PUBLIC_COMMIT_SHA

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Ensure public directory exists (Next.js may not create it if empty)
RUN mkdir -p public

# Build Next.js application
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application from builder
# Copy public folder for static assets (if exists)
COPY --from=builder /app/public ./public

# Copy standalone server and dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port 8080 (Cloud Run standard)
EXPOSE 8080

# Set default PORT environment variable
ENV PORT=8080

# Start the Next.js production server
CMD ["node", "server.js"]

