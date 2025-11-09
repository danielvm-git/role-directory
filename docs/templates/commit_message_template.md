# Commit Message Template

<!--
  BMAD Method Commit Message Template
  Based on Conventional Commits and Clean Code principles

  CLEAN CODE PRINCIPLES APPLIED:
  - Clear, meaningful descriptions
  - Single Responsibility: One commit = one logical change
  - DRY (Don't Repeat Yourself): Consistent formatting
  - Comments when necessary for context
  - Professional and concise communication

  See: updates/git-commit-messages-guide.md
-->

## 📝 Commit Message Structure

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

---

## 🏷️ Type Reference

<!--
  Choose the appropriate type for your commit:

  - feat: New feature for users
  - fix: Bug fix for users
  - perf: Performance improvement
  - refactor: Code restructuring (no behavior change)
  - docs: Documentation only changes
  - style: Formatting, whitespace (no code change)
  - test: Adding or updating tests
  - sec: Security-related changes
  - chore: Maintenance, dependencies
  - ci: CI/CD configuration changes
  - build: Build system changes
  - ops: Operational/infrastructure changes
  - revert: Reverting a previous commit
-->

---

## ✨ Features (feat)

**Template:**

```
feat(scope): add [feature name]

Implement [feature description]. Users can now [benefit].

- Add [component/file]
- Implement [functionality]
- Update [related items]

Closes #[issue-number]
```

**Example:**

```
feat(auth): add OAuth 2.0 support

Implement OAuth 2.0 authentication flow with support
for Google and GitHub providers. Users can now sign
in using their existing accounts.

- Add OAuth provider configuration
- Implement callback handlers
- Update user model to store provider info

Closes #234
```

---

## 🐛 Bug Fixes (fix)

**Template:**

```
fix(scope): resolve [bug description]

The [component/function] was not handling [scenario]
properly, causing [problem]. Added [solution].

Fixes #[issue-number]
```

**Example:**

```
fix(api): resolve null pointer exception in user service

The getUserById method was not handling null values
properly when user was not found, causing application
crashes. Added null check and proper error response.

Fixes #567
```

---

## ⚡ Performance (perf)

**Template:**

```
perf(scope): optimize [component/process]

Improve [specific aspect] by [method]. Reduces
[metric] from [before] to [after].

- [Optimization 1]
- [Optimization 2]

Related to #[issue-number]
```

**Example:**

```
perf(database): optimize query performance

Replace N+1 queries with batch loading and add
database indexes on frequently queried fields.
Reduces average query time from 250ms to 45ms.

- Add indexes on user_id and created_at
- Implement batch loading for related entities

Related to #345
```

---

## 🔄 Refactoring (refactor)

**Template:**

```
refactor(scope): [action] [component]

[Reason for refactoring]. This improves [benefit]
and makes [improvement].

- [Change 1]
- [Change 2]
```

**Example:**

```
refactor(auth): extract validation logic to separate module

The validation code was duplicated across multiple
components, making it difficult to maintain and test.
Extracting it improves code reusability and makes
testing more straightforward.

- Create ValidationService
- Update components to use service
- Add comprehensive unit tests
```

---

## 📚 Documentation (docs)

**Template:**

```
docs: [action] [document name]

[Description of what was added/updated/fixed].

- [Change 1]
- [Change 2]
```

**Example:**

```
docs: add contribution guidelines

Add comprehensive contribution guide including:
- Code style requirements
- Commit message conventions
- Pull request process
- Testing requirements
```

---

## 🎨 Style (style)

**Template:**

```
style(scope): [formatting change]

[Brief description of styling changes].
No functional changes.
```

**Example:**

```
style(auth): format code with prettier

Apply prettier formatting to authentication module.
No functional changes.
```

---

## 🧪 Testing (test)

**Template:**

```
test(scope): [action] tests for [component]

[Description of tests added/updated/fixed].

- [Test case 1]
- [Test case 2]
```

**Example:**

```
test(auth): add integration tests for OAuth flow

Add comprehensive integration tests covering:
- Google OAuth authentication
- GitHub OAuth authentication
- Token refresh flow
- Error handling scenarios
```

---

## 🔒 Security (sec)

**Template:**

```
sec(scope): [security improvement]

[Description of security issue and fix].

[CVE-ID if applicable]
Severity: [Critical|High|Medium|Low]

Fixes #[issue-number]
```

**Example:**

```
sec(auth): fix session token validation vulnerability

Add proper validation of session tokens to prevent
token reuse attacks. Implements token rotation and
expiry checking.

CVE-2024-XXXXX
Severity: High

Fixes #789
```

---

## 🔧 Maintenance (chore)

**Template:**

```
chore(scope): [maintenance task]

[Description of maintenance work].

- [Item 1]
- [Item 2]
```

**Example:**

```
chore(deps): update dependencies to latest versions

Update all dependencies to address security
vulnerabilities and compatibility issues.

- Update Express to v4.18.2
- Update TypeScript to v5.0.0
- Update Jest to v29.5.0
```

---

## 🔄 CI/CD (ci)

**Template:**

```
ci: [change description]

[What was changed and why].
```

**Example:**

```
ci: add automated security scanning

Add Snyk security scanning to CI pipeline to detect
vulnerabilities in dependencies before deployment.
```

---

## 🏗️ Build (build)

**Template:**

```
build: [build system change]

[Description of what changed in build system].
```

**Example:**

```
build: optimize webpack bundle size

Configure webpack to use tree shaking and code
splitting. Reduces bundle size by 35%.
```

---

## 🚀 Operations (ops)

**Template:**

```
ops: [operational change]

[Description of infrastructure/deployment change].
```

**Example:**

```
ops: add health check endpoint

Implement /health endpoint for load balancer
monitoring and automated health checks.
```

---

## ↩️ Revert (revert)

**Template:**

```
revert: [reverted commit description]

This reverts commit [commit-hash].

Reason: [Why the commit is being reverted]
```

**Example:**

```
revert: "feat(auth): add OAuth 2.0 support"

This reverts commit abc123def456.

Reason: OAuth implementation causing authentication
failures in production. Need to investigate and fix
before re-deploying.
```

---

## ⚠️ Breaking Changes

**When introducing breaking changes, use one of these formats:**

### Method 1: Exclamation Mark

```
feat(api)!: redesign REST API endpoints

BREAKING CHANGE: API endpoints have been renamed.
See migration guide for details.
```

### Method 2: Footer

```
feat(api): redesign REST API endpoints

Restructure API endpoints for better consistency.

BREAKING CHANGE: API endpoints have been renamed:
- GET /users/:id → GET /api/v2/users/:id
- POST /user → POST /api/v2/users
- PUT /user/:id → PATCH /api/v2/users/:id

Migration guide: docs/api-migration-v2.md

Closes #890
```

---

## 📋 Golden Rules

### Subject Line (First Line)

- [ ] **50 characters maximum** - Keep it concise
- [ ] **Capitalize first letter** - "Add feature" not "add feature"
- [ ] **No period at end** - Clean and simple
- [ ] **Use imperative mood** - "Add" not "Added" or "Adding"
- [ ] **Include type and optional scope** - `feat(auth):` or `fix:`

### Body (Optional, but Recommended)

- [ ] **Separate from subject with blank line** - Visual clarity
- [ ] **Wrap at 72 characters** - Readable in all contexts
- [ ] **Explain WHAT and WHY** - Not HOW (code shows how)
- [ ] **Use bullet points** - For multiple items
- [ ] **Present tense** - Consistent with subject

### Footer (Optional)

- [ ] **Reference issues** - `Fixes #123`, `Closes #456`, `Related to #789`
- [ ] **Document breaking changes** - Use `BREAKING CHANGE:` prefix
- [ ] **Include co-authors** - `Co-authored-by: Name <email@example.com>`

---

## 🎯 Quick Decision Guide

**Ask yourself:**

1. **Does it add new functionality users can see?** → `feat`
2. **Does it fix something that was broken?** → `fix`
3. **Does it make things faster?** → `perf`
4. **Does it improve code structure without changing behavior?** → `refactor`
5. **Does it only change documentation?** → `docs`
6. **Does it only change formatting/style?** → `style`
7. **Does it add or modify tests?** → `test`
8. **Does it address a security issue?** → `sec`
9. **Does it update dependencies or tooling?** → `chore`
10. **Does it change CI/CD?** → `ci`
11. **Does it change the build system?** → `build`
12. **Does it change infrastructure/deployment?** → `ops`
13. **Does it undo a previous commit?** → `revert`

---

## 💡 Examples by Scenario

### Adding a New Feature

```
feat(dashboard): add real-time data visualization

Implement WebSocket-based real-time charts that update
automatically when new data arrives. Users can now
monitor metrics without refreshing the page.

- Add WebSocket connection handler
- Implement chart update logic
- Add connection status indicator

Closes #123
```

### Fixing a Critical Bug

```
fix(payment): resolve race condition in transaction processing

Payment transactions were occasionally being processed
twice due to a race condition in the async handler.
Added proper locking mechanism to ensure atomic processing.

Fixes #456
Severity: Critical
```

### Updating Dependencies

```
chore(deps): update React to v18.2.0

Update React and related dependencies to latest stable
versions for security patches and performance improvements.

- Update react@18.2.0
- Update react-dom@18.2.0
- Update @types/react@18.2.0
```

### Improving Performance

```
perf(images): implement lazy loading for gallery

Replace eager loading with intersection observer-based
lazy loading. Reduces initial page load time from 4.2s
to 1.1s and improves Lighthouse score from 65 to 92.

Closes #789
```

### Security Fix

```
sec(auth): fix JWT token expiration bypass

Add proper expiration validation to prevent use of
expired tokens. Previously expired tokens were being
accepted due to missing validation check.

CVE-2024-XXXXX
Severity: High

Fixes #234
```

---

## 🔄 Workflow

### 1. Make Your Changes

```bash
# Work on your feature/fix
git add [files]
```

### 2. Write Commit Message

```bash
# Use this template as guide
git commit

# Or for simple commits
git commit -m "type(scope): description"
```

### 3. Multi-line Commits

```bash
# For detailed commits
git commit -m "feat(api): add user search" \
           -m "Implement full-text search across user profiles with filters for name, email, and role." \
           -m "Closes #123"
```

### 4. Amend if Needed (Local Only!)

```bash
# Fix commit message (only if not pushed!)
git commit --amend

# Add forgotten files
git add forgotten-file.js
git commit --amend --no-edit
```

---

## 🛠️ Setup Git Template

### Create Template File

```bash
# Save this template
cat > ~/.gitmessage << 'EOF'
# <type>[optional scope]: <description>
#
# [optional body]
#
# [optional footer(s)]
#
# Types: feat, fix, perf, refactor, docs, style, test, sec, chore, ci, build, ops, revert
#
# Rules:
# - Subject: 50 chars max, capitalized, no period, imperative
# - Body: 72 chars per line, explain what and why
# - Footer: Issue refs, breaking changes
EOF
```

### Configure Git

```bash
# Set template globally
git config --global commit.template ~/.gitmessage

# Or per repository
cd your-repo
git config commit.template .gitmessage
```

---

## ✅ Pre-Commit Checklist

Before committing, verify:

- [ ] Commit type is correct and appropriate
- [ ] Scope accurately describes the area changed
- [ ] Description is clear and under 50 characters
- [ ] Body explains WHAT and WHY (if needed)
- [ ] Issue references included (if applicable)
- [ ] Breaking changes documented (if applicable)
- [ ] Code is tested and working
- [ ] No commented-out code or debug statements
- [ ] Follows project coding standards

---

## 🚫 Common Mistakes to Avoid

### ❌ Don't Do This:

```
Updated stuff
Fixed bug
WIP
asdf
minor changes
various fixes
```

### ✅ Do This Instead:

```
feat(auth): add password reset functionality
fix(api): resolve timeout in user fetch
refactor(db): optimize connection pooling
docs: update API documentation for v2.0
test(payment): add unit tests for checkout flow
```

---

## 📚 Additional Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Git Commit Messages Guide](../updates/git-commit-messages-guide.md)
- [Release Template](.github/RELEASE_TEMPLATE.md)
- [Semantic Versioning](https://semver.org/)

---

## 💭 Remember

> "A well-crafted Git commit message is the best way to communicate context about a change to fellow developers (and indeed to their future selves)."
> — Chris Beams

**Your commit messages are:**

- Documentation for the future
- Communication with your team
- History of your project
- Foundation for release notes
- Evidence of professionalism

**Make them count!** ✨

---

<!--
  COMMIT MESSAGE CHECKLIST:

  Before committing, ensure:
  - [ ] Type is appropriate for the change
  - [ ] Subject line ≤50 characters
  - [ ] First letter capitalized
  - [ ] No period at end of subject
  - [ ] Imperative mood used ("Add" not "Added")
  - [ ] Body wrapped at 72 characters
  - [ ] Explains WHAT and WHY (not HOW)
  - [ ] Issue references included
  - [ ] Breaking changes documented (if any)
  - [ ] Co-authors credited (if applicable)
-->
