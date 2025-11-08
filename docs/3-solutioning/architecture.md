# role-directory - Architecture Document

**Project:** role-directory  
**Author:** danielvm (with Winston, Architect)  
**Date:** 2025-11-06  
**Last Updated:** 2025-11-08 (CI/CD fixes: Dockerfile, IAM permissions, GitHub secrets)  
**Version:** 1.3

---

## Executive Summary

role-directory is an infrastructure-first Next.js 15 web application designed to validate a complete production-ready deployment pipeline on Google Cloud Run. The architecture prioritizes **serverless scalability, cost optimization (~$0-3/month), and deployment validation** over feature richness.

**Key Architectural Principles:**
- **Serverless-First:** Cloud Run + Neon PostgreSQL (both auto-scale, auto-suspend)
- **Infrastructure Validation:** Every feature proves a different deployment layer
- **Cost-Optimized:** Free tiers for all services (Cloud Run, Neon, Secret Manager, GitHub Actions)
- **TypeScript Everywhere:** Type safety from database to UI
- **Stateless Containers:** Database-backed sessions, no in-memory state

**Architecture Style:** Serverless monolith with external auth (Neon Auth) and managed database (Neon PostgreSQL).

---

## Project Initialization

**First Implementation Story (Story 1.1):**

```bash
# Initialize Next.js 15 project with TypeScript and Tailwind
npx create-next-app@15.0.3 role-directory \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd role-directory

# Install additional dependencies
npm install @neondatabase/serverless zod

# Install dev dependencies
npm install --save-dev prettier eslint-config-prettier

# Create Prettier configuration
echo '{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}' > .prettierrc

# Initialize git repository (if not already)
git init
git add .
git commit -m "Initial commit: Next.js 15 with TypeScript and Tailwind"
```

**This command establishes:**
- ✅ Next.js 15.0.3 with App Router
- ✅ TypeScript 5.6.3 (strict mode)
- ✅ Tailwind CSS 3.4.14
- ✅ ESLint with Next.js rules
- ✅ Project structure (`/app`, `/public`, `/components`)
- ✅ Hot Module Replacement (HMR)
- ✅ Optimized production builds

---

## Decision Summary

**Versions Verified:** 2025-11-06 (Initial architecture) | 2025-11-07 (Post Epic 1 validation) | 2025-11-08 (Regional migration + CI/CD fixes)  
**Next Review:** Before Epic 3 implementation (auth dependencies)

| Category | Decision | Version | Verified | Affects Epics | Rationale |
| -------- | -------- | ------- | -------- | ------------- | --------- |
| **Framework** | Next.js | 15.0.3 | 2025-11-06 | All | Modern React framework with App Router, RSC support |
| **UI Library** | React | 18.3.1 | 2025-11-06 | Epic 3, 4 | Stable production version (React 19 still RC) |
| **Language** | TypeScript | 5.6.3 | 2025-11-06 | All | Type safety, better DX, fewer runtime errors |
| **Runtime** | Node.js | 22.11.0 LTS | 2025-11-06 | All | Latest LTS with V8 optimizations |
| **Styling** | Tailwind CSS | 3.4.14 | 2025-11-06 | Epic 4 | Utility-first CSS, rapid UI development |
| **Database** | PostgreSQL | 17.0 | 2025-11-06 | Epic 2, 3, 4 | Latest stable, via Neon serverless hosting |
| **DB Client** | @neondatabase/serverless | 0.10.1 | 2025-11-06 | Epic 2 | Optimized for serverless, built-in pooling |
| **Auth Provider** | Neon Auth | Latest | 2025-11-06 | Epic 3 | OAuth + session management, saves 2-3 days vs custom |
| **Container** | Docker | 27.3.1 | 2025-11-07 | Epic 1 | Multi-stage builds for optimized images |
| **Hosting** | GCP Cloud Run | N/A | 2025-11-07 | Epic 1, 4 | Serverless, auto-scale, free tier |
| **Region** | southamerica-east1 (São Paulo) | N/A | 2025-11-08 | All | Co-located with database, optimized for Brazil |
| **CI/CD** | GitHub Actions | N/A | 2025-11-07 | Epic 1 | Integrated with GitHub, free tier |
| **Secrets (Runtime)** | Google Secret Manager | N/A | 2025-11-07 | All | 6 secrets free, runtime injection |
| **Secrets (CI/CD)** | GitHub Secrets | N/A | 2025-11-07 | Epic 1 | Deployment credentials for CI/CD |
| **Testing (Unit)** | Vitest | 2.1.1 | 2025-11-06 | Phase 2 | Fast, Jest-compatible, modern |
| **Testing (Component)** | @testing-library/react | 16.0.1 | 2025-11-06 | Phase 2 | React component testing |
| **Testing (E2E)** | Playwright | 1.48.0 | 2025-11-06 | Phase 2 | Browser automation, reliable |
| **Linting** | ESLint | 9.13.0 | 2025-11-07 | Epic 1 | Code quality, Next.js rules |
| **Formatting** | Prettier | 3.3.3 | 2025-11-07 | Epic 1 | Consistent code style |
| **Validation** | Zod | 3.23.8 | 2025-11-06 | All | Runtime validation, type inference |
| **Error Handling** | Try-Catch + Centralized Handler | N/A | 2025-11-06 | All | Simple, consistent error responses |
| **Logging** | Structured JSON to stdout | N/A | 2025-11-06 | All | Cloud Run captures, no extra deps |
| **API Format** | Direct response (Next.js standard) | N/A | 2025-11-06 | Epic 4 | Simple success/error format |
| **Date Format** | YYYY-MM-DD HH:mm:ss (display) | N/A | 2025-11-06 | All | Standardized across entire app |
| **File Organization** | Flat structure | N/A | 2025-11-06 | All | Simple MVP, minimal nesting |
| **Test Location** | Co-located with source | N/A | 2025-11-06 | Phase 2 | Tests next to code (*.test.ts) |
| **Config Management** | Zod validation + centralized | N/A | 2025-11-06 | All | Type-safe, fail-fast configuration |
| **Env Variables** | .env.local + .env.example | N/A | 2025-11-06 | All | Next.js standard |
| **Naming** | Standard conventions | N/A | 2025-11-06 | All | PascalCase components, camelCase functions, snake_case DB |

---

## Project Structure

```
role-directory/
├── .github/
│   └── workflows/
│       ├── ci-cd-dev.yml           # Auto-deploy to dev
│       ├── promote-to-staging.yml  # Manual staging promotion
│       └── promote-to-prod.yml     # Manual prod promotion
│
├── app/                            # Next.js 15 App Router
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing page (sign-in)
│   │
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout (with auth)
│   │   ├── page.tsx                # Hello World dashboard
│   │   └── page.test.tsx           # Component test
│   │
│   └── api/
│       ├── health/
│       │   └── route.ts            # Health check endpoint
│       │
│       └── dashboard/
│           └── hello/
│               ├── route.ts        # Database query API
│               └── route.test.ts   # API route test
│
├── components/                     # Shared React components
│   ├── ui/                        # shadcn/ui components (optional)
│   └── UserButton.tsx             # Neon Auth user button
│
├── lib/                           # Utilities and shared logic
│   ├── config.ts                  # Configuration validation (Zod)
│   ├── config.test.ts             # Configuration tests
│   ├── db.ts                      # Neon database client
│   ├── db.test.ts                 # Database utility tests
│   ├── auth.ts                    # Neon Auth helpers
│   ├── errors.ts                  # Centralized error handling
│   ├── logger.ts                  # Structured logging utility
│   └── utils.ts                   # General utilities
│
├── types/                         # TypeScript type definitions
│   ├── api.ts                     # API request/response types
│   ├── database.ts                # Database schema types
│   └── auth.ts                    # Auth-related types
│
├── middleware.ts                  # Next.js middleware (auth protection)
│
├── tests/                         # E2E tests only
│   └── e2e/
│       ├── auth-flow.spec.ts      # OAuth sign-in flow
│       ├── dashboard.spec.ts      # Dashboard access test
│       └── playwright.config.ts   # Playwright configuration
│
├── public/                        # Static assets
│   ├── favicon.ico
│   └── images/
│
├── docs/                          # Documentation
│   ├── PRD.md                     # Product Requirements
│   ├── epics.md                   # Epic breakdown
│   ├── architecture.md            # This document
│   ├── validation-report-2025-11-06.md
│   └── infrastructure-setup-neon.md
│
├── .env.example                   # Environment variable template
├── .env.local                     # Local development (gitignored)
├── .gitignore
├── .eslintrc.json                # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── Dockerfile                     # Multi-stage Docker build
├── .dockerignore                  # Docker ignore patterns
├── next.config.js                 # Next.js configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── tsconfig.json                  # TypeScript configuration
├── vitest.config.ts               # Vitest configuration (Phase 2)
├── package.json                   # Dependencies
├── package-lock.json              # Locked dependencies
└── README.md                      # Project setup instructions
```

---

## Epic to Architecture Mapping

| Epic | Components | Key Files | Stories |
|------|------------|-----------|---------|
| **Epic 1: Foundation & Deployment Pipeline** | CI/CD workflows, Docker, Health check | `.github/workflows/*`, `Dockerfile`, `app/api/health/route.ts` | 1.1-1.11 |
| **Epic 2: Database Infrastructure** | Database client, connection pooling, migrations | `lib/db.ts`, `types/database.ts`, migration scripts | 2.1-2.6 |
| **Epic 3: Authentication & Access Control** | Neon Auth integration, middleware, sign-in page | `lib/auth.ts`, `middleware.ts`, `app/page.tsx`, `components/UserButton.tsx` | 3.1-3.8 |
| **Epic 4: Hello World Dashboard** | Dashboard UI, API routes, E2E tests | `app/dashboard/*`, `app/api/dashboard/hello/route.ts`, `tests/e2e/*` | 4.1-4.7 |

---

## Technology Stack Details

### Core Technologies

**Frontend Stack:**
- **Next.js 15.0.3** - React framework with App Router, Server Components, and Turbopack bundler
- **React 18.3.1** - UI library with concurrent features and Suspense
- **TypeScript 5.6.3** - Type-safe JavaScript with strict mode enabled
- **Tailwind CSS 3.4.14** - Utility-first CSS framework for rapid UI development

**Backend Stack:**
- **Node.js 22.11.0 LTS** - JavaScript runtime with V8 engine optimizations
- **TypeScript 5.6.3** - Same version as frontend for consistency

**Database:**
- **PostgreSQL 17.0** - Relational database (via Neon serverless hosting)
- **@neondatabase/serverless 0.10.1** - Neon-optimized PostgreSQL client with built-in pooling

**Authentication:**
- **Neon Auth SDK** - OAuth provider integration (Google/GitHub) with session management
- **Session Storage** - Database-backed sessions in PostgreSQL (stateless containers)

**Infrastructure:**
- **Docker 27.3.1** - Container runtime for Cloud Run deployment
- **Google Cloud Run** - Serverless container platform (auto-scale, pay-per-use)
- **Google Secret Manager** - Runtime secrets management (free tier: 6 secrets)
- **GitHub Actions** - CI/CD automation (free tier for public repos)
- **GitHub Secrets** - CI/CD credentials storage

**Testing (Phase 2 - Deferred from MVP):**
- **Vitest 2.1.1** - Unit, component, and API testing framework
- **@testing-library/react 16.0.1** - React component testing utilities
- **Playwright 1.48.0** - End-to-end browser testing

**Code Quality:**
- **ESLint 9.13.0** - JavaScript/TypeScript linting with Next.js rules
- **Prettier 3.3.3** - Code formatting for consistency

**Validation:**
- **Zod 3.23.8** - Runtime schema validation with TypeScript type inference

---

### Integration Points

#### 1. Next.js App ↔ Neon PostgreSQL

**Connection Method:** Neon serverless driver with environment variable injection

```typescript
// lib/db.ts
import { getConfig } from '@/lib/config';
import { neon } from '@neondatabase/serverless';

// Get validated configuration (validates on first call)
const config = getConfig();
const sql = neon(config.databaseUrl);

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const result = await sql(text, params);
  const duration = Date.now() - start;
  
  if (duration > 200) {
    console.warn(`Slow query (${duration}ms): ${text.substring(0, 100)}...`);
  }
  
  return result;
}
```

**Environment Variable:**
- `DATABASE_URL` stored in Google Secret Manager
- Injected into Cloud Run service at runtime
- Validated by Zod schema (must be valid PostgreSQL URL)
- Format: `postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require`

**Connection Pooling:**
- Built-in pooling by Neon serverless driver
- Auto-suspend after ~5 minutes idle (saves compute hours)
- Cold start resume: ~2-3 seconds (acceptable for MVP)

---

#### 2. Next.js App ↔ Neon Auth

**Connection Method:** Neon Auth SDK with OAuth provider configuration

```typescript
// lib/auth.ts
import { auth } from '@neon/auth-nextjs'; // (Check actual package)

export async function getUser() {
  return await auth.getUser();
}

export async function signIn() {
  return await auth.signIn();
}

export async function signOut() {
  return await auth.signOut();
}
```

**Environment Variables:**
- `NEON_AUTH_PROJECT_ID` - Neon Auth project identifier
- `NEON_AUTH_SECRET_KEY` - Secret key for auth (per environment)
- OAuth credentials stored in Neon Console

**Email Whitelist:**
```typescript
// middleware.ts
import { getConfig } from '@/lib/config';
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const config = getConfig(); // Type-safe, validated configuration
  const user = await getUser();
  
  if (!user) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (!config.allowedEmails.includes(user.email)) {
    return NextResponse.redirect(new URL('/?error=access_denied', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

---

#### 3. GitHub Actions ↔ Cloud Run

**Connection Method:** GitHub Actions workflow with gcloud CLI

```yaml
# .github/workflows/ci-cd-dev.yml
name: CI/CD - Deploy to Dev

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}
      
      - uses: google-github-actions/setup-gcloud@v2
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy role-directory-dev \
            --source . \
            --region southamerica-east1 \
            --allow-unauthenticated \
            --set-secrets=DATABASE_URL=role-directory-dev-db-url:latest,NEON_AUTH_SECRET_KEY=neon-auth-dev-secret:latest \
            --set-env-vars=NODE_ENV=development,NEON_AUTH_PROJECT_ID=${{ secrets.NEON_AUTH_PROJECT_ID }},ALLOWED_EMAILS=${{ secrets.ALLOWED_EMAILS_DEV }}
```

**GitHub Secrets Required:**
- `GCP_SERVICE_ACCOUNT_KEY` - Service account JSON for deployment
- `GCP_PROJECT_ID` - Google Cloud project ID
- `NEON_AUTH_PROJECT_ID` - Neon Auth project ID (same across environments)
- `ALLOWED_EMAILS_DEV` - Comma-separated email whitelist for dev

---

#### 4. Cloud Run ↔ Google Secret Manager

**Connection Method:** IAM role binding + secret reference in Cloud Run service

**Setup:**
```bash
# Grant Secret Manager accessor role to Cloud Run service account
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

# Create secrets in Secret Manager
echo "postgresql://..." | gcloud secrets create role-directory-dev-db-url --data-file=-
echo "neon-auth-secret-key" | gcloud secrets create neon-auth-dev-secret --data-file=-

# Reference in Cloud Run service (done in GitHub Actions workflow above)
--set-secrets=DATABASE_URL=role-directory-dev-db-url:latest
```

**Runtime Access:**
- Cloud Run injects secrets as environment variables
- Application code reads via `process.env.DATABASE_URL`
- No secrets stored in code or Docker image

---

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents.

### API Route Pattern

**All API routes MUST follow this structure:**

```typescript
// app/api/[resource]/[action]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { logError, logInfo } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check (if protected)
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request
    const body = await request.json();
    
    // Basic validation example
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Missing required field', code: 'VALIDATION_FAILED' },
        { status: 400 }
      );
    }
    
    // 3. Business logic / database query
    const start = Date.now();
    const result = await query('SELECT ...', [params]);
    const queryTimeMs = Date.now() - start;
    
    logInfo('Query executed', { 
      endpoint: '/api/resource/action', 
      userId: user.id,
      queryTimeMs 
    });
    
    // 4. Return success response
    return NextResponse.json({ 
      data: result,
      query_time_ms: queryTimeMs 
    });
    
  } catch (error) {
    // 5. Error handling
    logError('API Error', { 
      endpoint: '/api/resource/action', 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      { error: 'Internal server error', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

// Export named functions for HTTP methods
export async function GET(request: NextRequest) { ... }
export async function PUT(request: NextRequest) { ... }
export async function DELETE(request: NextRequest) { ... }
```

---

### Component Pattern

**All React components MUST follow this structure:**

```typescript
// components/ComponentName.tsx
import { FC } from 'react';

interface ComponentNameProps {
  requiredProp: string;
  optionalProp?: number;
  children?: React.ReactNode;
}

export const ComponentName: FC<ComponentNameProps> = ({ 
  requiredProp, 
  optionalProp = 0,
  children 
}) => {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold">{requiredProp}</h2>
      {optionalProp > 0 && <p>Count: {optionalProp}</p>}
      {children}
    </div>
  );
};

// Default export for pages only
// Named exports for reusable components
```

---

### Database Query Pattern

**All database queries MUST use parameterized queries:**

```typescript
// ✅ CORRECT: Parameterized query (prevents SQL injection)
const result = await query(
  'SELECT * FROM users WHERE email = $1 AND active = $2',
  [email, true]
);

// ✅ CORRECT: With dynamic column (carefully validated)
const validColumns = ['name', 'email', 'created_at'];
const column = validColumns.includes(req.column) ? req.column : 'name';
const result = await query(
  `SELECT ${column} FROM users WHERE id = $1`,
  [userId]
);

// ❌ WRONG: String concatenation (SQL injection vulnerability)
const result = await query(
  `SELECT * FROM users WHERE email = '${email}'`
);

// ❌ WRONG: Template literal with user input
const result = await query(
  `SELECT * FROM users WHERE email = '${email}' AND active = ${active}`
);
```

---

### Error Handling Pattern

**Centralized error handler:**

```typescript
// lib/errors.ts
export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export interface ApiError {
  error: string;
  code: ErrorCode;
}

export function createErrorResponse(
  message: string,
  code: ErrorCode,
  status: number
): NextResponse<ApiError> {
  return NextResponse.json(
    { error: message, code },
    { status }
  );
}

// Usage in API routes
import { createErrorResponse, ErrorCodes } from '@/lib/errors';

if (!user) {
  return createErrorResponse('Unauthorized', ErrorCodes.UNAUTHORIZED, 401);
}

if (!validInput) {
  return createErrorResponse('Invalid request data', ErrorCodes.VALIDATION_FAILED, 400);
}
```

---

### Logging Pattern

**Structured JSON logging:**

```typescript
// lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

function log(level: LogLevel, message: string, context?: Record<string, any>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && { context }),
  };
  
  console.log(JSON.stringify(entry));
}

export const logInfo = (message: string, context?: Record<string, any>) => 
  log('info', message, context);

export const logWarn = (message: string, context?: Record<string, any>) => 
  log('warn', message, context);

export const logError = (message: string, context?: Record<string, any>) => 
  log('error', message, context);

// Usage
import { logInfo, logError } from '@/lib/logger';

logInfo('User signed in', { userId: user.id, email: user.email });
logError('Database connection failed', { 
  error: err.message, 
  connectionString: 'postgresql://...' 
});
```

**Cloud Run automatically captures stdout as structured logs.**

---

### Date Formatting Pattern

**CRITICAL: All dates MUST follow this format for display:**

```typescript
// lib/formatters.ts

/**
 * Format date for display: YYYY-MM-DD HH:mm:ss
 * This is the ONLY date format used in the UI.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Usage in components
import { formatDate } from '@/lib/formatters';

<p>Created: {formatDate(session.created_at)}</p>
<p>Expires: {formatDate(session.expires_at)}</p>

// Database storage (always TIMESTAMP)
CREATE TABLE access_sessions (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

// API transmission (always ISO 8601)
return NextResponse.json({
  created_at: new Date().toISOString(),  // "2024-11-06T15:30:00.000Z"
  expires_at: expiryDate.toISOString()
});
```

---

### Configuration Management Pattern

**CRITICAL: All configuration MUST be validated on startup using Zod:**

```typescript
// lib/config.ts
import { z } from 'zod';

/**
 * Configuration schema using Zod for runtime validation
 * 
 * Benefits:
 * - Type-safe configuration with automatic type inference
 * - Runtime validation with detailed error messages
 * - Transformation (e.g., parse ports, split emails)
 * - Fail-fast on startup if configuration is invalid
 */
const configSchema = z.object({
  // Database
  databaseUrl: z.string()
    .url('DATABASE_URL must be a valid URL')
    .startsWith('postgresql://', 'DATABASE_URL must be a PostgreSQL connection string'),
  
  // Authentication
  neonAuthProjectId: z.string()
    .min(1, 'NEON_AUTH_PROJECT_ID cannot be empty'),
  
  neonAuthSecretKey: z.string()
    .min(1, 'NEON_AUTH_SECRET_KEY cannot be empty'),
  
  allowedEmails: z.string()
    .min(1, 'ALLOWED_EMAILS cannot be empty')
    .transform(str => str.split(',').map(e => e.trim()))
    .refine(
      emails => emails.every(e => e.includes('@')),
      { message: 'All emails in ALLOWED_EMAILS must be valid' }
    ),
  
  // Environment
  nodeEnv: z.enum(['development', 'staging', 'production'])
    .default('development'),
  
  port: z.string()
    .default('8080')
    .transform(val => parseInt(val, 10))
    .refine(
      val => val > 0 && val < 65536,
      { message: 'PORT must be between 1 and 65535' }
    ),
});

/**
 * Infer TypeScript type from Zod schema
 * This ensures type safety throughout the application
 */
export type Config = z.infer<typeof configSchema>;

/**
 * Validates and parses configuration from environment variables.
 * Throws ZodError with detailed validation messages if invalid.
 * 
 * MUST be called once at application startup.
 */
export function validateConfig(): Config {
  try {
    const config = configSchema.parse({
      databaseUrl: process.env.DATABASE_URL,
      neonAuthProjectId: process.env.NEON_AUTH_PROJECT_ID,
      neonAuthSecretKey: process.env.NEON_AUTH_SECRET_KEY,
      allowedEmails: process.env.ALLOWED_EMAILS,
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
    });
    
    console.log('✅ Configuration validated successfully');
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = `❌ Configuration validation failed:\n${
        error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n')
      }`;
      console.error(message);
      throw new Error(message);
    }
    throw error;
  }
}

/**
 * Cached configuration instance.
 * Populated by validateConfig() on first call to getConfig().
 */
let cachedConfig: Config | null = null;

/**
 * Get the validated configuration.
 * Automatically calls validateConfig() on first access.
 * 
 * @returns Validated configuration object
 */
export function getConfig(): Config {
  if (!cachedConfig) {
    cachedConfig = validateConfig();
  }
  return cachedConfig;
}
```

**Usage in Application Code:**

```typescript
// ✅ CORRECT: Use getConfig() everywhere
import { getConfig } from '@/lib/config';

const config = getConfig();
const sql = neon(config.databaseUrl); // Type-safe, validated

// ✅ CORRECT: In middleware
export async function middleware(request: NextRequest) {
  const config = getConfig();
  const user = await getUser();
  
  if (!user) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  if (!config.allowedEmails.includes(user.email)) {
    return NextResponse.redirect(new URL('/?error=access_denied', request.url));
  }
  
  return NextResponse.next();
}

// ❌ WRONG: Never access process.env directly in application code
const url = process.env.DATABASE_URL; // WRONG - no validation, no type safety
```

**Environment Variables Required:**

```bash
# .env.example
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require
NEON_AUTH_PROJECT_ID=your-project-id
NEON_AUTH_SECRET_KEY=your-secret-key
ALLOWED_EMAILS=email1@example.com,email2@example.com
NODE_ENV=development
PORT=8080
```

**Validation on Startup:**

Configuration validation happens automatically on first call to `getConfig()`. For explicit validation at app startup:

```typescript
// lib/db.ts - First module to need config
import { getConfig } from '@/lib/config';
import { neon } from '@neondatabase/serverless';

// getConfig() validates on first call, throws if invalid
const config = getConfig();
const sql = neon(config.databaseUrl);

export async function query(text: string, params?: any[]) {
  // ... implementation
}
```

**Benefits:**

1. **Fail-Fast:** App won't start with invalid configuration
2. **Type-Safe:** `Config` type provides IDE autocomplete
3. **DRY:** Parsing logic (split emails, parse port) in one place
4. **Testable:** `validateConfig()` can be unit tested
5. **Maintainable:** Add new env vars in one place
6. **Better Errors:** "DATABASE_URL must be a valid URL" instead of runtime errors

---

## Consistency Rules

### Naming Conventions

**Files:**
```
✅ Components:     PascalCase.tsx        (UserButton.tsx, Dashboard.tsx)
✅ Routes:         kebab-case/           (validate-code/, dashboard/)
✅ Utilities:      camelCase.ts          (logger.ts, formatDate.ts)
✅ Types:          camelCase.ts          (api.ts, database.ts)
✅ Tests:          *.test.ts(x)          (route.test.ts, Dashboard.test.tsx)
✅ E2E Tests:      *.spec.ts             (auth-flow.spec.ts)
✅ Config files:   kebab-case.config.*   (next.config.js, vitest.config.ts)
```

**API Routes:**
```
✅ Pattern:        /api/[resource]/[action]
✅ Examples:       
   - GET  /api/health
   - GET  /api/dashboard/hello
   - POST /api/auth/validate-code
   - POST /api/auth/logout
   
❌ Avoid:         
   - /api/validate_code (snake_case)
   - /api/Auth/ValidateCode (PascalCase)
   - /validateCode (no /api prefix)
```

**Database:**
```
✅ Tables:         snake_case, plural      (users, access_sessions, role_profiles)
✅ Columns:        snake_case              (user_id, created_at, expires_at)
✅ Foreign Keys:   [table]_id              (user_id, role_id)
✅ Indexes:        idx_[table]_[column]    (idx_users_email)
✅ Timestamps:     created_at, updated_at  (standard convention)

Example:
  CREATE TABLE access_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE INDEX idx_access_sessions_user_id ON access_sessions(user_id);
  CREATE INDEX idx_access_sessions_expires_at ON access_sessions(expires_at);
```

**TypeScript:**
```typescript
✅ Interfaces:     PascalCase              (User, ApiResponse, DatabaseConfig)
✅ Types:          PascalCase              (ErrorCode, LogLevel)
✅ Enums:          PascalCase              (UserRole, SessionStatus)
✅ Variables:      camelCase               (userId, expiresAt, queryResult)
✅ Functions:      camelCase, verb-noun    (getUser, validateCode, formatDate)
✅ Constants:      UPPER_SNAKE_CASE        (MAX_RETRIES, DEFAULT_TIMEOUT)
✅ Props:          camelCase               (userName, onClick, isActive)

Examples:
  interface User {
    id: string;
    email: string;
    createdAt: Date;
  }
  
  type ApiResponse<T> = {
    data: T;
    query_time_ms?: number;
  };
  
  const MAX_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  function validateEmail(email: string): boolean { ... }
```

---

### Code Organization

**Import Order:**
```typescript
// 1. External dependencies (React, Next.js, third-party)
import { FC } from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// 2. Internal imports (path aliases)
import { query } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { logError } from '@/lib/logger';

// 3. Types (if not inline)
import type { User, ApiResponse } from '@/types/api';

// 4. Relative imports (avoid if possible, use path aliases)
import { formatDate } from './utils';
```

**Component Organization:**
```typescript
// 1. Imports
import { FC, useState, useEffect } from 'react';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Constants (if any)
const DEFAULT_TITLE = 'Untitled';

// 4. Component definition
export const Component: FC<Props> = ({ title = DEFAULT_TITLE }) => {
  // a. Hooks first
  const [state, setState] = useState(0);
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  // b. Event handlers
  const handleClick = () => { ... };
  
  // c. Render helpers (if needed)
  const renderItem = (item) => { ... };
  
  // d. Return JSX
  return (
    <div>...</div>
  );
};

// 5. Exports (if multiple)
export { Component };
export type { Props };
```

**File Location Rules:**
```
✅ Shared UI components:     components/ui/
✅ Feature components:        app/[feature]/components/ (if complex)
✅ Database utilities:        lib/db.ts
✅ Auth utilities:            lib/auth.ts
✅ Error handling:            lib/errors.ts
✅ Logging:                   lib/logger.ts
✅ Formatters:                lib/formatters.ts
✅ API types:                 types/api.ts
✅ Database types:            types/database.ts
✅ Unit/API tests:            Co-located (*.test.ts)
✅ E2E tests:                 tests/e2e/*.spec.ts
✅ Config files:              Root directory
```

---

### Error Handling

**All API routes MUST:**
1. Wrap all logic in try-catch
2. Return consistent error format
3. Log errors with context
4. Never expose sensitive data (stack traces, credentials)
5. Use appropriate HTTP status codes

**Error Response Format:**
```typescript
// Error response structure
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE" // Optional, for client-side handling
}

// HTTP Status codes
400 - Bad Request (validation failed)
401 - Unauthorized (not authenticated)
403 - Forbidden (authenticated but not authorized)
404 - Not Found (resource doesn't exist)
500 - Internal Server Error (unexpected errors)
```

**Example Error Handling:**
```typescript
try {
  const user = await getUser();
  if (!user) {
    return createErrorResponse('Unauthorized', ErrorCodes.UNAUTHORIZED, 401);
  }
  
  const result = await query('SELECT ...', [params]);
  return NextResponse.json({ data: result });
  
} catch (error) {
  logError('Database query failed', { 
    endpoint: '/api/dashboard/hello',
    userId: user?.id,
    error: error instanceof Error ? error.message : 'Unknown error'
  });
  
  // Never expose database errors to client
  return createErrorResponse(
    'Unable to fetch data', 
    ErrorCodes.DATABASE_ERROR, 
    500
  );
}
```

---

### Logging Strategy

**All logging MUST:**
1. Use structured JSON format
2. Include timestamp (ISO 8601)
3. Include log level (info, warn, error)
4. Include relevant context (userId, endpoint, etc.)
5. Never log sensitive data (passwords, tokens, full connection strings)

**Log Levels:**
```typescript
// info: Normal operations, significant events
logInfo('User signed in', { userId: user.id, email: user.email });

// warn: Potential issues, degraded performance
logWarn('Slow query detected', { queryTimeMs: 1500, query: 'SELECT ...' });

// error: Failures, exceptions, critical issues
logError('Database connection failed', { 
  error: err.message, 
  database: 'neon',
  retryAttempt: 3 
});
```

**Viewing Logs:**
```bash
# Cloud Run console
https://console.cloud.google.com/run/detail/[region]/role-directory-dev/logs

# gcloud CLI
gcloud run services logs read role-directory-dev --region=southamerica-east1

# Filter by level
gcloud run services logs read role-directory-dev --filter="jsonPayload.level=error"
```

---

## Data Architecture

### Database Schema

**Neon Auth Tables (Auto-Created):**
```sql
-- Created automatically by Neon Auth SDK
-- Contains user profiles, OAuth data, sessions
-- Schema managed by Neon Auth (do not modify)
```

**Application Tables:**
```sql
-- Existing role/pricing tables from sql/ directory
-- Migrated in Story 2.4

-- Example: role_profiles table
CREATE TABLE role_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  level VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_role_profiles_level ON role_profiles(level);

-- Example: profile_pricing table
CREATE TABLE profile_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES role_profiles(id),
  region VARCHAR(100),
  min_salary INTEGER,
  max_salary INTEGER,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profile_pricing_role_id ON profile_pricing(role_id);
CREATE INDEX idx_profile_pricing_region ON profile_pricing(region);
```

**Relationships:**
```
role_profiles (1) ──< (N) profile_pricing
(One role has many pricing entries by region)

Neon Auth users (managed externally, queryable via SQL for analytics)
```

---

### Data Flow

**1. Authentication Flow:**
```
User clicks "Sign in with Google"
  → Redirects to Google OAuth consent
  → User grants permission
  → Google redirects back to app
  → Neon Auth SDK validates OAuth token
  → Neon Auth creates/updates user record in database
  → Neon Auth creates session (stored in database)
  → Session ID stored in HTTP-only cookie
  → User redirected to /dashboard
```

**2. Dashboard Query Flow:**
```
User loads /dashboard
  → Next.js server component fetches data
  → Calls /api/dashboard/hello
  → API route checks authentication (reads session cookie)
  → Neon Auth SDK validates session from database
  → API route queries role_profiles table
  → Returns data + query_time_ms
  → Dashboard renders table with formatted dates
```

**3. Session Validation (Every Request):**
```
Request to /dashboard
  → Middleware runs (middleware.ts)
  → Reads session cookie
  → Neon Auth validates session from database
  → Checks email whitelist
  → If valid: Allow request
  → If invalid: Redirect to /
```

---

## API Contracts

### Authentication Endpoints (Provided by Neon Auth SDK)

**Sign In:**
```
Provider: Neon Auth SDK
OAuth Flow: Redirects to Google/GitHub
Session: Created automatically by Neon Auth
Cookie: HTTP-only, Secure (production)
```

**Sign Out:**
```
Provider: Neon Auth SDK
Action: Destroys session in database
Cookie: Cleared
Redirect: Back to /
```

---

### Application Endpoints

#### GET /api/health

**Purpose:** Health check for deployment validation

**Authentication:** None (public)

**Request:**
```http
GET /api/health HTTP/1.1
Host: role-directory-dev-xxx.run.app
```

**Success Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-11-06T15:30:00.000Z",
  "database": "connected"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "status": "error",
  "timestamp": "2024-11-06T15:30:00.000Z",
  "database": "disconnected"
}
```

---

#### GET /api/dashboard/hello

**Purpose:** Fetch data from PostgreSQL to prove database connectivity

**Authentication:** Required (Neon Auth session)

**Request:**
```http
GET /api/dashboard/hello HTTP/1.1
Host: role-directory-dev-xxx.run.app
Cookie: session=xxx
```

**Success Response (200 OK):**
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Senior Software Engineer",
      "level": "Senior",
      "created_at": "2024-11-06T15:30:00.000Z"
    },
    ...
  ],
  "query_time_ms": 45,
  "row_count": 10
}
```

**Error Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Database query failed",
  "code": "DATABASE_ERROR"
}
```

---

## Security Architecture

### Authentication & Authorization

**OAuth Flow:**
- OAuth 2.0 via Google/GitHub (managed by Neon Auth)
- No passwords stored by application
- OAuth tokens managed by Neon Auth SDK
- Session created after successful OAuth

**Session Management:**
- Database-backed sessions (PostgreSQL)
- Session ID in HTTP-only cookie
- Secure flag enabled in production
- 24-hour expiry (configurable)
- Stateless application (sessions work across Cloud Run instances)

**Email Whitelist:**
- Server-side validation on every protected route
- Environment variable: `ALLOWED_EMAILS`
- Comma-separated list
- Checked in middleware before allowing access

---

### Secrets Management

**Runtime Secrets (Google Secret Manager):**
```
DATABASE_URL                 - Neon PostgreSQL connection string
NEON_AUTH_SECRET_KEY        - Neon Auth secret (per environment)
SESSION_SECRET              - Session encryption key (if custom sessions)
```

**CI/CD Secrets (GitHub Secrets):**
```
GCP_SERVICE_ACCOUNT_KEY     - Service account JSON for deployments
GCP_PROJECT_ID              - Google Cloud project ID
NEON_AUTH_PROJECT_ID        - Neon Auth project ID
ALLOWED_EMAILS_DEV          - Email whitelist for dev
ALLOWED_EMAILS_STG          - Email whitelist for staging
ALLOWED_EMAILS_PRD          - Email whitelist for production
```

**Security Best Practices:**
- ✅ Never commit secrets to git
- ✅ Use .env.local for local development (gitignored)
- ✅ Rotate secrets periodically
- ✅ Use least-privilege IAM roles
- ✅ Audit secret access logs

---

### Input Validation

**SQL Injection Prevention:**
- ✅ ALWAYS use parameterized queries
- ✅ Never concatenate user input into SQL
- ✅ Validate/sanitize all inputs

**XSS Prevention:**
- ✅ React escapes output by default
- ✅ Use `dangerouslySetInnerHTML` only when absolutely necessary
- ✅ Sanitize any HTML input (if accepting rich text)

**CSRF Protection:**
- ✅ Same-origin policy enforced
- ✅ HTTP-only cookies (not accessible to JavaScript)
- ✅ Neon Auth handles CSRF tokens

---

### Transport Security

**HTTPS:**
- ✅ Cloud Run provides HTTPS by default
- ✅ Automatic TLS certificate management
- ✅ HTTP requests automatically redirected to HTTPS

**Database Connection:**
- ✅ TLS/SSL required (`sslmode=require` in connection string)
- ✅ Neon enforces encrypted connections

---

## Performance Considerations

### Cold Start Optimization

**Target:** <5 seconds for application cold start

**Strategies:**
1. **Minimal dependencies** - Neon serverless driver instead of heavy ORM
2. **Multi-stage Docker build** - Smaller production image (<500MB target)
3. **Cloud Run min instances** - Set to 0 for cost, accept cold starts
4. **Lazy loading** - Load heavy libraries only when needed

**Expected Performance:**
- Cloud Run cold start: ~2-3 seconds
- Neon database cold start: ~2-3 seconds (auto-resume from suspension)
- Total cold start: <5 seconds (acceptable for MVP)

---

### Warm Request Performance

**Targets:**
- API response time: <500ms (excluding database)
- Database queries: <200ms (warm)
- Page load (dashboard): <2 seconds time-to-interactive

**Optimization Strategies:**
1. **Connection pooling** - Built-in with Neon serverless driver
2. **Database indexing** - Indexes on foreign keys, frequently queried columns
3. **Minimal data fetching** - LIMIT clauses on queries
4. **React Server Components** - Reduce client-side JavaScript

---

### Database Performance

**Query Optimization:**
- Use indexes on frequently queried columns
- LIMIT results to reasonable sizes (10-50 rows for dashboard)
- Log slow queries (>200ms) for investigation
- Use EXPLAIN ANALYZE for query optimization

**Connection Management:**
- Neon serverless driver handles pooling automatically
- No manual connection management needed
- Graceful handling of database cold starts (2-3s delay)

---

### Cost Optimization

**Cloud Run (All Environments Identical):**
- Scale to zero when idle (no idle costs)
- Minimal CPU/memory allocation (512Mi RAM, 1 CPU)
- Max 2 instances per environment (sufficient for solo usage)
- Request-based billing (first 2M requests/month free)
- **All environments (dev/staging/production) use same configuration**

**Neon PostgreSQL:**
- Auto-suspend after ~5 minutes idle (no compute costs)
- 100 compute hours/month free (sufficient for MVP)
- 3GB storage free

**Total Monthly Cost:** ~$0-3/month (within free tiers, solo usage)

---

## Deployment Architecture

### Environment Strategy

| Environment | Purpose | Cloud Run Service | Database | Auto-Deploy |
|-------------|---------|------------------|----------|-------------|
| **Development** | Rapid iteration, testing | `role-directory-dev` | `role_directory_dev` | ✅ On push to `main` |
| **Staging** | Pre-production validation | `role-directory-stg` | `role_directory_stg` | ⚙️ Manual promotion |
| **Production** | Live showcase | `role-directory-prd` | `role_directory_prd` | ⚙️ Manual promotion |

---

### Docker Configuration

**Multi-Stage Build (Dockerfile):**

```dockerfile
# Stage 1: Build (builder)
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN mkdir -p public  # Ensure public directory exists (Next.js doesn't always create it)
RUN npm run build

# Stage 2: Production Runtime (runner)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
```

**Key Features:**
- ✅ Multi-stage build (smaller production image)
- ✅ Non-root user (security best practice)
- ✅ Handles missing `public` directory (Next.js 15 behavior)
- ✅ Standalone output mode (optimized for containers)
- ✅ Cloud Run standard port (8080)

**Image Size:** ~150-200MB (Alpine-based)

---

### IAM Configuration

**Service Account:** `github-actions-deployer@role-directory.iam.gserviceaccount.com`

**Required IAM Roles:**

| Role | Purpose | Verified |
|------|---------|----------|
| `roles/storage.admin` | Push Docker images to GCR | ✅ 2025-11-08 |
| `roles/artifactregistry.writer` | Create repositories in Artifact Registry | ✅ 2025-11-08 |
| `roles/artifactregistry.admin` | Full Artifact Registry access | ✅ 2025-11-08 |
| `roles/run.developer` | Deploy to Cloud Run | ✅ 2025-11-06 |
| `roles/iam.serviceAccountUser` | Act as Cloud Run service account | ✅ 2025-11-06 |
| `roles/cloudbuild.builds.editor` | Manage Cloud Build | ✅ 2025-11-06 |
| `roles/serviceusage.serviceUsageConsumer` | Use GCP APIs | ✅ 2025-11-06 |

**Grant Commands:**
```bash
# Storage Admin (for GCR push)
gcloud projects add-iam-policy-binding role-directory \
  --member="serviceAccount:github-actions-deployer@role-directory.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Artifact Registry Writer (for creating repos)
gcloud projects add-iam-policy-binding role-directory \
  --member="serviceAccount:github-actions-deployer@role-directory.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Cloud Run Developer (for deployments)
gcloud projects add-iam-policy-binding role-directory \
  --member="serviceAccount:github-actions-deployer@role-directory.iam.gserviceaccount.com" \
  --role="roles/run.developer"
```

**GitHub Secrets Required:**

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `GCP_PROJECT_ID` | `role-directory` | GCP project identifier |
| `GCP_SERVICE_ACCOUNT_KEY` | (JSON key) | Service account credentials |

---

### Deployment Flow

```
Developer commits to `main`
  ↓
GitHub Actions CI/CD triggered
  ↓
1. Lint (ESLint)
2. Type Check (TypeScript)
3. Build (next build)
4. Unit Tests (Vitest)
5. E2E Tests (Playwright)
  ↓
6. Build Docker Image
   - docker build -t gcr.io/role-directory/role-directory:dev-YYYYMMDD-HHMMSS .
   - Multi-stage build with Alpine Linux
   - Creates optimized production image
  ↓
7. Push to Google Container Registry
   - docker push gcr.io/role-directory/role-directory:dev-YYYYMMDD-HHMMSS
   - Requires Storage Admin IAM role
  ↓
8. Deploy to Cloud Run (dev)
   - gcloud run deploy --image gcr.io/.../... --region southamerica-east1
   - Image deployed to role-directory-dev
   - Secrets injected from Secret Manager
  ↓
9. Health Check
   - GET /api/health
   - Verify 200 OK response
  ↓
✅ Dev deployment complete

─────────────────────────────────

Manual promotion to Staging:
  ↓
1. Developer triggers "Promote to Staging" workflow
2. Same Docker image tag deployed to role-directory-stg
3. Staging secrets injected
4. Health check runs
  ↓
✅ Staging deployment complete

─────────────────────────────────

Manual promotion to Production:
  ↓
1. Developer triggers "Promote to Production" workflow
2. Optional: Require approval (GitHub environment protection)
3. Same Docker image tag deployed to role-directory-prd
4. Production secrets injected
5. Health check runs
  ↓
✅ Production deployment complete
```

---

### Rollback Strategy

**Cloud Run Revisions:**
- Every deployment creates a new revision
- Previous revisions remain available
- Instant rollback via traffic splitting

**Rollback Steps:**
```bash
# List revisions
gcloud run revisions list --service=role-directory-prd --region=southamerica-east1

# Rollback to previous revision
gcloud run services update-traffic role-directory-prd \
  --to-revisions=role-directory-prd-00042-xyz=100 \
  --region=southamerica-east1

# Verify rollback
curl https://role-directory-prd-xxx.run.app/api/health
```

**Database Rollback:**
- Migration rollback scripts (down migrations)
- Manual execution before code rollback
- Test rollback in dev first

---

### Infrastructure as Code

**Current State:** Manual setup (MVP approach)

**Future (Post-MVP):** Terraform or Pulumi for:
- Cloud Run services
- Secret Manager secrets
- IAM roles
- Database schemas

---

## Development Environment

### Prerequisites

**Required Software:**
- Node.js 22.11.0 LTS ([nodejs.org](https://nodejs.org))
- npm 10.x (comes with Node.js)
- Git 2.x
- Docker 27.3.1 ([docker.com](https://docker.com))
- Google Cloud SDK ([cloud.google.com/sdk](https://cloud.google.com/sdk))

**Optional:**
- Visual Studio Code (recommended)
- Playwright browsers (for E2E tests in Phase 2)

---

### Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/role-directory.git
cd role-directory

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Configure environment variables
# Edit .env.local with your values:
DATABASE_URL=postgresql://...         # From Neon Console
NEON_AUTH_PROJECT_ID=your-project-id  # From Neon Console
NEON_AUTH_SECRET_KEY=your-secret      # From Neon Console
ALLOWED_EMAILS=your@email.com         # Your email for testing
NODE_ENV=development
PORT=3000

# 5. Run database migrations (if needed)
# Migration tool TBD in Story 2.3

# 6. Start development server
npm run dev

# 7. Open browser
# Navigate to http://localhost:3000

# 8. Lint and format code
npm run lint          # Run ESLint
npm run format        # Run Prettier (add to package.json)

# 9. Type check
npm run type-check    # Run TypeScript compiler

# 10. Build for production (local test)
npm run build
npm run start
```

---

### Docker Local Testing

```bash
# Build Docker image
docker build -t role-directory:local .

# Run container locally
docker run -p 8080:8080 \
  -e DATABASE_URL="postgresql://..." \
  -e NEON_AUTH_PROJECT_ID="your-project-id" \
  -e NEON_AUTH_SECRET_KEY="your-secret" \
  -e NODE_ENV=development \
  role-directory:local

# Test health check
curl http://localhost:8080/api/health
```

---

### Testing (Phase 2)

```bash
# Run unit tests
npm run test              # Vitest

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e          # Playwright

# Run E2E tests in UI mode
npm run test:e2e:ui
```

---

## Architecture Decision Records (ADRs)

### ADR-001: Use Next.js 15 with App Router

**Status:** Accepted

**Context:** Need modern React framework for server-side rendering and API routes.

**Decision:** Use Next.js 15 with App Router (not Pages Router).

**Rationale:**
- App Router is the recommended approach for new Next.js projects
- React Server Components reduce client-side JavaScript
- Improved routing with layouts and loading states
- Better TypeScript support

**Consequences:**
- Team must learn App Router conventions
- Some community resources still use Pages Router
- Migration path if upgrading from Pages Router in future

---

### ADR-002: Use Neon PostgreSQL Serverless

**Status:** Accepted

**Context:** Need cost-effective PostgreSQL hosting for 3 environments.

**Decision:** Use Neon PostgreSQL free tier for all environments.

**Rationale:**
- **Cost:** $0/month (free tier: 3GB storage, 100 compute hours)
- **Serverless:** Auto-suspend aligns with Cloud Run serverless model
- **Standard PostgreSQL:** No vendor lock-in, compatible with all PostgreSQL clients
- **Easy migration:** Can migrate to Cloud SQL later with zero code changes

**Consequences:**
- Cold start delay (2-3s) after idle period (acceptable for MVP)
- 3GB storage limit (sufficient for MVP)
- External dependency (not GCP-native)

**Trade-offs Considered:**
- Cloud SQL: $10/month (rejected for MVP cost)
- Cloud SQL Serverless: Not available in user's region
- Supabase: Similar to Neon, chose Neon for better PostgreSQL focus

---

### ADR-003: Use Neon Auth Instead of Custom Authentication

**Status:** Accepted

**Context:** Need OAuth authentication with email whitelist for access control.

**Decision:** Use Neon Auth SDK instead of building custom authentication.

**Rationale:**
- **Time savings:** 2-3 days of development saved
- **Security:** Battle-tested OAuth implementation
- **Maintenance:** No need to manage sessions, tokens, OAuth flows
- **User data:** Automatically synced to PostgreSQL database

**Consequences:**
- Dependency on Neon Auth service
- Must follow Neon Auth SDK patterns
- Limited customization of auth flows

**Trade-offs Considered:**
- NextAuth.js: More flexible but requires more setup
- Custom OAuth: More control but 2-3 days extra work
- Auth0/Clerk: Paid services (rejected for MVP cost)

---

### ADR-004: Deploy from Source (No Manual Docker Build)

**Status:** Accepted

**Context:** Need simple CI/CD pipeline for infrastructure validation MVP.

**Decision:** Use Cloud Run "deploy from source" (Cloud Build handles Docker build).

**Rationale:**
- **Simplicity:** No manual Docker build/push in CI/CD
- **Cost:** Cloud Build free tier (120 build-minutes/day)
- **Integration:** Seamless GCP ecosystem integration
- **Auto-registry:** Artifact Registry managed automatically

**Consequences:**
- Less control over Docker build process
- Slightly slower than pre-built images
- Dependency on Cloud Build service

**Trade-offs Considered:**
- GitHub Container Registry: More control, but extra configuration
- Docker Hub: External dependency, rate limits
- Manual Docker build: More complexity in CI/CD

---

### ADR-005: Use Vitest for All Testing (No Supertest)

**Status:** Accepted

**Context:** Need testing framework for unit, component, and API tests.

**Decision:** Use Vitest for unit, component, and API tests. Use Playwright for E2E only.

**Rationale:**
- **Simplicity:** One framework for 3 test types (unit, component, API)
- **Modern:** Vite-native, faster than Jest
- **TypeScript:** First-class TypeScript support
- **Dependencies:** Fewer packages to maintain

**Consequences:**
- API test syntax slightly more verbose than Supertest
- Less specialized tooling for HTTP testing
- Can add Supertest later if needed (no architectural impact)

**Trade-offs Considered:**
- Vitest + Supertest: Best tool for each job, but extra dependency
- Jest: More mature ecosystem, but slower and older
- Playwright for API tests: Overkill, designed for browser testing

---

### ADR-006: Standardize Date Format to YYYY-MM-DD HH:mm:ss

**Status:** Accepted

**Context:** Need consistent date display across entire application.

**Decision:** All dates displayed in UI MUST use format `YYYY-MM-DD HH:mm:ss`.

**Rationale:**
- **Consistency:** One format across entire app
- **Clarity:** ISO-like format, unambiguous
- **Sortable:** Lexicographically sortable
- **User preference:** danielvm specifically requested this format

**Consequences:**
- Must use `formatDate()` utility for all date displays
- Cannot use `toLocaleDateString()` or other formats
- Must document format in all date-related stories

**Implementation:**
```typescript
// lib/formatters.ts
export function formatDate(date: Date | string): string {
  // Returns: "2024-11-06 15:30:45"
}
```

---

### ADR-007: Use Google Secret Manager for Runtime Secrets

**Status:** Accepted

**Context:** Need secure secrets management for database credentials and API keys.

**Decision:** Use Google Secret Manager for runtime secrets + GitHub Secrets for CI/CD.

**Rationale:**
- **Cost:** Free tier (6 secret versions, 10K operations/month)
- **Security:** Enterprise-grade encryption at rest and in transit
- **Integration:** Native Cloud Run integration
- **Separation:** Runtime secrets separate from CI/CD secrets

**Consequences:**
- Requires IAM role configuration
- Secrets management split across two systems (GSM + GitHub)
- Must rotate secrets in two places if needed

**Trade-offs Considered:**
- Cloud Run environment variables: Less secure, visible in console
- GitHub Secrets only: Can't access from running Cloud Run services
- Vault/Doppler: Extra infrastructure, cost

---

### ADR-008: Use Zod for Configuration Management

**Status:** Accepted

**Context:** Need type-safe, validated configuration management with fail-fast behavior.

**Decision:** Use Zod for runtime configuration validation with centralized `lib/config.ts`.

**Rationale:**
- **Type Safety:** Automatic TypeScript type inference from schema
- **Runtime Validation:** Catches configuration errors at startup, not at runtime
- **Better Errors:** Detailed error messages ("DATABASE_URL must be a valid URL")
- **Transformations:** Built-in parsing (split emails, parse ports)
- **DRY:** Single source of truth for configuration schema
- **Industry Standard:** Widely used in Next.js/TypeScript projects

**Consequences:**
- Additional dependency (Zod 3.23.8, ~12KB gzipped)
- Configuration access pattern must use `getConfig()`, not `process.env`
- Slightly more verbose than direct env var access

**Implementation:**
```typescript
// lib/config.ts
const configSchema = z.object({
  databaseUrl: z.string().url(),
  allowedEmails: z.string().transform(str => str.split(',')),
  // ...
});

export type Config = z.infer<typeof configSchema>;
export const getConfig = () => configSchema.parse(process.env);
```

**Trade-offs Considered:**
- Direct `process.env` access: Simpler, but no validation or type safety
- Custom validation functions: More code to maintain, less declarative
- Joi/Yup: Zod has better TypeScript integration and type inference

---

## Operational Guides Reference

The following operational guides provide step-by-step instructions for deployment, infrastructure setup, and maintenance procedures:

### Infrastructure Setup
- [Neon Infrastructure Setup Guide](../guides/neon-infrastructure-setup-guide.md) - Database infrastructure setup
- [Neon Auth Setup Guide](../guides/neon-auth-setup-guide.md) - Authentication provider configuration

### Deployment & CI/CD
- [Docker Usage Guide](../guides/docker-usage-guide.md) - Building and running containers locally
- [GitHub Actions Setup Guide](../guides/github-actions-setup-guide.md) - CI/CD pipeline configuration
- [Cloud Run Production Setup Guide](../guides/cloud-run-production-setup.md) - Production environment setup
- [Cloud Run Staging Setup Guide](../guides/cloud-run-staging-setup.md) - Staging environment setup

### Operations & Maintenance
- [Promotion Workflow Guide](../guides/promotion-workflow-guide.md) - Manual promotion procedures (dev→staging→production)
- [Rollback Procedures](../guides/rollback-procedures.md) - Rollback procedures for all environments
- [Auto README Status Implementation](../guides/auto-readme-status-implementation.md) - Automated status reporting

All guides follow the architectural patterns and conventions defined in this document.

---

## Summary

This architecture document defines all technical decisions, patterns, and conventions for the role-directory project. All AI agents implementing stories from the epics.md file MUST follow these patterns to ensure consistency.

**Key Takeaways:**
1. **Infrastructure-first MVP:** Validate deployment pipeline before complex features
2. **Serverless stack:** Cloud Run + Neon PostgreSQL (auto-scale, ~$0-3/month)
3. **TypeScript everywhere:** Type safety from database to UI
4. **Zod validation:** Type-safe configuration management with fail-fast behavior
5. **Consistent patterns:** All agents follow naming, error handling, and date formatting rules
6. **Simple architecture:** Flat structure, minimal dependencies, proven patterns

**Next Steps:**
1. Review and approve this architecture
2. Run solutioning gate check (`*solutioning-gate-check`)
3. Begin Sprint 1 implementation (Story 1.1: Project Initialization)

---

## Operational Guides

This architecture is supported by the following operational guides:

### Deployment & Infrastructure

- [Cloud Run Production Setup](../guides/cloud-run-production-setup.md)
- [Cloud Run Staging Setup](../guides/cloud-run-staging-setup.md)
- [Artifact Registry Migration](../guides/artifact-registry-migration.md)

### CI/CD & Workflows

- [GitHub Actions Setup Guide](../guides/github-actions-setup-guide.md)
- [Promotion Workflow Guide](../guides/promotion-workflow-guide.md)
- [How to Promote Images](../guides/how-to-promote-images.md)
- [Rollback Procedures](../guides/rollback-procedures.md)

### Database & Authentication

- [Neon Infrastructure Setup](../guides/neon-infrastructure-setup-guide.md)
- [Neon Auth Setup](../guides/neon-auth-setup-guide.md)

### Development

- [Docker Usage Guide](../guides/docker-usage-guide.md)
- [Auto README Status Implementation](../guides/auto-readme-status-implementation.md)

> **Note:** These guides provide step-by-step instructions for implementing and operating the systems described in this architecture document.

---

_Generated by BMAD Decision Architecture Workflow v1.3.2_  
_Date: 2025-11-06 (Updated with Zod configuration management)_  
_For: danielvm_  
_Architect: Winston_

