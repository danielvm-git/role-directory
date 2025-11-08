# Success Criteria

**Primary Success: Infrastructure Validation**

✅ **Deployment Pipeline Confidence**
- GitHub Actions successfully builds, tests, and deploys on every commit
- Dev environment auto-deploys from `main` branch without manual intervention
- Staging promotion works smoothly (manual gate validated)
- Production promotion works smoothly (manual gate validated)
- Rollback procedures understood and tested

✅ **Cloud Run Validation**
- Application starts successfully in Cloud Run environment
- Cold starts are acceptable (<5 seconds for first request)
- Environment variables and secrets inject correctly
- Logging and error reporting work as expected
- Container size optimized (<500MB if possible)

✅ **Database Connectivity**
- PostgreSQL connection succeeds from Cloud Run
- Connection pooling handles serverless constraints (frequent cold starts)
- Queries execute with acceptable latency (<200ms for simple queries)
- Database migrations can be run safely
- Connection secrets managed securely

✅ **Session Management in Serverless**
- Server-side sessions work correctly across Cloud Run instances
- Session persistence survives container restarts
- 24-hour expiry enforced reliably
- No session leakage or security issues

**Secondary Success: Collaboration Enablement**

✅ **Access Control Functions**
- Valid invitation codes grant 24-hour access
- Expired codes properly rejected with clear messaging
- Multiple users can share the same code (reusable codes work)
- Admin can generate new codes easily

✅ **Functional Validation**
- Collaborators can view Hello World page with database data (proves full stack)
- Collaborators can view workflow status YAML (proves file system access)
- Collaborators can view sprint status YAML (when it exists)
- UI is functional, not necessarily beautiful

**Definition of Done**

The MVP is complete when **one complete feature flows successfully through all three environments**:

1. Code committed to `main` branch
2. CI/CD pipeline runs (lint, test, build)
3. Auto-deploys to Dev environment
4. Manually promoted to Staging
5. Validated in Staging
6. Manually promoted to Production
7. Feature works correctly in Production

**Specific Thresholds:**

- **Cold Start Performance**: <5 seconds acceptable for first request (serverless constraint understood)
- **Query Performance**: <200ms for simple database queries (SELECT with basic WHERE clause)
- **Database Strategy**: Separate databases per environment (dev, stg, prd) to validate migrations independently
- **Migration Strategy**: Manual migration step before deployment (safer for initial validation)
- **Rollback Strategy**: Manual rollback sufficient (via Cloud Run revision management)

**Metrics That Don't Matter (Yet)**

❌ User engagement or retention (this isn't production yet)  
❌ SEO or discoverability (access is invitation-only)  
❌ Performance beyond "acceptable" (no scale requirements)  
❌ Feature completeness (role/pricing features explicitly deferred)  
❌ Uptime SLAs or high availability (not mission-critical during validation)

---
