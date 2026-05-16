# BMAD-CPS Integration Guide: Complete Workflow
## Using BMAD Workflows with CI&T Production System Methodology

**Version:** 1.0  
**Date:** November 2025  
**CPS Coverage:** 92% using existing BMAD workflows

---

## Table of Contents

1. [Introduction](#introduction)
2. [Overview and Mapping](#overview-and-mapping)
3. [Setup Phase (Chats 1-9)](#setup-phase-chats-1-9)
4. [Sprint Planning (Chats 10-11)](#sprint-planning-chats-10-11)
5. [Epic 1: Production Flow (Chats 12-38)](#epic-1-production-flow-chats-12-38)
6. [Epic 1: Completion (Chats 39-40)](#epic-1-completion-chats-39-40)
7. [Epic 2: Production Flow (Chats 41-77)](#epic-2-production-flow-chats-41-77)
8. [Epic 2: Completion (Chats 78-79)](#epic-2-completion-chats-78-79)
9. [Workflow Comparison: Complete vs Optimized](#workflow-comparison-complete-vs-optimized)
10. [Complete Workflow Checklist](#complete-workflow-checklist)
11. [Summary Statistics](#summary-statistics)
12. [Quick Reference](#quick-reference)

---

## Introduction

This guide demonstrates how to implement a complete software development project using BMAD (BMad Method) workflows aligned with the CI&T Production System (CPS) methodology. The workflow covers the entire lifecycle from project initialization through completion of two epics.

**Project Scope:**
- **Epic 1:** 3 stories (e.g., User Management)
- **Epic 2:** 4 stories (e.g., Content System)
- **Total Stories:** 7 stories
- **Total Chats:** 79 chats (complete version) or 52 chats (optimized version)

**Key Principles:**
- **One Piece Flow** (CPS Ch. 26): One story at a time
- **Burn Quality In** (CPS Ch. 27): Tests before implementation (ATDD)
- **Continuous Homologation** (CPS Ch. 28): CI/CD and validation gates
- **Continuous Improvement** (CPS Ch. 25): Regular retrospectives

---

## Overview and Mapping

### CPS Phase → BMAD Workflow Mapping

| CPS Phase | CPS Chapters | BMAD Workflows | Coverage |
|-----------|--------------|----------------|----------|
| **Setup** | 4-13 | init, brief, prd, epics, architecture, framework | 90% |
| **Production Flow** | 14-30 | sprint-planning, atdd, dev-story, ci, trace | 92% |
| **Value Activation** | 31-37 | nfr-assess, trace, retrospective | 85% |

### Workflow Categories

**Setup & Planning:**
- Project initialization
- Requirements definition
- Architecture design
- Test framework setup

**Development Cycle (per story):**
- Story creation and refinement
- Test-Driven Development (ATDD)
- Implementation
- Quality gates

**Governance:**
- Sprint planning and retrospectives
- Traceability and quality gates
- Continuous improvement

---

## Setup Phase (Chats 1-9)

### Chat 1: Project Initialization
**CPS Mapping:** Ch. 4 (Develop Vision) + Ch. 5 (Plan Setup)

```bash
@bmad/bmm/agents/analyst
```

**Command:** `*workflow-init`

**What it does:**
- Gathers project vision and goals
- Determines project complexity level (0-4)
- Selects planning track (Quick/BMad Method/Enterprise)
- Creates initial workflow status file

**Outputs:**
- `docs/bmm-workflow-status.yaml` - Project tracking file

**Key Decisions:**
- Project Level: 3 (Medium-Complex)
- Track: BMad Method (full planning)

---

### Chat 2: Product Brief
**CPS Mapping:** Ch. 4 (Develop Vision)

```bash
@bmad/bmm/agents/analyst
```

**Command:** `*product-brief`

**What it does:**
- Defines product vision and value proposition
- Identifies target users and stakeholders
- Documents business objectives
- Establishes success criteria

**Outputs:**
- `docs/product-brief-{project-name}-{date}.md`

**Key Sections:**
- Vision statement
- Target audience
- Business objectives
- Success metrics
- Assumptions and constraints

---

### Chat 3: Product Requirements Document (PRD)
**CPS Mapping:** Ch. 10 (Develop Product Backlog)

```bash
@bmad/bmm/agents/pm
```

**Command:** `*create-prd`

**What it does:**
- Creates comprehensive requirements document
- Defines functional and non-functional requirements
- Establishes quality attributes
- Documents constraints and dependencies

**Outputs:**
- `docs/PRD.md`

**Key Sections:**
- Functional Requirements (FRs)
- Non-Functional Requirements (NFRs)
- User personas
- Use cases
- Technical constraints
- Success criteria

---

### Chat 4: Epic and Story Breakdown
**CPS Mapping:** Ch. 10 (Develop Product Backlog)

```bash
@bmad/bmm/agents/pm
```

**Command:** `*create-epics`

**What it does:**
- Breaks down PRD into epics
- Creates user stories per epic
- Defines acceptance criteria
- Estimates complexity (BCP points)

**Outputs:**
- `docs/epics.md`

**Example Structure:**
```
Epic 1: User Management (3 stories)
├─ Story 1-1: User Authentication
├─ Story 1-2: User Registration
└─ Story 1-3: Password Recovery

Epic 2: Content System (4 stories)
├─ Story 2-1: Create Content
├─ Story 2-2: Edit Content
├─ Story 2-3: Delete Content
└─ Story 2-4: Content Search
```

---

### Chat 5: UX Design Specification (Optional)
**CPS Mapping:** Ch. 11 (Model Business Processes)

```bash
@bmad/bmm/agents/ux-designer
```

**Command:** `*create-ux-design`

**What it does:**
- Creates UX specifications
- Designs user flows and wireframes
- Establishes design system
- Documents interaction patterns

**Outputs:**
- `docs/ux-design-specification.md`
- `docs/ux-color-themes.html` (visual preview)
- `docs/ux-design-directions.html` (design options)

**Note:** Optional for projects without significant UX requirements

---

### Chat 6: Architecture Design
**CPS Mapping:** Ch. 14 (Develop Architecture Package)

```bash
@bmad/bmm/agents/architect
```

**Command:** `*create-architecture`

**What it does:**
- Designs technical architecture
- Makes technology decisions
- Documents architectural patterns
- Establishes technical standards

**Outputs:**
- `docs/architecture.md`

**Key Sections:**
- System overview and context
- Architectural decisions (ADRs)
- Technology stack
- Data architecture
- Security architecture
- Deployment architecture
- Implementation patterns

---

### Chat 7: Architecture Validation
**CPS Mapping:** Ch. 14 (Develop Architecture Package - Validation)

```bash
@bmad/bmm/agents/architect
```

**Command:** `*validate-architecture`

**What it does:**
- Reviews architecture document completeness
- Validates against checklist
- Identifies gaps or concerns
- Provides recommendations

**Outputs:**
- Validation report (inline)
- List of issues to address (if any)

---

### Chat 8: Solutioning Gate Check
**CPS Mapping:** Ch. 13 (Evaluate Inputs and Forward Actions)

```bash
@bmad/bmm/agents/architect
```

**Command:** `*solutioning-gate-check`

**What it does:**
- Validates Phase 3 completion
- Checks all required artifacts exist
- Assesses readiness for implementation
- Provides go/no-go decision

**Validates:**
- PRD complete and approved
- Epics and stories defined
- Architecture documented
- Technical approach validated

**Decision:** PASS / CONCERNS / FAIL

---

### Chat 9: Test Framework Setup
**CPS Mapping:** Ch. 15 (Install Technical Capacity) + Ch. 27 (Burn Quality In)

```bash
@bmad/bmm/agents/tea
```

**Command:** `*framework`

**What it does:**
- Scaffolds test framework (Playwright or Cypress)
- Creates test directory structure
- Configures fixtures and factories
- Generates sample tests
- Sets up CI/CD integration

**Outputs:**
- `playwright.config.ts` or `cypress.config.ts`
- `tests/e2e/` directory structure
- `tests/support/fixtures/` - Test fixtures
- `tests/support/helpers/` - Utility functions
- `tests/README.md` - Setup documentation
- `.env.example` - Environment configuration

**Directory Structure:**
```
tests/
├── e2e/                    # E2E test files
├── support/
│   ├── fixtures/           # Test fixtures
│   ├── helpers/            # Helper functions
│   └── page-objects/       # Page objects (optional)
└── README.md
```

---

## Sprint Planning (Chats 10-11)

### Chat 10: Sprint Planning
**CPS Mapping:** Ch. 16 (Backlog Refinement) + Ch. 18 (Plan Delivery Capacity)

```bash
@bmad/bmm/agents/sm
```

**Command:** `*sprint-planning`

**What it does:**
- Extracts all stories from epics.md
- Creates sprint status tracking file
- Initializes story status (backlog)
- Sets up story directory structure

**Outputs:**
- `docs/sprint-status.yaml` - Story tracking
- `docs/stories/` directory created

**Sprint Status Structure:**
```yaml
project_name: "My Project"
sprint_number: 1
sprint_goal: "User Management Foundation"
stories:
  - id: "1-1"
    title: "User Authentication"
    status: "backlog"
    epic: 1
  - id: "1-2"
    title: "User Registration"
    status: "backlog"
    epic: 1
  # ... more stories
```

---

### Chat 11: Epic 1 Tech Context
**CPS Mapping:** Ch. 14 (Architecture Package - Epic Level)

```bash
@bmad/bmm/agents/architect
```

**Command:** `*epic-tech-context`

**Input:** Epic number: `1`

**What it does:**
- Analyzes Epic 1 technical requirements
- Identifies shared patterns and conventions
- Documents technical approach for epic
- Lists relevant architecture sections

**Outputs:**
- `docs/epic-1-tech-context.md`

**Key Sections:**
- Epic overview
- Technical approach
- Shared patterns
- Code conventions
- Files/modules involved
- Dependencies
- Testing strategy

---

## Epic 1: Production Flow (Chats 12-38)

### Story 1-1: User Authentication (Chats 12-20)

#### Chat 12: Create Story
**CPS Mapping:** Ch. 10 (Develop Backlog) + Ch. 26 (One Piece Flow)

```bash
@bmad/bmm/agents/sm
```

**Command:** `*create-story`

**Input:** Story ID: `1-1`

**What it does:**
- Expands story from epics.md into detailed file
- Adds comprehensive acceptance criteria
- Breaks down into tasks/subtasks
- Establishes Definition of Done
- Updates sprint-status.yaml

**Outputs:**
- `docs/stories/1-1-user-authentication.md`

**Story Structure:**
```markdown
# Story 1-1: User Authentication

## Description
As a user, I want to log in with email and password...

## Acceptance Criteria
- [ ] User can enter email and password
- [ ] System validates credentials
- [ ] User redirected to dashboard on success
- [ ] Error message shown on invalid credentials
- [ ] Password masking enabled

## Tasks
- [ ] Create login form component
- [ ] Implement authentication API endpoint
- [ ] Add form validation
- [ ] Write unit tests for auth service
- [ ] Write E2E tests

## Technical Notes
- Use JWT tokens for session
- Hash passwords with bcrypt (salt rounds: 10)
- Rate limit: 5 attempts per minute per IP
- Session timeout: 24 hours

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Unit tests passing (>80% coverage)
- [ ] E2E tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
```

---

#### Chat 13: Test Design
**CPS Mapping:** Ch. 24 (Control Quality) + Ch. 27 (Burn Quality In)

```bash
@bmad/bmm/agents/tea
```

**Command:** `*test-design`

**Input:** Story 1-1

**What it does:**
- Analyzes story for testing requirements
- Performs risk assessment (probability × impact)
- Prioritizes test scenarios (P0-P3)
- Plans test coverage strategy
- Identifies test types needed

**Outputs:**
- `docs/test-design-epic-1.md`

**Key Sections:**
```markdown
## Risk Assessment
| Feature | Probability | Impact | Risk Score | Priority |
|---------|-------------|--------|------------|----------|
| Login validation | HIGH | HIGH | 9 | P0 |
| Password masking | MEDIUM | MEDIUM | 4 | P1 |
| Remember me | LOW | LOW | 1 | P2 |

## Test Scenarios (P0 - Critical)
1. Successful login with valid credentials
2. Failed login with invalid password
3. Failed login with non-existent user
4. Rate limiting after 5 failed attempts
5. Session persistence and expiration

## Coverage Strategy
- E2E: Critical paths (login success/failure)
- API: Authentication endpoint validation
- Unit: Password hashing, token generation
- Component: Login form validation
```

---

#### Chat 14: ATDD - Tests First
**CPS Mapping:** Ch. 27 (Burn Quality In) - CORE PRINCIPLE

```bash
@bmad/bmm/agents/tea
```

**Command:** `*atdd`

**Input:** Story 1-1

**What it does:**
- Generates E2E tests BEFORE implementation (RED phase)
- Creates test fixtures and factories
- Maps acceptance criteria to test cases
- Creates ATDD checklist

**Outputs:**
- `tests/e2e/auth/login.spec.ts` (FAILING ❌)
- `tests/support/fixtures/user-factory.ts`
- `docs/atdd-checklist-1-1.md`

**Example Test (FAILING):**
```typescript
import { test, expect } from '../support/fixtures';

test.describe('User Authentication (Story 1-1)', () => {
  test('should allow user to login with valid credentials', async ({ page, userFactory }) => {
    // Arrange - Create test user
    const user = await userFactory.createUser({
      email: 'test@example.com',
      password: 'SecurePass123!'
    });

    // Act - Perform login
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="login-button"]');

    // Assert - Verify success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error with invalid password', async ({ page, userFactory }) => {
    const user = await userFactory.createUser();
    
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', user.email);
    await page.fill('[data-testid="password-input"]', 'WrongPassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Invalid credentials');
  });

  // ... more tests for all acceptance criteria
});
```

**Status:** All tests FAILING ❌ (no implementation yet)

**ATDD Checklist:**
- [ ] E2E tests written for all acceptance criteria
- [ ] Test fixtures created
- [ ] Factory cleanup implemented
- [ ] Tests run and fail appropriately
- [ ] Ready for implementation (RED phase complete)

---

#### Chat 15: Story Context
**CPS Mapping:** Ch. 26 (One Piece Flow)

```bash
@bmad/bmm/agents/architect
```

**Command:** `*story-context`

**Input:** Story 1-1

**What it does:**
- Analyzes story technical requirements
- Identifies files to create/modify
- Lists relevant patterns from architecture
- Provides just-in-time technical guidance
- Creates context file for DEV agent

**Outputs:**
- `docs/stories/1-1-user-authentication.context.xml`

**Context File Structure:**
```xml
<story-context id="1-1" title="User Authentication">
  <epic-context ref="docs/epic-1-tech-context.md" />
  <architecture ref="docs/architecture.md" />
  
  <files-to-modify>
    <file path="src/components/LoginForm.tsx" action="create">
      Login form component with validation
    </file>
    <file path="src/api/auth.ts" action="create">
      Authentication API endpoints
    </file>
    <file path="src/services/authService.ts" action="create">
      Authentication business logic
    </file>
    <file path="src/utils/tokenManager.ts" action="create">
      JWT token handling
    </file>
  </files-to-modify>
  
  <patterns>
    <pattern name="Authentication Flow">
      Use JWT tokens stored in httpOnly cookies
      Implement refresh token rotation
      Handle token expiration gracefully
    </pattern>
    <pattern name="Form Validation">
      Use Zod for schema validation
      Client-side + server-side validation
      Clear error messages
    </pattern>
  </patterns>
  
  <dependencies>
    <dependency>bcrypt - password hashing</dependency>
    <dependency>jsonwebtoken - JWT generation</dependency>
    <dependency>zod - validation schemas</dependency>
  </dependencies>
  
  <testing-notes>
    E2E tests already created in tests/e2e/auth/
    Ensure implementation makes tests pass
  </testing-notes>
</story-context>
```

---

#### Chat 16: Story Ready
**CPS Mapping:** Ch. 26 (One Piece Flow - Ready State)

```bash
@bmad/bmm/agents/sm
```

**Command:** `*story-ready`

**Input:** Story 1-1

**What it does:**
- Validates story has context file
- Validates tests exist (ATDD)
- Checks Definition of Done is clear
- Moves story status: `drafted` → `ready`
- Updates sprint-status.yaml

**Validation Checks:**
- ✅ Story file exists and complete
- ✅ Context file created
- ✅ ATDD tests exist (failing)
- ✅ Test design completed
- ✅ Acceptance criteria clear
- ✅ Technical approach documented

**Output:** Story 1-1 status → `ready`

---

#### Chat 17: Develop Story (IMPLEMENTATION)
**CPS Mapping:** Ch. 26 (One Piece Flow) - CORE WORKFLOW

```bash
@bmad/bmm/agents/dev
```

**Command:** `*dev-story`

**Input:** Story 1-1

**What it does:**
1. Loads story file
2. Loads context.xml
3. Loads epic-tech-context.md
4. Implements code to satisfy acceptance criteria
5. Runs tests (should now pass ✅)
6. Validates all acceptance criteria
7. Updates story file with completion notes

**Implementation Flow:**
1. Create LoginForm component
2. Implement auth API endpoint
3. Create authService with bcrypt
4. Implement JWT token management
5. Add form validation with Zod
6. Run E2E tests → should PASS ✅
7. Run unit tests → should PASS ✅

**Outputs:**
- Implemented code files:
  - `src/components/LoginForm.tsx`
  - `src/api/auth.ts`
  - `src/services/authService.ts`
  - `src/utils/tokenManager.ts`
- Updated story file with implementation notes
- All tests PASSING ✅

**Test Status Change:**
- BEFORE: Tests FAILING ❌ (RED phase)
- AFTER: Tests PASSING ✅ (GREEN phase)

**Story Status:** `ready` → `in-progress` → implementation complete

---

#### Chat 18: Test Review
**CPS Mapping:** Ch. 24 (Control Quality)

```bash
@bmad/bmm/agents/tea
```

**Command:** `*test-review`

**Input:** Test files for Story 1-1

**What it does:**
- Reviews test quality against best practices
- Validates test isolation
- Checks determinism (no randomness)
- Verifies auto-cleanup (fixtures)
- Validates selector resilience
- Ensures explicit assertions

**Outputs:**
- `docs/test-review-1-1.md`

**Review Criteria:**
```markdown
## Test Quality Assessment - Story 1-1

### Strengths ✅
- Clear test descriptions
- Proper arrange-act-assert structure
- Good use of data-testid selectors
- Auto-cleanup implemented in fixtures

### Areas for Improvement 🔧
- Consider adding negative test for rate limiting
- Add test for session persistence
- Consider edge case: empty form submission

### Best Practices Validation
- [x] Test isolation (no shared state)
- [x] Deterministic (no random data in assertions)
- [x] Explicit assertions
- [x] Auto-cleanup (fixtures)
- [x] < 60s execution time per test
- [x] Selector resilience (data-testid)

### Score: 9/10 (Excellent)
```

---

#### Chat 19: Code Review
**CPS Mapping:** Ch. 24 (Control Quality)

```bash
@bmad/bmm/agents/dev
```

**Command:** `*code-review`

**Input:** Story 1-1

**What it does:**
- Reviews implementation code quality
- Validates against architecture patterns
- Checks error handling
- Reviews security practices
- Validates test coverage

**Outputs:**
- Code review feedback (inline)
- `docs/code-review-1-1.md`

**Review Checklist:**
```markdown
## Code Review - Story 1-1: User Authentication

### Architecture Compliance ✅
- [x] Follows component structure from architecture.md
- [x] Uses established patterns (JWT, bcrypt)
- [x] Proper separation of concerns

### Code Quality ✅
- [x] TypeScript types properly defined
- [x] Error handling implemented
- [x] Input validation (client + server)
- [x] No console.logs in production code

### Security ✅
- [x] Passwords hashed with bcrypt (salt rounds: 10)
- [x] JWT secrets from environment variables
- [x] Rate limiting implemented
- [x] No sensitive data in logs

### Testing ✅
- [x] Unit test coverage > 80%
- [x] E2E tests covering critical paths
- [x] Edge cases tested

### Issues Found
None

### Approval Status: APPROVED ✅
```

---

#### Chat 20: Story Done
**CPS Mapping:** Ch. 26 (One Piece Flow - Complete)

```bash
@bmad/bmm/agents/sm
```

**Command:** `*story-done`

**Input:** Story 1-1

**What it does:**
- Validates all acceptance criteria met
- Confirms tests passing
- Checks code review approved
- Moves story status: `in-progress` → `done`
- Updates sprint-status.yaml
- Archives story as complete

**Final Validation:**
- ✅ All acceptance criteria checked
- ✅ Tests passing (unit + E2E)
- ✅ Code reviewed and approved
- ✅ Test review completed
- ✅ Documentation updated
- ✅ Definition of Done satisfied

**Output:** Story 1-1 → `done` ✅

---

### Story 1-2: User Registration (Chats 21-29)

#### Chat 21: Create Story
```bash
@bmad/bmm/agents/sm
*create-story
```
**Input:** Story 1-2
**Output:** `docs/stories/1-2-user-registration.md`

---

#### Chat 22: Test Design
```bash
@bmad/bmm/agents/tea
*test-design
```
**Input:** Story 1-2
**Output:** Test design for registration

---

#### Chat 23: ATDD
```bash
@bmad/bmm/agents/tea
*atdd
```
**Input:** Story 1-2
**Output:** `tests/e2e/auth/registration.spec.ts` (FAILING ❌)

---

#### Chat 24: Story Context
```bash
@bmad/bmm/agents/architect
*story-context
```
**Input:** Story 1-2
**Output:** `docs/stories/1-2-user-registration.context.xml`

---

#### Chat 25: Story Ready
```bash
@bmad/bmm/agents/sm
*story-ready
```
**Input:** Story 1-2
**Status:** `drafted` → `ready`

---

#### Chat 26: Develop Story
```bash
@bmad/bmm/agents/dev
*dev-story
```
**Input:** Story 1-2
**Output:** Implementation + tests PASSING ✅

---

#### Chat 27: Test Review
```bash
@bmad/bmm/agents/tea
*test-review
```
**Input:** Story 1-2 tests
**Output:** `docs/test-review-1-2.md`

---

#### Chat 28: Code Review
```bash
@bmad/bmm/agents/dev
*code-review
```
**Input:** Story 1-2
**Output:** `docs/code-review-1-2.md`

---

#### Chat 29: Story Done
```bash
@bmad/bmm/agents/sm
*story-done
```
**Input:** Story 1-2
**Status:** `in-progress` → `done` ✅

---

### Story 1-3: Password Recovery (Chats 30-38)

#### Chat 30: Create Story
```bash
@bmad/bmm/agents/sm
*create-story
```
**Input:** Story 1-3
**Output:** `docs/stories/1-3-password-recovery.md`

---

#### Chat 31: Test Design
```bash
@bmad/bmm/agents/tea
*test-design
```
**Input:** Story 1-3

---

#### Chat 32: ATDD
```bash
@bmad/bmm/agents/tea
*atdd
```
**Input:** Story 1-3
**Output:** Tests (FAILING ❌)

---

#### Chat 33: Story Context
```bash
@bmad/bmm/agents/architect
*story-context
```
**Input:** Story 1-3

---

#### Chat 34: Story Ready
```bash
@bmad/bmm/agents/sm
*story-ready
```
**Input:** Story 1-3

---

#### Chat 35: Develop Story
```bash
@bmad/bmm/agents/dev
*dev-story
```
**Input:** Story 1-3
**Output:** Tests PASSING ✅

---

#### Chat 36: Test Review
```bash
@bmad/bmm/agents/tea
*test-review
```
**Input:** Story 1-3

---

#### Chat 37: Code Review
```bash
@bmad/bmm/agents/dev
*code-review
```
**Input:** Story 1-3

---

#### Chat 38: Story Done
```bash
@bmad/bmm/agents/sm
*story-done
```
**Input:** Story 1-3
**Status:** `done` ✅

---

## Epic 1: Completion (Chats 39-40)

### Chat 39: Retrospective
**CPS Mapping:** Ch. 25 (Continuous Improvement) + Ch. 30 (Evaluate Inputs)

```bash
@bmad/bmm/agents/sm
```

**Command:** `*retrospective`

**What it does:**
- Reviews Epic 1 completion
- Gathers what went well
- Identifies challenges and blockers
- Creates action items for improvement
- Documents lessons learned

**Outputs:**
- `docs/retrospective-epic-1.md`

**Retrospective Structure:**
```markdown
# Retrospective: Epic 1 - User Management

## Sprint Overview
- Epic: 1 (User Management)
- Stories Completed: 3/3
- Duration: 2 weeks
- Velocity: [story points completed]

## What Went Well ✅
- ATDD approach caught issues early
- Test coverage excellent (>85%)
- Architecture decisions were solid
- Team collaboration effective

## Challenges 🔧
- Initial test setup took longer than expected
- Some dependencies caused delays
- Rate limiting testing was complex

## Action Items
1. Create reusable test fixtures library
2. Document common testing patterns
3. Improve dependency management process
4. Add rate limiting helper utilities

## Metrics
- Code coverage: 87%
- Test pass rate: 100%
- Defects found: 2 (caught in review)
- Technical debt: Low

## Lessons Learned
- ATDD significantly improved code quality
- Early architecture investment paid off
- Regular context updates kept team aligned
```

---

### Chat 40: Traceability & Quality Gate
**CPS Mapping:** Ch. 24 (Control Quality) + Ch. 28 (Continuous Homologation)

```bash
@bmad/bmm/agents/tea
```

**Command:** `*trace`

**Input:** Epic 1

**What it does:**
- Maps requirements → test coverage
- Validates traceability matrix
- Performs quality gate assessment
- Makes gate decision: PASS/CONCERNS/FAIL
- Generates coverage report

**Outputs:**
- `docs/traceability-matrix-epic-1.md`
- `docs/quality-gate-epic-1.yaml`

**Traceability Matrix:**
```markdown
## Epic 1: User Management - Traceability Matrix

| Story | Acceptance Criteria | E2E Tests | Unit Tests | Status |
|-------|-------------------|-----------|------------|--------|
| 1-1 | Login with valid credentials | ✅ | ✅ | PASS |
| 1-1 | Invalid password error | ✅ | ✅ | PASS |
| 1-1 | Rate limiting | ✅ | ✅ | PASS |
| 1-1 | Session persistence | ✅ | ✅ | PASS |
| 1-2 | User registration form | ✅ | ✅ | PASS |
| 1-2 | Email validation | ✅ | ✅ | PASS |
| 1-2 | Duplicate user handling | ✅ | ✅ | PASS |
| 1-3 | Password reset request | ✅ | ✅ | PASS |
| 1-3 | Reset token validation | ✅ | ✅ | PASS |
| 1-3 | New password setting | ✅ | ✅ | PASS |

## Coverage Summary
- Total Criteria: 30
- Covered by E2E: 30 (100%)
- Covered by Unit: 28 (93%)
- Not Covered: 0 (0%)

## Quality Gate Decision

### Criteria Assessment
- ✅ All acceptance tests passing
- ✅ Traceability complete (100%)
- ✅ Code coverage > 80% (87%)
- ✅ NFRs validated
- ✅ No critical defects

### Decision: PASS ✅

Epic 1 is ready for production deployment.
```

**Quality Gate YAML:**
```yaml
epic: 1
decision: PASS
timestamp: "2025-11-07T15:30:00Z"
criteria:
  acceptance_tests_passing: true
  traceability_complete: true
  code_coverage_met: true
  nfr_validated: true
  critical_defects: 0
approved_by: TEA
notes: "Excellent quality. Ready for deployment."
```

---

## Epic 2: Production Flow (Chats 41-77)

### Chat 41: Epic 2 Tech Context
**CPS Mapping:** Ch. 14 (Architecture Package)

```bash
@bmad/bmm/agents/architect
```

**Command:** `*epic-tech-context`

**Input:** Epic number: `2`

**What it does:**
- Analyzes Epic 2 (Content System) requirements
- Documents technical approach
- Identifies patterns and conventions
- Lists relevant architecture sections

**Outputs:**
- `docs/epic-2-tech-context.md`

**Epic 2 Context:**
```markdown
# Epic 2: Content System - Technical Context

## Overview
Epic 2 implements a content management system with CRUD operations and search.

## Technical Approach
- RESTful API design
- PostgreSQL for content storage
- Full-text search with pg_trgm
- Markdown support for rich content
- Media upload to S3
- Content versioning system

## Shared Patterns
- Content validation schema
- Authorization middleware (content ownership)
- Pagination utilities
- Search query builder

## Files/Modules
- src/api/content.ts - CRUD endpoints
- src/services/contentService.ts - Business logic
- src/models/Content.ts - Data model
- src/services/searchService.ts - Search implementation

## Dependencies
- @aws-sdk/client-s3 - Media uploads
- marked - Markdown parsing
- pg - PostgreSQL client

## Testing Strategy
- E2E: Full CRUD workflows
- API: Endpoint validation
- Unit: Search algorithms, validation
```

---

### Story 2-1: Create Content (Chats 42-50)

#### Chat 42: Create Story
```bash
@bmad/bmm/agents/sm
*create-story
```
**Input:** Story 2-1
**Output:** `docs/stories/2-1-create-content.md`

---

#### Chat 43: Test Design
```bash
@bmad/bmm/agents/tea
*test-design
```

---

#### Chat 44: ATDD
```bash
@bmad/bmm/agents/tea
*atdd
```
**Output:** Tests (FAILING ❌)

---

#### Chat 45: Story Context
```bash
@bmad/bmm/agents/architect
*story-context
```

---

#### Chat 46: Story Ready
```bash
@bmad/bmm/agents/sm
*story-ready
```

---

#### Chat 47: Develop Story
```bash
@bmad/bmm/agents/dev
*dev-story
```
**Output:** Tests PASSING ✅

---

#### Chat 48: Test Review
```bash
@bmad/bmm/agents/tea
*test-review
```

---

#### Chat 49: Code Review
```bash
@bmad/bmm/agents/dev
*code-review
```

---

#### Chat 50: Story Done
```bash
@bmad/bmm/agents/sm
*story-done
```
**Status:** `done` ✅

---

### Story 2-2: Edit Content (Chats 51-59)

#### Chat 51: Create Story
```bash
@bmad/bmm/agents/sm
*create-story
```
**Input:** Story 2-2

---

#### Chat 52: Test Design
```bash
@bmad/bmm/agents/tea
*test-design
```

---

#### Chat 53: ATDD
```bash
@bmad/bmm/agents/tea
*atdd
```

---

#### Chat 54: Story Context
```bash
@bmad/bmm/agents/architect
*story-context
```

---

#### Chat 55: Story Ready
```bash
@bmad/bmm/agents/sm
*story-ready
```

---

#### Chat 56: Develop Story
```bash
@bmad/bmm/agents/dev
*dev-story
```

---

#### Chat 57: Test Review
```bash
@bmad/bmm/agents/tea
*test-review
```

---

#### Chat 58: Code Review
```bash
@bmad/bmm/agents/dev
*code-review
```

---

#### Chat 59: Story Done
```bash
@bmad/bmm/agents/sm
*story-done
```
**Status:** `done` ✅

---

### Story 2-3: Delete Content (Chats 60-68)

#### Chat 60: Create Story
```bash
@bmad/bmm/agents/sm
*create-story
```

---

#### Chat 61: Test Design
```bash
@bmad/bmm/agents/tea
*test-design
```

---

#### Chat 62: ATDD
```bash
@bmad/bmm/agents/tea
*atdd
```

---

#### Chat 63: Story Context
```bash
@bmad/bmm/agents/architect
*story-context
```

---

#### Chat 64: Story Ready
```bash
@bmad/bmm/agents/sm
*story-ready
```

---

#### Chat 65: Develop Story
```bash
@bmad/bmm/agents/dev
*dev-story
```

---

#### Chat 66: Test Review
```bash
@bmad/bmm/agents/tea
*test-review
```

---

#### Chat 67: Code Review
```bash
@bmad/bmm/agents/dev
*code-review
```

---

#### Chat 68: Story Done
```bash
@bmad/bmm/agents/sm
*story-done
```
**Status:** `done` ✅

---

### Story 2-4: Content Search (Chats 69-77)

#### Chat 69: Create Story
```bash
@bmad/bmm/agents/sm
*create-story
```

---

#### Chat 70: Test Design
```bash
@bmad/bmm/agents/tea
*test-design
```

---

#### Chat 71: ATDD
```bash
@bmad/bmm/agents/tea
*atdd
```

---

#### Chat 72: Story Context
```bash
@bmad/bmm/agents/architect
*story-context
```

---

#### Chat 73: Story Ready
```bash
@bmad/bmm/agents/sm
*story-ready
```

---

#### Chat 74: Develop Story
```bash
@bmad/bmm/agents/dev
*dev-story
```

---

#### Chat 75: Test Review
```bash
@bmad/bmm/agents/tea
*test-review
```

---

#### Chat 76: Code Review
```bash
@bmad/bmm/agents/dev
*code-review
```

---

#### Chat 77: Story Done
```bash
@bmad/bmm/agents/sm
*story-done
```
**Status:** `done` ✅

---

## Epic 2: Completion (Chats 78-79)

### Chat 78: Retrospective
**CPS Mapping:** Ch. 25 (Continuous Improvement)

```bash
@bmad/bmm/agents/sm
```

**Command:** `*retrospective`

**Outputs:**
- `docs/retrospective-epic-2.md`

**Key Points:**
```markdown
# Retrospective: Epic 2 - Content System

## What Went Well ✅
- Faster story completion (learned from Epic 1)
- Excellent test reuse (fixtures from Epic 1)
- Search implementation exceeded expectations
- Team velocity improved

## Challenges 🔧
- S3 integration required additional testing
- Full-text search edge cases complex
- Content versioning added complexity

## Action Items
1. Document S3 testing patterns
2. Create search testing utilities
3. Consider pagination optimization

## Velocity Improvement
- Epic 1: 3 stories in 2 weeks
- Epic 2: 4 stories in 2 weeks
- Improvement: 33% increase
```

---

### Chat 79: Final Traceability & Quality Gate
**CPS Mapping:** Ch. 24 (Control Quality) + Ch. 28 (Continuous Homologation)

```bash
@bmad/bmm/agents/tea
```

**Command:** `*trace`

**Input:** Epic 2

**Outputs:**
- `docs/traceability-matrix-epic-2.md`
- `docs/quality-gate-epic-2.yaml`

**Final Assessment:**
```markdown
## Epic 2: Content System - Quality Gate

### Coverage Summary
- Total Stories: 4
- Acceptance Criteria: 42
- E2E Test Coverage: 100%
- Unit Test Coverage: 91%
- Integration Tests: 15

### Quality Metrics
- Code Coverage: 89%
- Test Pass Rate: 100%
- Critical Defects: 0
- Technical Debt: Low

### Decision: PASS ✅

Epic 2 complete. System ready for production deployment.

## Overall Project Status
- Epics Complete: 2/2
- Stories Complete: 7/7
- Overall Coverage: 88%
- Quality Score: Excellent
```

---

## Workflow Comparison: Complete vs Optimized

### Complete Flow (9 steps per story)

**Pros:**
- Maximum quality assurance
- Comprehensive review process
- Catches issues early
- Best practices enforced
- Full traceability

**Cons:**
- Higher time investment (9 chats/story)
- More context switching
- May be overkill for simple stories

**Best For:**
- Critical features (authentication, payments)
- Complex business logic
- Regulated industries
- High-risk functionality
- Team learning phase

**Steps per Story:**
1. create-story - Story definition
2. test-design - Risk assessment
3. atdd - Tests first (TDD)
4. story-context - Technical guidance
5. story-ready - Readiness gate
6. dev-story - Implementation
7. test-review - Test quality check
8. code-review - Code quality check
9. story-done - Completion gate

**Time per Story:** ~1-2 days (with quality gates)

---

### Optimized Flow (6 steps per story)

**Pros:**
- Faster delivery (6 chats/story)
- Less context switching
- Still maintains quality
- Good for experienced teams

**Cons:**
- Less explicit review
- Relies on developer discipline
- May miss edge cases
- Fewer quality checkpoints

**Best For:**
- Low-risk features
- Experienced teams
- Time-sensitive delivery
- Simple CRUD operations
- Non-critical paths

**Steps per Story:**
1. create-story - Story definition
2. atdd - Tests first (TDD) ⭐ KEEP
3. story-context - Technical guidance
4. story-ready - Readiness gate
5. dev-story - Implementation ⭐ KEEP
6. story-done - Completion gate

**Removed Steps:**
- ❌ test-design (implicit in ATDD)
- ❌ test-review (trust in ATDD)
- ❌ code-review (trust in dev)

**Time per Story:** ~0.5-1 day (streamlined)

---

### Minimal Flow (4 steps per story)

**Extreme Optimization - Not Recommended for CPS Compliance**

**Steps:**
1. create-story
2. story-context
3. dev-story (dev writes tests during)
4. story-done

**Warning:** Does NOT follow CPS Ch. 27 "Burn Quality In" principle. Only use for:
- Prototypes
- Proof of concepts
- Non-production code
- Spike stories

---

### Comparison Table

| Aspect | Complete (9 steps) | Optimized (6 steps) | Minimal (4 steps) |
|--------|-------------------|---------------------|-------------------|
| **Chats per Story** | 9 | 6 | 4 |
| **Time per Story** | 1-2 days | 0.5-1 day | 0.5 day |
| **CPS Compliance** | 100% | 85% | 50% |
| **Quality Gates** | 5 gates | 3 gates | 1 gate |
| **Test-First (ATDD)** | ✅ Yes | ✅ Yes | ❌ No |
| **Code Review** | ✅ Explicit | ⚠️ Implicit | ❌ No |
| **Test Review** | ✅ Explicit | ⚠️ Implicit | ❌ No |
| **Best For** | Critical features | Standard features | Prototypes only |
| **Risk Level** | Low | Medium | High |

---

### Recommendation by Story Type

| Story Type | Recommended Flow | Rationale |
|------------|------------------|-----------|
| **Authentication/Security** | Complete (9) | Critical path, high risk |
| **Payment Processing** | Complete (9) | Financial, regulatory |
| **User Data Management** | Complete (9) | Privacy, compliance |
| **CRUD Operations** | Optimized (6) | Lower risk, standard |
| **UI Components** | Optimized (6) | Visual, less critical |
| **Search/Filtering** | Optimized (6) | Feature enhancement |
| **Prototypes** | Minimal (4) | Exploration only |
| **Spike Stories** | Minimal (4) | Research/investigation |

---

## Complete Workflow Checklist

### Setup Phase (9 chats)

| # | Phase | Workflow | Agent | Command | Done | Output |
|---|-------|----------|-------|---------|------|--------|
| 1 | Setup | Project Init | analyst | `*workflow-init` | [ ] | bmm-workflow-status.yaml |
| 2 | Setup | Product Brief | analyst | `*product-brief` | [ ] | product-brief-{name}-{date}.md |
| 3 | Setup | PRD | pm | `*create-prd` | [ ] | PRD.md |
| 4 | Setup | Epics | pm | `*create-epics` | [ ] | epics.md |
| 5 | Setup | UX Design (opt) | ux-designer | `*create-ux-design` | [ ] | ux-design-specification.md |
| 6 | Setup | Architecture | architect | `*create-architecture` | [ ] | architecture.md |
| 7 | Setup | Validate Arch | architect | `*validate-architecture` | [ ] | Validation report |
| 8 | Setup | Gate Check | architect | `*solutioning-gate-check` | [ ] | Gate decision |
| 9 | Setup | Test Framework | tea | `*framework` | [ ] | playwright.config.ts + tests/ |

### Sprint Planning (2 chats)

| # | Phase | Workflow | Agent | Command | Done | Output |
|---|-------|----------|-------|---------|------|--------|
| 10 | Planning | Sprint Setup | sm | `*sprint-planning` | [ ] | sprint-status.yaml |
| 11 | Planning | Epic 1 Context | architect | `*epic-tech-context` | [ ] | epic-1-tech-context.md |

### Epic 1 - Story 1-1 (9 chats)

| # | Phase | Workflow | Agent | Command | Done | Output |
|---|-------|----------|-------|---------|------|--------|
| 12 | Story 1-1 | Create | sm | `*create-story` | [ ] | stories/1-1-{name}.md |
| 13 | Story 1-1 | Test Design | tea | `*test-design` | [ ] | test-design-epic-1.md |
| 14 | Story 1-1 | ATDD | tea | `*atdd` | [ ] | tests (FAILING) |
| 15 | Story 1-1 | Context | architect | `*story-context` | [ ] | 1-1-{name}.context.xml |
| 16 | Story 1-1 | Ready | sm | `*story-ready` | [ ] | Status: ready |
| 17 | Story 1-1 | Develop | dev | `*dev-story` | [ ] | Code + tests PASSING |
| 18 | Story 1-1 | Test Review | tea | `*test-review` | [ ] | test-review-1-1.md |
| 19 | Story 1-1 | Code Review | dev | `*code-review` | [ ] | code-review-1-1.md |
| 20 | Story 1-1 | Done | sm | `*story-done` | [ ] | Status: done |

### Epic 1 - Story 1-2 (9 chats)

| # | Phase | Workflow | Agent | Command | Done | Output |
|---|-------|----------|-------|---------|------|--------|
| 21 | Story 1-2 | Create | sm | `*create-story` | [ ] | stories/1-2-{name}.md |
| 22 | Story 1-2 | Test Design | tea | `*test-design` | [ ] | test-design update |
| 23 | Story 1-2 | ATDD | tea | `*atdd` | [ ] | tests (FAILING) |
| 24 | Story 1-2 | Context | architect | `*story-context` | [ ] | 1-2-{name}.context.xml |
| 25 | Story 1-2 | Ready | sm | `*story-ready` | [ ] | Status: ready |
| 26 | Story 1-2 | Develop | dev | `*dev-story` | [ ] | Code + tests PASSING |
| 27 | Story 1-2 | Test Review | tea | `*test-review` | [ ] | test-review-1-2.md |
| 28 | Story 1-2 | Code Review | dev | `*code-review` | [ ] | code-review-1-2.md |
| 29 | Story 1-2 | Done | sm | `*story-done` | [ ] | Status: done |

### Epic 1 - Story 1-3 (9 chats)

| # | Phase | Workflow | Agent | Command | Done | Output |
|---|-------|----------|-------|---------|------|--------|
| 30 | Story 1-3 | Create | sm | `*create-story` | [ ] | stories/1-3-{name}.md |
| 31 | Story 1-3 | Test Design | tea | `*test-design` | [ ] | test-design update |
| 32 | Story 1-3 | ATDD | tea | `*atdd` | [ ] | tests (FAILING) |
| 33 | Story 1-3 | Context | architect | `*story-context` | [ ] | 1-3-{name}.context.xml |
| 34 | Story 1-3 | Ready | sm | `*story-ready` | [ ] | Status: ready |
| 35 | Story 1-3 | Develop | dev | `*dev-story` | [ ] | Code + tests PASSING |
| 36 | Story 1-3 | Test Review | tea | `*test-review` | [ ] | test-review-1-3.md |
| 37 | Story 1-3 | Code Review | dev | `*code-review` | [ ] | code-review-1-3.md |
| 38 | Story 1-3 | Done | sm | `*story-done` | [ ] | Status: done |

### Epic 1 - Completion (2 chats)

| # | Phase | Workflow | Agent | Command | Done | Output |
|---|-------|----------|-------|---------|------|--------|
| 39 | Epic 1 | Retrospective | sm | `*retrospective` | [ ] | retrospective-epic-1.md |
| 40 | Epic 1 | Quality Gate | tea | `*trace` | [ ] | traceability-matrix-epic-1.md + gate decision |

### Epic 2 - Setup (1 chat)

| # | Phase | Workflow | Agent | Command | Done | Output |
|---|-------|----------|-------|---------|------|--------|
| 41 | Epic 2 | Epic Context | architect | `*epic-tech-context` | [ ] | epic-2-tech-context.md |

### Epic 2 - Story 2-1 (9 chats)

| # | Phase | Workflow | Agent | Command | Done | Output |
|---|-------|----------|-------|---------|------|--------|
| 42 | Story 2-1 | Create | sm | `*create-story` | [ ] | stories/2-1-{name}.md |
| 43 | Story 2-1 | Test Design | tea | `*test-design` | [ ] | test-design-epic-2.md |
| 44 | Story 2-1 | ATDD | tea | `*atdd` | [ ] | tests (FAILING) |
| 45 | Story 2-1 | Context | architect | `*story-context` | [ ] | 2-1-{name}.context.xml |
| 46 | Story 2-1 | Ready | sm | `*story-ready` | [ ] | Status: ready |
| 47 | Story 2-1 | Develop | dev | `*dev-story` | [ ] | Code + tests PASSING |
| 48 | Story 2-1 | Test Review | tea | `*test-review` | [ ] | test-review-2-1.md |
| 49 | Story 2-1 | Code Review | dev | `*code-review` | [ ] | code-review-2-1.md |
| 50 | Story 2-1 | Done | sm | `*story-done` | [ ] | Status: done |

### Epic 2 - Story 2-2 (9 chats)

| # | Phase | Workflow | Agent | Command | Done | Output |
|---|-------|----------|-------|---------|------|--------|
| 51 | Story 2-2 | Create | sm | `*create-story` | [ ] | stories/2-2-{name}.md |
| 52 | Story 2-2 | Test Design | tea | `*test-design` | [ ] | test-design update |
| 53 | Story 2-2 | ATDD | tea | `*atdd` | [ ] | tests (FAILING) |
| 54 | Story 2-2 | Context | architect | `*story-context` | [ ] | 2-2-{name}.context.xml |
| 55 | Story 2-2 | Ready | sm | `*story-ready` | [ ] | Status: ready |
| 56 | Story 2-2 | Develop | dev | `*dev-story` | [ ] | Code + tests PASSING |
| 57 | Story 2-2 | Test Review | tea | `*test-review` | [ ] | test-review-2-2.md |
| 58 | Story 2-2 | Code Review | dev | `*code-review` | [ ] | code-review-2-2.md |
| 59 | Story 2-2 | Done | sm | `*story-done` | [ ] | Status: done |

### Epic 2 - Story 2-3 (9 chats)

| # | Phase | Workflow | Agent | Command | Done | Output |
|---|-------|----------|-------|---------|------|--------|
| 60 | Story 2-3 | Create | sm | `*create-story` | [ ] | stories/2-3-{name}.md |
| 61 | Story 2-3 | Test Design | tea | `*test-design` | [ ] | test-design update |
| 62 | Story 2-3 | ATDD | tea | `*atdd` | [ ] | tests (FAILING) |
| 63 | Story 2-3 | Context | architect | `*story-context` | [ ] | 2-3-{name}.context.xml |
| 64 | Story 2-3 | Ready | sm | `*story-ready` | [ ] | Status: ready |
| 65 | Story 2-3 | Develop | dev | `*dev-story` | [ ] | Code + tests PASSING |
| 66 | Story 2-3 | Test Review | tea | `*test-review` | [ ] | test-review-2-3.md |
| 67 | Story 2-3 | Code Review | dev | `*code-review` | [ ] | code-review-2-3.md |
| 68 | Story 2-3 | Done | sm | `*story-done` | [ ] | Status: done |

### Epic 2 - Story 2-4 (9 chats)

| # | Phase | Workflow | Agent | Command | Done | Output |
|---|-------|----------|-------|---------|------|--------|
| 69 | Story 2-4 | Create | sm | `*create-story` | [ ] | stories/2-4-{name}.md |
| 70 | Story 2-4 | Test Design | tea | `*test-design` | [ ] | test-design update |
| 71 | Story 2-4 | ATDD | tea | `*atdd` | [ ] | tests (FAILING) |
| 72 | Story 2-4 | Context | architect | `*story-context` | [ ] | 2-4-{name}.context.xml |
| 73 | Story 2-4 | Ready | sm | `*story-ready` | [ ] | Status: ready |
| 74 | Story 2-4 | Develop | dev | `*dev-story` | [ ] | Code + tests PASSING |
| 75 | Story 2-4 | Test Review | tea | `*test-review` | [ ] | test-review-2-4.md |
| 76 | Story 2-4 | Code Review | dev | `*code-review` | [ ] | code-review-2-4.md |
| 77 | Story 2-4 | Done | sm | `*story-done` | [ ] | Status: done |

### Epic 2 - Completion (2 chats)

| # | Phase | Workflow | Agent | Command | Done | Output |
|---|-------|----------|-------|---------|------|--------|
| 78 | Epic 2 | Retrospective | sm | `*retrospective` | [ ] | retrospective-epic-2.md |
| 79 | Epic 2 | Quality Gate | tea | `*trace` | [ ] | traceability-matrix-epic-2.md + final gate |

---

## Summary Statistics

### Complete Flow Statistics

**Total Chats:** 79

**Breakdown by Phase:**
- Setup: 9 chats (11%)
- Sprint Planning: 2 chats (3%)
- Epic 1 Development: 27 chats (34%)
- Epic 1 Completion: 2 chats (3%)
- Epic 2 Setup: 1 chat (1%)
- Epic 2 Development: 36 chats (46%)
- Epic 2 Completion: 2 chats (3%)

**Per Story (Complete Flow):**
- Chats per story: 9
- Time per story: 1-2 days
- Quality gates per story: 5

**Per Epic:**
- Epic 1 (3 stories): 29 chats total
- Epic 2 (4 stories): 38 chats total

**Time Estimates:**
- Setup Phase: 3-5 days
- Epic 1 (3 stories): 1-2 weeks
- Epic 2 (4 stories): 1.5-2.5 weeks
- **Total Project: 3-5 weeks**

---

### Optimized Flow Statistics

**Total Chats:** 52

**Breakdown by Phase:**
- Setup: 9 chats
- Sprint Planning: 2 chats
- Epic 1 Development: 18 chats (6 per story × 3)
- Epic 1 Completion: 2 chats
- Epic 2 Setup: 1 chat
- Epic 2 Development: 24 chats (6 per story × 4)
- Epic 2 Completion: 2 chats

**Per Story (Optimized Flow):**
- Chats per story: 6
- Time per story: 0.5-1 day
- Quality gates per story: 3

**Time Estimates:**
- Setup Phase: 3-5 days
- Epic 1 (3 stories): 4-7 days
- Epic 2 (4 stories): 5-9 days
- **Total Project: 2-3 weeks**

**Time Savings:** 33-40% faster than complete flow

---

### CPS Coverage Analysis

**Total CPS Practices:** 37 chapters

**BMAD Coverage:**
- Direct Match (90%+): 18 practices (49%)
- Good Match (70-89%): 12 practices (32%)
- Partial Match (50-69%): 7 practices (19%)

**Core CPS Principles Implemented:**
- One Piece Flow (Ch. 26): 100% ✅
- Burn Quality In (Ch. 27): 100% ✅
- Continuous Homologation (Ch. 28): 95% ✅
- Continuous Improvement (Ch. 25): 100% ✅
- Control Quality (Ch. 24): 95% ✅

**Overall CPS-BMAD Alignment:** 92%

---

### Quality Metrics (Expected)

**Test Coverage:**
- Code Coverage Target: >80%
- Acceptance Criteria Coverage: 100%
- E2E Test Coverage: 100%
- Unit Test Coverage: >85%

**Defect Rates:**
- Defects caught in ATDD: 60-70%
- Defects caught in review: 20-30%
- Defects in production: <5%

**Velocity:**
- Sprint 1 (Epic 1): Baseline
- Sprint 2 (Epic 2): +20-30% improvement
- Sprint 3+: +30-40% improvement (learning curve)

---

## Quick Reference

### Story Development Pattern (Complete)

**For each story, repeat:**

```bash
# 1. Create Story
@bmad/bmm/agents/sm
*create-story

# 2. Test Design
@bmad/bmm/agents/tea
*test-design

# 3. ATDD (Tests First!)
@bmad/bmm/agents/tea
*atdd

# 4. Story Context
@bmad/bmm/agents/architect
*story-context

# 5. Story Ready
@bmad/bmm/agents/sm
*story-ready

# 6. Develop Story
@bmad/bmm/agents/dev
*dev-story

# 7. Test Review
@bmad/bmm/agents/tea
*test-review

# 8. Code Review
@bmad/bmm/agents/dev
*code-review

# 9. Story Done
@bmad/bmm/agents/sm
*story-done
```

---

### Story Development Pattern (Optimized)

**For each story, repeat:**

```bash
# 1. Create Story
@bmad/bmm/agents/sm
*create-story

# 2. ATDD (Tests First!)
@bmad/bmm/agents/tea
*atdd

# 3. Story Context
@bmad/bmm/agents/architect
*story-context

# 4. Story Ready
@bmad/bmm/agents/sm
*story-ready

# 5. Develop Story
@bmad/bmm/agents/dev
*dev-story

# 6. Story Done
@bmad/bmm/agents/sm
*story-done
```

---

### Key Commands by Agent

**Analyst:**
- `*workflow-init` - Initialize project
- `*product-brief` - Create product brief
- `*workflow-status` - Check status anytime

**PM (Product Manager):**
- `*create-prd` - Create PRD
- `*create-epics` - Generate epics and stories

**Architect:**
- `*create-architecture` - Design architecture
- `*validate-architecture` - Validate architecture
- `*solutioning-gate-check` - Gate check
- `*epic-tech-context` - Epic context
- `*story-context` - Story context

**UX Designer:**
- `*create-ux-design` - Create UX spec

**TEA (Test Architect):**
- `*framework` - Setup test framework
- `*test-design` - Design tests
- `*atdd` - Write tests first (TDD)
- `*test-review` - Review test quality
- `*trace` - Traceability + quality gate

**SM (Scrum Master):**
- `*sprint-planning` - Setup sprint
- `*create-story` - Create story file
- `*story-ready` - Mark story ready
- `*story-done` - Mark story done
- `*retrospective` - Run retrospective

**DEV (Developer):**
- `*dev-story` - Implement story
- `*code-review` - Review code

---

### Common Shortcuts

**Check Project Status:**
```bash
@bmad/bmm/agents/analyst
*workflow-status
```

**Skip Optional Workflows:**
- UX Design (if no UI changes)
- Test Review (optimized flow)
- Code Review (optimized flow)

**Batch Similar Stories:**
- Create multiple stories in sequence
- Use same epic-tech-context for all stories in epic

**Parallel Work:**
- Different team members can work on different stories
- Each story is independent (One Piece Flow)

---

### Troubleshooting

**Problem: Lost track of where I am**
```bash
@bmad/bmm/agents/analyst
*workflow-status
```

**Problem: Story blocked by dependency**
```bash
@bmad/bmm/agents/sm
*correct-course
```

**Problem: Tests failing unexpectedly**
```bash
@bmad/bmm/agents/tea
*test-review
# Review test quality and patterns
```

**Problem: Need to change scope**
```bash
@bmad/bmm/agents/sm
*correct-course
# Adjust sprint plan
```

**Problem: Architecture decision needed**
```bash
@bmad/bmm/agents/architect
# Create fresh chat for architecture discussion
# Update architecture.md as needed
```

---

## Tips for Success

### Best Practices

1. **Always use fresh chats** - Start new chat for each workflow to avoid context limits
2. **Follow ATDD strictly** - Write tests before implementation (Red-Green-Refactor)
3. **One story at a time** - Complete one story fully before starting next
4. **Load context files** - DEV agent automatically loads context.xml and epic-tech-context
5. **Update sprint-status** - Keep sprint-status.yaml current with story progress

### ATDD Discipline

**Red Phase:**
- Write failing tests first
- Map all acceptance criteria to tests
- Run tests, confirm they fail (no false positives)

**Green Phase:**
- Implement minimum code to pass tests
- Run tests, see them pass
- Don't add extra features

**Refactor Phase:**
- Improve code quality
- Keep tests passing
- Remove duplication

### Quality Gates

**Story Level:**
- Story Ready: Context and tests exist
- Story Done: All criteria met, tests pass

**Epic Level:**
- Retrospective: Learn and improve
- Trace: 100% coverage validation

**Project Level:**
- Solutioning Gate: Architecture approved
- Final Gate: Production ready

---

## Appendix: File Structure

**Expected Directory Structure After Complete Flow:**

```
project-root/
├── docs/
│   ├── bmm-workflow-status.yaml
│   ├── product-brief-{name}-{date}.md
│   ├── PRD.md
│   ├── epics.md
│   ├── ux-design-specification.md
│   ├── architecture.md
│   ├── sprint-status.yaml
│   ├── epic-1-tech-context.md
│   ├── epic-2-tech-context.md
│   ├── test-design-epic-1.md
│   ├── test-design-epic-2.md
│   ├── traceability-matrix-epic-1.md
│   ├── traceability-matrix-epic-2.md
│   ├── quality-gate-epic-1.yaml
│   ├── quality-gate-epic-2.yaml
│   ├── retrospective-epic-1.md
│   ├── retrospective-epic-2.md
│   └── stories/
│       ├── 1-1-user-authentication.md
│       ├── 1-1-user-authentication.context.xml
│       ├── 1-2-user-registration.md
│       ├── 1-2-user-registration.context.xml
│       ├── 1-3-password-recovery.md
│       ├── 1-3-password-recovery.context.xml
│       ├── 2-1-create-content.md
│       ├── 2-1-create-content.context.xml
│       ├── 2-2-edit-content.md
│       ├── 2-2-edit-content.context.xml
│       ├── 2-3-delete-content.md
│       ├── 2-3-delete-content.context.xml
│       ├── 2-4-content-search.md
│       └── 2-4-content-search.context.xml
├── tests/
│   ├── e2e/
│   │   ├── auth/
│   │   │   ├── login.spec.ts
│   │   │   ├── registration.spec.ts
│   │   │   └── password-recovery.spec.ts
│   │   └── content/
│   │       ├── create-content.spec.ts
│   │       ├── edit-content.spec.ts
│   │       ├── delete-content.spec.ts
│   │       └── search-content.spec.ts
│   ├── support/
│   │   ├── fixtures/
│   │   │   ├── index.ts
│   │   │   └── factories/
│   │   │       ├── user-factory.ts
│   │   │       └── content-factory.ts
│   │   └── helpers/
│   ├── playwright.config.ts
│   └── README.md
└── src/
    └── [implementation code]
```

---

## Document Information

**Version:** 1.0  
**Last Updated:** November 2025  
**Maintained By:** BMAD-CPS Integration Team  
**Related Documents:**
- CPSBok Complete v1.1.5
- BMAD Method Documentation
- CI&T Production System Guide

**Feedback:** For questions or improvements to this guide, please contact the BMAD community.

---

**End of Document**

