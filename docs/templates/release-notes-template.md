# Release Notes Template

<!--
  BMAD Method Release Notes Template
  Based on Clean Code principles and GitHub best practices

  CLEAN CODE PRINCIPLES APPLIED:
  - Clear, meaningful names
  - Single Responsibility: Each section has one purpose
  - DRY (Don't Repeat Yourself): Use consistent formatting
  - Comments when necessary for clarity
  - Professional formatting and organization
-->

## 🎯 Release: [Version Number] - [Release Name]

**Release Date:** YYYY-MM-DD  
**Release Type:** Major | Minor | Patch | Pre-release  
**Status:** Stable | Beta | Alpha

<!--
  Use conventional release types to categorize changes:

  - feat: New features
  - fix: Bug fixes
  - perf: Performance improvements
  - refactor: Code refactoring
  - docs: Documentation changes
  - style: Code style/formatting
  - test: Test additions/changes
  - sec: security-related changes
  - chore: Maintenance tasks
  - ci: CI/CD changes
  - build: Build system changes
  - ops: Operational changes
  - revert: Reverted changes

-->

---

## ✨ Features

<!-- List all new features added in this release -->
<!-- Corresponds to: feat commits -->
<!-- Group by module/component for better organization -->

- **Feature 1** (#PR-Number): Clear description of the Feature
- **Feature 2** (#PR-Number): Clear description of the Feature

---

## 🐛 Bug Fixes

<!-- List all bugs fixed in this release -->
<!-- Corresponds to: fix commits -->
<!-- Group by severity or component -->

- **Bug 1** (#PR-Number): Clear description of the Bug
- **Bug 2** (#PR-Number): Clear description of the Bug

---

## ⚡ Performance Improvements

<!-- List performance improvements with measurable results -->
<!-- Corresponds to: perf commits -->

- **[Component Name]:** Improved [specific metric] by X%
  - **Before:** Specific measurement
  - **After:** Specific measurement
  - **Method:** Brief description of how it was achieved
---

## 🚀 Enhancements

<!-- List improvements to existing features -->
<!-- Corresponds to: refactor, style commits -->
<!-- Use meaningful names, not technical jargon -->

- **Enhancement 1** (#PR-Number): Clear description of the improvement
- **Enhancement 2** (#PR-Number): Clear description of the improvement

---

## 📚 Documentation

<!-- List documentation improvements -->
<!-- Corresponds to: docs commits -->

### Added

- New guide: [Guide Name] - Brief description
- New tutorial: [Tutorial Name] - Brief description

### Updated

- Updated [Document Name] with improved examples
- Clarified [Concept] in [Document Name]

### Fixed

- Fixed typos and inconsistencies in [Document Name]

---

## 🧪 Testing

<!-- List test additions and improvements -->
<!-- Corresponds to: test commits -->

- Added tests for [Component/Feature]
- Improved test coverage for [Module]
- Fixed flaky tests in [Test Suite]

---

## 🔒 Security Updates

<!-- IMPORTANT: List all security-related changes -->
<!-- Corresponds to: sec commits -->
<!-- Follow responsible disclosure practices -->

- **[CVE-ID if applicable]:** Description of security issue and fix
  - **Severity:** Critical | High | Medium | Low
  - **Affected Versions:** List affected versions
  - **Fixed In:** This version
  - **Action Required:** What users need to do

---

## 🔧 Maintenance & Chores

<!-- List maintenance tasks, dependency updates, and routine work -->
<!-- Corresponds to: chore, build, ci, ops commits -->

### Dependencies

- Updated [Dependency] from vX.X.X to vY.Y.Y (#PR-Number)

### CI/CD

- Improved CI pipeline performance
- Added new workflow for [Process]

### Build System

- Updated build configuration
- Optimized build process

### Operations

- Infrastructure improvements
- Deployment enhancements

---

## 🚫 Removed in This Release

<!-- List features that have been removed in this release -->

- **[Feature Name]:** Previously deprecated in v.X.X.X
  - **Replacement:** Link to alternative solution
  - **More info:** Link to deprecation announcement

---

## 🔗 Full Changelog

**[View the complete diff on GitHub](https://github.com/owner/repo/compare/v.X.X.X...v.X.X.X)**

---

<!--
  RELEASE NOTES CHECKLIST:

  Before publishing, ensure:
  - [ ] All sections are filled out completely
  - [ ] Version numbers are correct and consistent
  - [ ] Titles line ≤50 character
  - [ ] Breaking changes are clearly documented
  - [ ] Migration guides are complete and tested
  - [ ] Code examples are tested and working
  - [ ] Links are valid and not broken
  - [ ] Contributors are properly credited
  - [ ] Tone is professional and user-friendly
  - [ ] Technical accuracy has been verified
  - [ ] Spelling and grammar checked
  - [ ] Follows Clean Code principles (clear, concise, maintainable)
-->
