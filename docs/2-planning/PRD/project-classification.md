# Project Classification

**Technical Type:** Web Application (Next.js SPA with App Router)  
**Domain:** General Software  
**Complexity:** Low-Medium (infrastructure focus, standard web patterns)

**Classification Details:**

- **Architecture**: Server-side rendered React application with API routes
- **Deployment Model**: Containerized (Docker) → Cloud Run (serverless)
- **Database**: PostgreSQL with connection pooling (cloud-optimized)
- **Authentication**: Custom session-based (invitation codes + server-side sessions)
- **CI/CD**: GitHub Actions with multi-environment promotion workflow
- **Scale**: Low traffic expected during MVP (proof-of-concept usage)

**Infrastructure-First Approach:**

This project inverts the typical development flow. Rather than building features and figuring out deployment later, we're **building just enough features to thoroughly validate deployment infrastructure**. Each capability tests a different infrastructure concern:

- Invitation codes → Session management in serverless environment
- Admin interface → Protected routes and authorization patterns
- Dashboard pages → Database queries and file system access
- Three environments → CI/CD pipeline and promotion workflows
- Docker deployment → Container optimization and Cloud Run specifics

---
