# Story 2.1: Neon PostgreSQL Account and Database Setup

Status: ready-for-dev

## Story

As a **developer**,  
I want **three separate Neon PostgreSQL databases (dev, staging, production) configured and accessible**,  
so that **each environment has isolated data and I can validate schema migrations independently**.

## Acceptance Criteria

**Given** I have a Neon account (free tier)  
**When** I create the databases  
**Then** the following are set up:
- Three databases: `role_directory_dev`, `role_directory_stg`, `role_directory_prd`
- Each database has a unique connection string
- Connection strings use format: `postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require`
- TLS/SSL encryption enabled (sslmode=require)
- Neon auto-suspend enabled (default, saves compute hours)

**And** I can connect to each database using `psql` or a PostgreSQL client  
**And** connection strings are stored in Google Secret Manager (not in code)  
**And** each environment's Cloud Run service has access to its corresponding database connection string

## Tasks / Subtasks

- [ ] Task 1: Create Neon account (AC: Free tier account created)
  - [ ] Navigate to: https://neon.tech
  - [ ] Click "Sign Up" button
  - [ ] Sign up with GitHub or Google account (recommended for OAuth)
  - [ ] Verify email address if required
  - [ ] Complete account setup wizard
  - [ ] Note: Free tier includes 1 project, unlimited databases, 0.5 GB storage, auto-suspend after 5 minutes

- [ ] Task 2: Create Neon project (AC: Project for role-directory created)
  - [ ] In Neon Console, click "Create Project"
  - [ ] Project name: `role-directory` or `role-directory-mvp`
  - [ ] Select region: Choose closest to Cloud Run region (us-central1)
    - If US Central not available, choose US East or US West
  - [ ] Leave auto-suspend enabled (default, cost savings)
  - [ ] Create project
  - [ ] Note project ID (displayed in URL or project settings)

- [ ] Task 3: Create dev database (AC: role_directory_dev database exists)
  - [ ] In Neon Console, navigate to project
  - [ ] Click "Databases" tab
  - [ ] Click "Create Database"
  - [ ] Database name: `role_directory_dev`
  - [ ] Owner: default (or create separate role if needed)
  - [ ] Create database
  - [ ] Copy connection string from "Connection Details"
  - [ ] Verify format: `postgresql://user:password@ep-xxx-xxx.region.neon.tech/role_directory_dev?sslmode=require`

- [ ] Task 4: Create staging database (AC: role_directory_stg database exists)
  - [ ] In Neon Console, same project
  - [ ] Click "Create Database"
  - [ ] Database name: `role_directory_stg`
  - [ ] Owner: default
  - [ ] Create database
  - [ ] Copy connection string
  - [ ] Note: Uses same Neon project, different database name

- [ ] Task 5: Create production database (AC: role_directory_prd database exists)
  - [ ] In Neon Console, same project
  - [ ] Click "Create Database"
  - [ ] Database name: `role_directory_prd`
  - [ ] Owner: default
  - [ ] Create database
  - [ ] Copy connection string
  - [ ] Note: Production data will be isolated from dev/staging

- [ ] Task 6: Test database connections locally (AC: Can connect via psql)
  - [ ] Install PostgreSQL client if not already installed:
    - macOS: `brew install postgresql`
    - Ubuntu: `sudo apt-get install postgresql-client`
    - Windows: Download from postgresql.org
  - [ ] Test dev connection: `psql "postgresql://user:password@ep-xxx.neon.tech/role_directory_dev?sslmode=require"`
  - [ ] Verify connection: Run `\conninfo` to see connection details
  - [ ] Run test query: `SELECT version();`
  - [ ] Verify SSL: Should show "SSL connection" in conninfo output
  - [ ] Repeat for staging and production databases
  - [ ] Expected: All three connections succeed, SSL enabled

- [ ] Task 7: Store connection strings in Google Secret Manager (AC: Secrets created)
  - [ ] Set GCP project: `gcloud config set project <PROJECT_ID>`
  - [ ] Create dev secret:
    ```bash
    echo "postgresql://user:password@ep-xxx.neon.tech/role_directory_dev?sslmode=require" | \
      gcloud secrets create dev-database-url --data-file=-
    ```
  - [ ] Create staging secret:
    ```bash
    echo "postgresql://user:password@ep-xxx.neon.tech/role_directory_stg?sslmode=require" | \
      gcloud secrets create staging-database-url --data-file=-
    ```
  - [ ] Create production secret:
    ```bash
    echo "postgresql://user:password@ep-xxx.neon.tech/role_directory_prd?sslmode=require" | \
      gcloud secrets create production-database-url --data-file=-
    ```
  - [ ] Verify secrets created: `gcloud secrets list | grep database-url`

- [ ] Task 8: Grant Cloud Run service account access to secrets (AC: Service accounts have secretAccessor role)
  - [ ] Get service account email: `gcloud projects describe <PROJECT_ID> --format="value(projectNumber)"`
  - [ ] Service account format: `<PROJECT_NUMBER>-compute@developer.gserviceaccount.com`
  - [ ] Grant dev secret access:
    ```bash
    gcloud secrets add-iam-policy-binding dev-database-url \
      --member="serviceAccount:<PROJECT_NUMBER>-compute@developer.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor"
    ```
  - [ ] Grant staging secret access:
    ```bash
    gcloud secrets add-iam-policy-binding staging-database-url \
      --member="serviceAccount:<PROJECT_NUMBER>-compute@developer.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor"
    ```
  - [ ] Grant production secret access:
    ```bash
    gcloud secrets add-iam-policy-binding production-database-url \
      --member="serviceAccount:<PROJECT_NUMBER>-compute@developer.gserviceaccount.com" \
      --role="roles/secretmanager.secretAccessor"
    ```
  - [ ] Verify IAM bindings: `gcloud secrets get-iam-policy dev-database-url`

- [ ] Task 9: Configure Cloud Run services with database secrets (AC: DATABASE_URL env var set)
  - [ ] Update dev Cloud Run service:
    ```bash
    gcloud run services update role-directory-dev \
      --region=us-central1 \
      --set-secrets=DATABASE_URL=dev-database-url:latest
    ```
  - [ ] Update staging Cloud Run service:
    ```bash
    gcloud run services update role-directory-staging \
      --region=us-central1 \
      --set-secrets=DATABASE_URL=staging-database-url:latest
    ```
  - [ ] Update production Cloud Run service:
    ```bash
    gcloud run services update role-directory-production \
      --region=us-central1 \
      --set-secrets=DATABASE_URL=production-database-url:latest
    ```
  - [ ] Verify: `gcloud run services describe role-directory-dev --format="value(spec.template.spec.containers[0].env)"`

- [ ] Task 10: Document Neon setup process (AC: Documentation created)
  - [ ] Create file: `docs/guides/neon-infrastructure-setup-guide.md`
  - [ ] Document Neon account creation steps
  - [ ] Document project and database creation
  - [ ] Document connection string format and components
  - [ ] Document Google Secret Manager commands
  - [ ] Document Cloud Run secret injection
  - [ ] Add troubleshooting section (connection issues, SSL errors)
  - [ ] Add references to Neon documentation
  - [ ] Link from main README if appropriate

- [ ] Task 11: Create .env.example for local development (AC: Local dev setup documented)
  - [ ] Create or update `.env.example` file
  - [ ] Add: `DATABASE_URL=postgresql://user:password@host:5432/role_directory_dev?sslmode=require`
  - [ ] Add comment: `# Copy to .env.local and replace with your Neon dev database connection string`
  - [ ] Add to .gitignore if not already: `.env.local`
  - [ ] Document in README: How to set up local environment with Neon database
  - [ ] Note: Never commit actual DATABASE_URL to git

## Dev Notes

### Technical Context

**Architecture References:**
- **Epic 2 Tech Spec**: Neon PostgreSQL setup requirements
- **PRD NFR-3**: Security - database credentials in Secret Manager
- **Architecture Decision**: Neon PostgreSQL 17.0 (serverless, auto-suspend)

**Key Implementation Details:**

1. **Neon Account and Project:**
   - **Free Tier Limits**:
     - 1 project per account
     - Unlimited databases per project
     - 0.5 GB storage (shared across databases)
     - ~100 compute hours per month
     - Auto-suspend after 5 minutes of inactivity (saves compute)
   - **Project Structure**:
     - Single project: `role-directory`
     - Three databases: `role_directory_dev`, `role_directory_stg`, `role_directory_prd`
     - All databases share same compute resources (auto-scaled)

2. **Connection String Format:**
   ```
   postgresql://[user]:[password]@[endpoint].[region].neon.tech/[database]?sslmode=require
   
   Example:
   postgresql://daniel_admin:abc123xyz456@ep-cool-tree-12345678.us-east-2.neon.tech/role_directory_dev?sslmode=require
   
   Components:
   - user: Database user (auto-created by Neon)
   - password: Random password (shown once, save immediately)
   - endpoint: Unique endpoint ID (ep-xxx)
   - region: Neon region (us-east-2, us-west-2, eu-central-1, etc.)
   - database: Database name
   - sslmode=require: Force SSL/TLS encryption
   ```

3. **Google Secret Manager Structure:**
   ```
   Project: role-directory-project (GCP)
   
   Secrets:
   - dev-database-url (contains Neon dev connection string)
   - staging-database-url (contains Neon staging connection string)
   - production-database-url (contains Neon production connection string)
   
   IAM Permissions:
   - Cloud Run service account: roles/secretmanager.secretAccessor (read-only)
   ```

4. **Cloud Run Secret Injection:**
   ```yaml
   # Cloud Run service configuration
   spec:
     template:
       spec:
         containers:
           - env:
               - name: DATABASE_URL
                 valueFrom:
                   secretKeyRef:
                     name: dev-database-url
                     key: latest
   ```

5. **Neon Auto-Suspend Behavior:**
   - Database suspends after 5 minutes of no queries (free tier)
   - First query after suspend: ~2-3 second resume time ("cold start")
   - Subsequent queries: <50ms (while database is active)
   - HTTP-based driver (`@neondatabase/serverless`) handles this transparently
   - No connection pooling needed (HTTP protocol is stateless)

6. **Security Best Practices:**
   - ✅ Never commit DATABASE_URL to git
   - ✅ Use SSL/TLS for all connections (`sslmode=require`)
   - ✅ Store credentials in Google Secret Manager (encrypted at rest)
   - ✅ Grant minimal IAM permissions (secretAccessor only, not admin)
   - ✅ Use separate databases for dev/staging/production (data isolation)
   - ✅ Use .env.local for local development (gitignored)

7. **Testing Connections:**
   ```bash
   # Test dev database
   psql "postgresql://user:pass@ep-xxx.neon.tech/role_directory_dev?sslmode=require"
   
   # Verify SSL connection
   \conninfo
   # Output should show: "SSL connection (protocol: TLSv1.3, ...)"
   
   # Run test query
   SELECT version();
   # Output: PostgreSQL 17.0 on x86_64-pc-linux-gnu, compiled by gcc (...)
   
   # List databases
   \l
   
   # Exit
   \q
   ```

8. **Cost Implications:**
   - **Neon Free Tier**: $0/month
     - 0.5 GB storage (sufficient for MVP)
     - ~100 compute hours/month (sufficient with auto-suspend)
     - Unlimited databases (3 used: dev, stg, prd)
   - **Google Secret Manager**: $0.06/secret/month after 6 free secrets
     - 3 secrets used: dev, staging, production
     - Still within free tier (6 secrets free)
   - **Total Cost**: $0/month for MVP

### Project Structure Notes

**Files Created/Modified:**
```
role-directory/
├── .env.example                 # NEW: Local development environment template
├── .gitignore                   # MODIFIED: Ensure .env.local is ignored
├── docs/
│   └── guides/
│       └── neon-infrastructure-setup-guide.md  # NEW: Neon setup documentation
└── README.md                    # MODIFIED: Link to Neon setup guide
```

**External Resources Created:**
- Neon account and project
- Three Neon databases (dev, stg, prd)
- Three Google Secret Manager secrets (dev, staging, production)
- IAM bindings for Cloud Run service account

### Testing Standards Summary

**For This Story:**
- **Manual Testing**: Verify database setup and connections
- **Verification Steps**:
  1. Verify Neon account created successfully
  2. Verify Neon project `role-directory` exists
  3. Verify three databases created: `role_directory_dev`, `role_directory_stg`, `role_directory_prd`
  4. Test connection to dev database via psql
  5. Test connection to staging database via psql
  6. Test connection to production database via psql
  7. Verify SSL connection active (`\conninfo` shows SSL)
  8. Run test query: `SELECT version();` (should return PostgreSQL 17.0)
  9. Verify secrets created in Google Secret Manager: `gcloud secrets list`
  10. Verify IAM bindings: `gcloud secrets get-iam-policy dev-database-url`
  11. Verify Cloud Run services have DATABASE_URL env var from secrets
  12. Test Cloud Run service can access database (wait for Story 2.2)
  13. Verify documentation is complete and accurate

**Expected Results:**
- All three Neon databases accessible via psql
- SSL/TLS encryption enabled (sslmode=require works)
- Connection strings stored in Google Secret Manager (not in code)
- Cloud Run service accounts have secretAccessor role
- DATABASE_URL environment variable injected into Cloud Run services
- Documentation covers setup, configuration, and troubleshooting
- .env.example provides template for local development

### Constraints and Patterns

**MUST Follow:**
1. **Never Commit Credentials** (PRD NFR-3):
   - DATABASE_URL must NEVER be in git
   - Use .env.local for local development (gitignored)
   - Store credentials in Google Secret Manager only

2. **SSL/TLS Required** (architecture.md):
   - All connection strings must include `?sslmode=require`
   - Verify SSL connection active after connecting
   - Reject connections without SSL

3. **Environment Isolation** (architecture.md):
   - Separate databases for dev, staging, production
   - No shared data between environments
   - Different connection strings for each environment

4. **Least Privilege IAM** (PRD NFR-3):
   - Cloud Run service account has only secretAccessor role
   - Not secretmanager.admin or broader permissions
   - Each service accesses only its corresponding secret

5. **Documentation Required** (architecture.md):
   - Document Neon setup steps with examples
   - Document Secret Manager commands
   - Document troubleshooting common issues
   - Link from main README

### References

- [Source: docs/2-planning/epics.md#Story-2.1] - Story definition and acceptance criteria
- [Source: docs/tech-spec-epic-2.md#Neon-Setup] - Technical specification for Neon setup
- [Source: docs/2-planning/PRD.md#NFR-3] - Security requirements for credential management
- [Source: docs/3-solutioning/architecture.md#Database] - Database technology decision
- [Source: Neon Documentation] - https://neon.tech/docs/
- [Source: Google Secret Manager Docs] - https://cloud.google.com/secret-manager/docs

### Learnings from Previous Story

**From Epic 1 (Status: Stories 1-11 drafted):**
- Cloud Run services exist: `role-directory-dev`, `role-directory-staging`, `role-directory-production`
- Google Cloud project configured with Secret Manager API enabled
- gcloud CLI authenticated and configured locally
- Documentation patterns established (docs/guides/ directory)

**Expected Dependencies from Previous Stories:**
- ✅ Story 1.1 (done): Project structure exists
- ✅ Story 1.4 (review): Dev Cloud Run service exists
- ✅ Story 1.7 (ready-for-dev): Staging Cloud Run service will exist
- ✅ Story 1.8 (drafted): Production Cloud Run service will exist

**Assumptions:**
- Developer has access to create Neon account (email address)
- Developer has access to GCP project with Secret Manager API enabled
- Developer has gcloud CLI installed and authenticated
- Developer has PostgreSQL client (psql) installed for testing
- Cloud Run services exist or will exist soon (Story 1.4+)

**Important Notes:**
- This is an **infrastructure setup story** (no application code changes)
- Can be done **in parallel with Epic 1 completion** (no code dependencies)
- Database connection **will not be used until Story 2.2** (connection module)
- Free tier limitations acceptable for MVP (0.5 GB storage, auto-suspend)
- Auto-suspend behavior is **expected and acceptable** (2-3s cold start)
- If free tier limits are exceeded, upgrade to Neon paid tier (~$19/month for always-on compute)

## Dev Agent Record

### Context Reference

- `docs/stories/2-1-neon-postgresql-account-and-database-setup.context.xml` - Generated 2025-11-07

### Agent Model Used

<!-- Fill in when implementing: e.g., Claude Sonnet 4.5 -->

### Debug Log References

<!-- Add links to debug logs or issues encountered during implementation -->

### Completion Notes List

<!-- Dev agent fills in after completing story:
- New patterns/services created
- Architectural deviations or decisions made
- Technical debt deferred to future stories
- Warnings or recommendations for next story
- Interfaces/methods created for reuse
-->

### File List

<!-- Dev agent fills in after completing story:
Format: [STATUS] path/to/file.ext
- NEW: file created
- MODIFIED: file changed
- DELETED: file removed
-->

## Change Log

| Date | Author | Changes |
|------|--------|---------|
| 2025-11-06 | danielvm (SM - Bob) | Initial story creation from epics.md |


