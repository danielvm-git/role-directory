# GitHub Automation Scripts

This directory contains automation scripts for the role-directory project.

## Scripts

### update-readme-status.js

Automatically updates the "Project Status & Roadmap" section in README.md with the current workflow status from `docs/bmm-workflow-status.yaml`.

**Usage:**

```bash
# Test mode - outputs to README.test.md
node update-readme-status.js --test

# Production mode - updates README.md
node update-readme-status.js
```

**Features:**

- Parses `docs/bmm-workflow-status.yaml` to extract completed workflows
- Groups workflows by phase (Discovery, Planning, Solutioning, Implementation)
- Generates formatted markdown with validation scores
- Updates README.md between `<!-- STATUS_START -->` and `<!-- STATUS_END -->` markers
- Test mode allows safe preview of output

**Automation:**

This script runs automatically via GitHub Actions (`.github/workflows/update-readme-status.yml`) whenever `docs/bmm-workflow-status.yaml` is updated and pushed to the main branch.

## Setup

Install dependencies:

```bash
cd .github/scripts
npm install
```

## Dependencies

- `js-yaml` - YAML parsing library

## GitHub Actions Integration

The `update-readme-status.yml` workflow:

1. Triggers on push when `docs/bmm-workflow-status.yaml` changes
2. Can be manually triggered via workflow_dispatch
3. Installs script dependencies
4. Runs the update script
5. Commits changes back to the repository with `[skip ci]` flag

This ensures the README always reflects the current project status without manual updates.

