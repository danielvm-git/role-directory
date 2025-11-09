# role-directory

**Infrastructure validation web application with secure OAuth-based collaboration**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.0.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)](https://www.typescriptlang.org/)
[![PRD Validation](https://img.shields.io/badge/PRD%20Validation-99.6%25-brightgreen)](docs/reports/prd-validation-2025-11-06.md)
[![Architecture Score](https://img.shields.io/badge/Architecture-100%2F100-success)](docs/reports/architecture-validation-report-2025-11-06.md)

---

## Motivation

When building applications in the cloud, there's a tension between rapid iteration and maintaining confidentiality during development. **role-directory** solves this by creating an infrastructure validation MVP that proves a complete production-ready deployment pipeline (dev → staging → production) works correctly **before** investing in complex features.

**Why this project exists:**
- ✅ Validate full deployment stack early (Next.js + PostgreSQL + Cloud Run + CI/CD)
- ✅ Enable secure collaboration with trusted stakeholders via OAuth
- ✅ Build confidence in infrastructure through practical feature development
- ✅ Stay within free tiers (~$0-3/month) while proving production readiness

> **The Magic:** Infrastructure de-risking through deliberate, incremental validation. Every feature proves a different deployment layer works correctly.

---

## Build Status

| Environment | Status | URL |
|------------|--------|-----|
| **Development** | 🔄 Ready for Implementation | TBD |
| **Staging** | ⏳ Pending | TBD |
| **Production** | ⏳ Pending | TBD |

**Current Phase:** 🔄 Implementation (Epic 2 - Database Infrastructure)  
**Documentation Quality:** 📚 Grade A+ (Consolidated & Current)

---

## Screenshots

> 📸 *Screenshots will be added after MVP implementation*

**Planned Features:**
- OAuth sign-in page (Google/GitHub)
- Hello World dashboard with database query results
- User profile display with email whitelist
- Query performance metrics

---

## Tech Stack

**Built with:**

### Frontend
- [Next.js](https://nextjs.org/) 15.0.3 (App Router)
- [React](https://react.dev/) 18.3.1
- [TypeScript](https://www.typescriptlang.org/) 5.6.3
- [Tailwind CSS](https://tailwindcss.com/) 3.4.14

### Backend
- [Node.js](https://nodejs.org/) 22.11.0 LTS
- Next.js API Routes
- [Neon Auth](https://neon.tech/docs/neon-auth/overview) (OAuth + Session Management)

### Database
- [Neon PostgreSQL](https://neon.tech/) 17.0 (Serverless)
- [@neondatabase/serverless](https://www.npmjs.com/package/@neondatabase/serverless) 0.10.1

### Infrastructure
- [Google Cloud Run](https://cloud.google.com/run) (3 environments: dev, stg, prd)
- [Artifact Registry](https://cloud.google.com/artifact-registry) (Docker image storage)
- [GitHub Actions](https://github.com/features/actions) (CI/CD)
- [Google Secret Manager](https://cloud.google.com/secret-manager) (Runtime secrets)
- [Docker](https://www.docker.com/) 27.3.1

### Code Quality
- [ESLint](https://eslint.org/) 9.13.0
- [Prettier](https://prettier.io/) 3.3.3
- [Zod](https://zod.dev/) 3.23.8 (Configuration validation)

---

## Features

**What makes this project stand out:**

🎯 **Infrastructure-First Approach**
- Validates deployment pipeline BEFORE building complex features
- Proves dev → staging → production promotion workflow works

💰 **Cost-Optimized (~$0-3/month)**
- Leverages free tiers: Cloud Run + Neon PostgreSQL + GitHub Actions
- Auto-suspends when idle (serverless architecture)

🔐 **OAuth Authentication with Email Whitelist**
- No custom auth code needed (Neon Auth handles it)
- Server-side email whitelist for access control
- Session management works across Cloud Run instances

📊 **Complete Traceability**
- 21 functional requirements → 32 implementable stories
- 100% requirement coverage validated
- 7 Architecture Decision Records (ADRs)

🤖 **AI Agent Ready**
- 50+ consistency rules for parallel development
- Comprehensive implementation patterns
- Type-safe configuration with Zod

---

## Code Example

**Configuration Validation (Zod):**

```typescript
// lib/config.ts
import { z } from 'zod';

const configSchema = z.object({
  databaseUrl: z.string()
    .url('DATABASE_URL must be a valid URL')
    .startsWith('postgresql://'),
  allowedEmails: z.string()
    .transform(str => str.split(',').map(e => e.trim())),
  nodeEnv: z.enum(['development', 'staging', 'production']),
});

export const getConfig = () => configSchema.parse(process.env);
```

**Database Query Pattern:**

```typescript
// lib/db.ts - Database module
import { query, queryOne } from '@/lib/db';

// Simple query
const version = await query('SELECT version()');

// Parameterized query (prevents SQL injection)
const users = await query<User>(
  'SELECT * FROM users WHERE email = $1',
  ['user@example.com']
);

// Query periodic table sample data
const elements = await query<Element>(
  'SELECT * FROM periodic_table WHERE atomic_number <= $1 ORDER BY atomic_number',
  [10]
);

// Single row query
const element = await queryOne<Element>(
  'SELECT * FROM periodic_table WHERE symbol = $1',
  ['Ne']
);
```

**API Route Pattern:**

```typescript
// app/api/dashboard/hello/route.ts
import { getUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const start = Date.now();
    const result = await query('SELECT * FROM periodic_table ORDER BY atomic_number LIMIT 10');
    
    return NextResponse.json({ 
      data: result, 
      query_time_ms: Date.now() - start 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

**Database Features:**

- ✅ **HTTP-based connection** - Neon serverless driver (no connection pooling needed)
- ✅ **Parameterized queries** - Prevents SQL injection ($1, $2 placeholders)
- ✅ **Slow query logging** - Automatically logs queries >200ms
- ✅ **Error sanitization** - Generic error messages to client, full details server-side
- ✅ **Cold start handling** - Transparently handles Neon auto-suspend/resume (2-3s)
- ✅ **Type safety** - Generic type parameter for result rows

---

## Installation

### Prerequisites

- [Node.js 22.11.0 LTS](https://nodejs.org/)
- [Docker 27.3.1](https://docker.com/)
- [Google Cloud SDK](https://cloud.google.com/sdk)
- Neon account ([sign up free](https://neon.tech))
- GitHub account

### Step-by-Step Setup

**1. Clone the repository**

```bash
git clone https://github.com/danielvm/role-directory.git
cd role-directory
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# Database (Neon PostgreSQL) - REQUIRED
DATABASE_URL="postgresql://user:pass@ep-xxx.region.neon.tech/role_directory_dev?sslmode=require"

# Access Control - REQUIRED
ALLOWED_EMAILS="your-email@example.com,collaborator@example.com"

# Authentication (Neon Auth) - REQUIRED for Epic 3
NEON_AUTH_PROJECT_ID="your-project-id"
NEON_AUTH_SECRET_KEY="your-secret-key"

# Environment - OPTIONAL (defaults shown)
NODE_ENV="development"  # development | staging | production
PORT="3000"            # 1-65535
```

**Environment Variable Details:**

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | None | PostgreSQL connection string from Neon (must start with `postgresql://`) |
| `ALLOWED_EMAILS` | ✅ Yes | None | Comma-separated list of allowed email addresses |
| `NODE_ENV` | ⚠️ Optional | `development` | Application environment: `development`, `staging`, `production` |
| `PORT` | ⚠️ Optional | `8080` | Server port number (1-65535) |
| `NEON_AUTH_PROJECT_ID` | 🔮 Epic 3 | None | Neon Auth project ID (for OAuth) |
| `NEON_AUTH_SECRET_KEY` | 🔮 Epic 3 | None | Neon Auth secret key (for OAuth) |
| `NEXT_PUBLIC_API_URL` | ⚠️ Optional | None | Public API URL for client-side requests |

**Configuration Validation:**

The application uses [Zod](https://zod.dev/) for runtime validation. If configuration is invalid, the app **fails fast** with detailed error messages:

```bash
# Example: Missing DATABASE_URL
Configuration validation failed:
  databaseUrl: Required

Please check your environment variables in .env.local (local) or Cloud Run configuration (production).
```

**Using Configuration in Code:**

```typescript
import { getConfig } from '@/lib/config';

// Type-safe configuration access
const config = getConfig();
console.log(config.databaseUrl);  // string
console.log(config.allowedEmails); // string[]
console.log(config.nodeEnv);      // 'development' | 'staging' | 'production'
console.log(config.port);          // number
```

**4. Set up Neon PostgreSQL**

See detailed guide: [Neon Infrastructure Setup Guide](docs/guides/neon-infrastructure-setup-guide.md)

**5. Run database migrations**

Apply schema migrations to set up your database:

```bash
# Check migration status
DATABASE_URL="postgresql://..." npm run migrate:status

# Apply all pending migrations
DATABASE_URL="postgresql://..." npm run migrate:up
```

See detailed guide: [Database Migrations Guide](docs/guides/database-migrations-guide.md)

**6. Set up Neon Auth (OAuth)**

See detailed guide: [Neon Auth Setup Guide](docs/guides/neon-auth-setup-guide.md)

**7. Load sample data (optional)**

The application uses the [Neon Periodic Table sample dataset](https://neon.com/docs/import/import-sample-data#periodic-table-data) for demonstration. This data is automatically loaded during database migrations (Story 2.4).

**Sample data details:**
- **Table:** `periodic_table`
- **Records:** 118 elements
- **Source:** [Neon sample datasets](https://neon.com/docs/import/import-sample-data#periodic-table-data)
- **Size:** ~7.2 MB installed
- **License:** ISC License (Copyright © 2017, Chris Andrejewski)

The periodic table data is perfect for MVP validation because it:
- ✅ Small dataset (118 rows) - fast queries
- ✅ Rich schema (28 columns) - demonstrates data display
- ✅ No sensitive data - safe for public deployment
- ✅ Well-known domain - easy to verify correctness

**8. Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## API Reference

### Authentication Endpoints

**Provided by Neon Auth SDK:**
- `POST /api/auth/signin` - OAuth sign-in (Google/GitHub)
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/callback/*` - OAuth callbacks

### Application Endpoints

#### `GET /api/health`
**Health check endpoint**

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-11-06T15:30:00.000Z",
  "database": "connected"
}
```

#### `GET /api/dashboard/hello`
**Dashboard data query** (requires authentication)

Fetches data from the [Periodic Table sample dataset](https://neon.com/docs/import/import-sample-data#periodic-table-data).

**Response (200 OK):**
```json
{
  "data": [
    {
      "AtomicNumber": 1,
      "Element": "Hydrogen",
      "Symbol": "H",
      "AtomicMass": 1.007,
      "Phase": "gas",
      "Type": "Nonmetal"
    },
    {
      "AtomicNumber": 2,
      "Element": "Helium",
      "Symbol": "He",
      "AtomicMass": 4.002,
      "Phase": "gas",
      "Type": "Noble Gas"
    }
  ],
  "query_time_ms": 45,
  "row_count": 10
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

Full API documentation: [Architecture Document](docs/3-solutioning/architecture.md#api-contracts)

---

## Tests

> 🧪 **Testing Strategy**

**MVP (Phase 1):**
- ✅ Lint: `npm run lint` (ESLint)
- ✅ Type Check: `npm run type-check` (TypeScript)
- ✅ Build: `npm run build` (Next.js)
- ✅ Unit Tests: 38 tests (Vitest) - Configuration, Database, API Routes
- ✅ E2E Tests: Playwright (Health checks, Landing page, Cloud Run verification)
- ✅ Database Integration: Real Neon database with Periodic Table sample data
- ✅ CI/CD: All tests run automatically on every commit
- ✅ Manual E2E: See [Story 4.5 Checklist](docs/2-planning/epics.md#story-45-end-to-end-testing-manual-mvp-validation)

**Growth Features (Phase 2):**
- 🔄 API Tests: Vitest (100% API route coverage)
- 🔄 Component Tests: React Testing Library (70%+ coverage target)
- 🔄 Performance Tests: Load testing and benchmarking

**Run current tests:**

```bash
# Lint code
npm run lint

# Type check
npm run type-check

# Build (validates entire app)
npm run build

# Unit tests - 38 tests (includes database integration)
npm run test:unit

# E2E tests (Playwright)
npm run test:e2e

# All tests together
npm test
```

**Test Coverage:**

| Category | Tests | Description |
|----------|-------|-------------|
| **Configuration** | 18 tests | Zod schema validation, environment variables |
| **Database** | 16 tests | Connection, queries, error handling, performance |
| **API Routes** | 4 tests | Health check endpoint, error responses |
| **Total** | **38 tests** | All tests run in CI/CD with real database |

**Database Integration Tests:**

All database tests run automatically using a real Neon database with [Periodic Table sample data](https://neon.com/docs/import/import-sample-data#periodic-table-data):

```bash
# Run database integration tests (included in test:unit)
npm run test:unit tests/unit/db.test.ts
```

**What's tested:**
- ✅ Database connection and configuration
- ✅ SQL query execution with parameterized queries
- ✅ `query()` and `queryOne()` helper functions
- ✅ Error handling and sanitization
- ✅ Query performance monitoring (slow query logging)
- ✅ Periodic Table sample data (118 elements)
- ✅ Cold start handling (Neon auto-suspend/resume)

**CI/CD Integration:**

All 38 tests run automatically in GitHub Actions:
- ✅ Tests use real Neon database (not mocked)
- ✅ GitHub Secret `DEV_DATABASE_URL` provides database connection
- ✅ [Periodic Table sample data](https://neon.com/docs/import/import-sample-data#periodic-table-data) loaded via migration
- ✅ Tests must pass before deployment to dev environment
- ✅ Zero additional cost (GitHub Secrets are free)

**Security:** Database connection strings are encrypted as GitHub Secrets and never exposed in logs.

---

## How to Use

### For Developers

**1. Review Documentation**

Start here:
- 📋 [Product Brief](docs/1-discovery/product-brief-role-directory-2025-11-06.md) - Project overview
- 📊 [PRD](docs/2-planning/PRD.md) - Requirements (99.6% validated)
- 🏗️ [Architecture](docs/3-solutioning/architecture.md) - Technical design (100/100 score)
- 📖 [Epic Breakdown](docs/2-planning/epics.md) - 32 implementable stories

**2. Set Up Infrastructure**

Follow these guides in order:
1. [Neon Infrastructure Setup Guide](docs/guides/neon-infrastructure-setup-guide.md) - PostgreSQL databases
2. [Cloud Run Setup Guide](docs/guides/cloud-run-setup-guide.md) - Cloud Run services
3. [GitHub Actions Setup Guide](docs/guides/github-actions-setup-guide.md) - CI/CD pipeline
4. [Neon Auth Setup Guide](docs/guides/neon-auth-setup-guide.md) - OAuth authentication

**3. Implement Stories**

Stories are designed for single-session completion:
- **Epic 1:** Foundation & Deployment Pipeline (11 stories)
- **Epic 2:** Database Infrastructure (6 stories)
- **Epic 3:** Authentication & Access Control (8 stories)
- **Epic 4:** Hello World Dashboard (7 stories)

Start with [Story 1.1: Project Initialization](docs/2-planning/epics.md#story-11-project-initialization-and-structure)

**4. Deploy to Cloud Run**

```bash
# Set variables
export PROJECT_ID=$(gcloud config get-value project)
export REGION="southamerica-east1"
export IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/role-directory/app"

# Build Docker image
docker build -t ${IMAGE_NAME}:latest .

# Push to Artifact Registry
docker push ${IMAGE_NAME}:latest

# Deploy to dev
gcloud run deploy role-directory-dev \
  --image=${IMAGE_NAME}:latest \
  --region=${REGION}
```

See [Architecture: Deployment Flow](docs/3-solutioning/architecture.md#deployment-flow) and [Artifact Registry Migration Guide](docs/guides/artifact-registry-migration-guide.md)

### For Collaborators

**1. Request Access**

Contact the admin to add your email to the whitelist.

**2. Sign In**

Visit the application URL and click "Sign in with Google" (or GitHub).

**3. View Dashboard**

After authentication, you'll see:
- Your profile information
- Database query results (proves full stack works)
- Query performance metrics

---

## Deployment and Operations

### Operational Documentation

**Deployment Workflows:**
- [Release and Deployment Guide](docs/guides/release-and-deployment-guide.md) - Complete deployment procedures
- [Cloud Run Setup Guide](docs/guides/cloud-run-setup-guide.md) - Cloud Run service configuration (all environments)
- [GitHub Actions Setup Guide](docs/guides/github-actions-setup-guide.md) - CI/CD pipeline configuration

**Recovery Procedures:**
- **[Rollback Procedures](docs/3-solutioning/architecture.md#rollback-strategy)** - How to rollback deployments in any environment
  - Quick recovery from failed deployments (<3 minutes)
  - Zero-downtime rollback via Cloud Run revision management
  - Tested procedures for dev, staging, and production

**Infrastructure Guides:**
- [Docker Usage Guide](docs/guides/docker-usage-guide.md) - Containerization and local development
- [Neon Infrastructure Setup Guide](docs/guides/neon-infrastructure-setup-guide.md) - PostgreSQL database setup (all environments)
- [Neon Auth Setup Guide](docs/guides/neon-auth-setup-guide.md) - OAuth configuration
- [Artifact Registry Migration Guide](docs/guides/artifact-registry-migration-guide.md) - Container image storage

### Quick Operational Reference

**Deploy to Dev (CI/CD):**
```bash
# Automatically deploys on push to main
git push origin main
```

**Promote Staging to Production:**
```bash
# Manually triggered via GitHub Actions
# See: docs/guides/release-and-deployment-guide.md
```

**Rollback Production:**
```bash
# List available revisions
gcloud run revisions list --service=role-directory-production --region=southamerica-east1

# Rollback to previous revision
gcloud run services update-traffic role-directory-production \
  --region=southamerica-east1 \
  --to-revisions=[PREVIOUS_REVISION]=100

# Verify rollback
curl -f -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  [PRODUCTION_URL]/api/health
```

See [Rollback Procedures](docs/3-solutioning/architecture.md#rollback-strategy) for comprehensive instructions.

---

## Documentation

### 📚 Complete Documentation Suite

**Planning & Requirements:**
- [Product Brief](docs/1-discovery/product-brief-role-directory-2025-11-06.md) - Vision & goals
- [PRD](docs/2-planning/PRD.md) - Product requirements (1,225 lines)
- [Epics & Stories](docs/2-planning/epics.md) - Implementation breakdown (32 stories)
- [PRD Validation Report](docs/reports/prd-validation-2025-11-06.md) - 99.6% pass rate

**Architecture & Design:**
- [Architecture Document](docs/3-solutioning/architecture.md) - Technical design (1,913 lines)
- [Architecture Validation](docs/reports/architecture-validation-report-2025-11-06.md) - 100/100 score
- [Implementation Readiness](docs/reports/implementation-readiness-report-2025-11-06.md) - 98/100 confidence
- [Tech Spec Epic 1](docs/3-solutioning/tech-spec-epic-1.md) - Foundation & deployment
- [Tech Spec Epic 2](docs/3-solutioning/tech-spec-epic-2.md) - Database infrastructure

**Setup & Operations:**
- [Neon Infrastructure Setup Guide](docs/guides/neon-infrastructure-setup-guide.md) - PostgreSQL database setup (all environments)
- [Neon Auth Setup Guide](docs/guides/neon-auth-setup-guide.md) - OAuth configuration
- [Cloud Run Setup Guide](docs/guides/cloud-run-setup-guide.md) - Cloud Run services (all environments)
- [GitHub Actions Setup Guide](docs/guides/github-actions-setup-guide.md) - CI/CD pipeline configuration
- [Docker Usage Guide](docs/guides/docker-usage-guide.md) - Local development and containerization
- [Database Migrations Guide](docs/guides/database-migrations-guide.md) - Schema migration management
- [Release and Deployment Guide](docs/guides/release-and-deployment-guide.md) - Deployment procedures and promotions
- [Artifact Registry Migration Guide](docs/guides/artifact-registry-migration-guide.md) - GCR to Artifact Registry migration
- [Playwright CI Debugging Guide](docs/guides/playwright-ci-debugging-guide.md) - CI test debugging procedures

**Project Status:**
- [Workflow Status](docs/bmm-workflow-status.yaml) - Current phase tracking
- [Documentation Audit](docs/reports/documentation-audit-2025-11-06.md) - Quality assessment (94.2/100)

---

## Contribute

We welcome contributions! Here's how you can help:

### Contribution Guidelines

**1. Review the Documentation**

Before contributing, please read:
- [Architecture Document](docs/3-solutioning/architecture.md) - Implementation patterns
- [Epic Breakdown](docs/2-planning/epics.md) - Story requirements

**2. Follow Code Standards**

- ✅ **Naming Conventions:** See [Architecture: Consistency Rules](docs/3-solutioning/architecture.md#consistency-rules)
- ✅ **API Route Pattern:** See [Architecture: API Route Pattern](docs/3-solutioning/architecture.md#api-route-pattern)
- ✅ **Component Pattern:** See [Architecture: Component Pattern](docs/3-solutioning/architecture.md#component-pattern)
- ✅ **Date Format:** Always use `YYYY-MM-DD HH:mm:ss` ([ADR-006](docs/3-solutioning/architecture.md#adr-006-standardize-date-format-to-yyyy-mm-dd-hhmmss))

**3. Development Workflow**

```bash
# Create a feature branch
git checkout -b feature/story-x.x-description

# Make your changes
# Follow story acceptance criteria from epics.md

# Lint and type check
npm run lint
npm run type-check

# Build to verify
npm run build

# Commit with descriptive message
git commit -m "feat: implement Story X.X - Description"

# Push and create pull request
git push origin feature/story-x.x-description
```

**4. Pull Request Guidelines**

- Reference the story number in your PR title (e.g., "Story 2.3: Database Schema Migration Setup")
- Include acceptance criteria verification in PR description
- Ensure all linting and type checking passes
- Link to relevant documentation sections

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Follow the project's technical standards
- Ask questions if requirements are unclear

---

## Credits

**Created by:** danielvm

**Powered by:**
- [Next.js](https://nextjs.org/) - React framework
- [Neon](https://neon.tech/) - Serverless PostgreSQL & Auth
- [Google Cloud](https://cloud.google.com/) - Cloud Run hosting
- [BMAD Method](https://github.com/bmad-method) - Project methodology

**Inspiration:**
- Infrastructure-first development philosophy
- Cost-optimized serverless architecture
- AI agent-friendly implementation patterns

**Special Thanks:**
- Neon team for serverless PostgreSQL and auth solutions
- Next.js team for excellent App Router implementation
- BMAD Method for comprehensive project methodology

---

## License

MIT © danielvm

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<!-- STATUS_START -->
## Project Status & Roadmap

### ✅ Completed Phases

- [x] **Discovery** - Product brief created
- [x] **Planning** - PRD defined & Epics defined (99.6% validation)
- [x] **Solutioning** - Architecture designed (100/100 score)

### 🔄 Current Phase: Implementation

**MVP Goal:** ONE feature through 3 environments (dev → stg → prd)

**Progress:**
- [x] Epic 1: Foundation & Deployment Pipeline (11/11 stories) ✅
- [ ] Epic 2: Database Infrastructure (2/6 stories) 🔄
- [ ] Epic 3: Authentication & Access Control (0/8 stories)
- [ ] Epic 4: Hello World Dashboard (0/7 stories)

**Estimated Completion:** 4-8 days remaining for MVP (Epic 2-4)

### 🔮 Future Phases

**Phase 2: Testing & Quality** (Deferred from MVP)
- Unit tests (Vitest, 70%+ coverage)
- API integration tests (100% coverage)
- E2E tests (Playwright, 5-10 scenarios)

**Phase 3: Admin Interface**
- Admin UI for code generation
- Usage analytics per code
- Access logs dashboard

**Phase 4: Additional Dashboard Pages**
- Workflow status page
- Sprint status page

**Phase 6: Core Application Features**
- Role catalog display
- Pricing information by region
- Career track visualization
- Search and filtering

**Phase 7: Public Launch**
- Remove invitation codes (or make optional)
- Public marketing site
- Full feature set

<!-- STATUS_END -->

---

## Support & Contact

### 📞 Need Help?

- **Documentation Issues:** [File an issue](https://github.com/danielvm/role-directory/issues) with label `documentation`
- **Technical Questions:** [File an issue](https://github.com/danielvm/role-directory/issues) with label `question`
- **Bug Reports:** [File an issue](https://github.com/danielvm/role-directory/issues) with label `bug`

### 📖 Resources

- [GitHub Best Practices](https://docs.github.com/en/repositories/creating-and-managing-repositories/best-practices-for-repositories)
- [Next.js Documentation](https://nextjs.org/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)

---

**Made with ❤️ by danielvm** | **Documentation Grade: A (94.2/100)** | **Cost: ~$0-3/month**

