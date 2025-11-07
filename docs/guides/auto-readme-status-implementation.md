# Auto README Status Update - Implementation Guide

**Date:** 2025-11-06  
**Status:** ✅ Implemented and Tested  
**Feature:** Automatic README.md status section updates from YAML

---

## Overview

This document describes the implementation of an automated system that updates the "Project Status & Roadmap" section in `README.md` whenever the workflow status YAML file is modified.

### Problem Solved

- Manual README updates were required whenever project status changed
- Risk of README becoming stale or inconsistent with actual workflow status
- Need for frequent updates as stories are completed

### Solution

A GitHub Actions workflow that:
1. Triggers automatically when `docs/bmm-workflow-status.yaml` is modified
2. Runs a Node.js script to parse YAML and generate markdown
3. Updates the README.md between special markers
4. Commits changes back to the repository

---

## Architecture

### Components

#### 1. Node.js Update Script
**Location:** `.github/scripts/update-readme-status.js`

**Key Features:**
- Parses `docs/bmm-workflow-status.yaml` using `js-yaml`
- Maps workflow keys to human-readable phases and descriptions
- Generates formatted markdown with validation scores
- Updates README.md between `<!-- STATUS_START -->` and `<!-- STATUS_END -->` markers
- Supports test mode (`--test` flag) for safe preview

**Workflow Mapping:**
```javascript
const WORKFLOW_METADATA = {
  'product-brief': {
    phase: 'Discovery',
    display: 'Product brief created',
    validation: null
  },
  'prd': {
    phase: 'Planning',
    display: 'PRD defined',
    validation: '99.6%'
  },
  // ... more mappings
};
```

**Key Functions:**
- `readYamlFile()` - Parses YAML with error handling
- `generateCompletedPhases()` - Groups workflows by phase
- `generateCurrentPhase()` - Shows implementation progress
- `generateFuturePhases()` - Lists upcoming phases
- `updateReadme()` - Replaces content between markers

#### 2. GitHub Actions Workflow
**Location:** `.github/workflows/update-readme-status.yml`

**Triggers:**
- Push to main/master when `docs/bmm-workflow-status.yaml` changes
- Manual trigger via `workflow_dispatch`

**Steps:**
1. Checkout repository with write permissions
2. Setup Node.js 20
3. Install script dependencies (`js-yaml`)
4. Run update script
5. Commit and push changes (if README modified)

**Permissions Required:**
```yaml
permissions:
  contents: write  # Needed to commit changes
```

**Commit Strategy:**
- Uses `[skip ci]` flag to prevent infinite loops
- Only commits if README.md actually changed
- Uses `github-actions[bot]` as committer

#### 3. HTML Comment Markers
**Location:** `README.md` lines 508 and 556

```markdown
<!-- STATUS_START -->
[Auto-generated content here]
<!-- STATUS_END -->
```

**Purpose:**
- Clearly demarcate the auto-updated section
- Allow the script to safely replace content without affecting other sections
- Invisible in rendered markdown

---

## File Structure

```
role-directory/
├── .github/
│   ├── scripts/
│   │   ├── update-readme-status.js   # Update script
│   │   ├── package.json               # Dependencies
│   │   ├── .gitignore                 # Ignore node_modules
│   │   └── README.md                  # Script documentation
│   └── workflows/
│       └── update-readme-status.yml   # GitHub Actions workflow
├── docs/
│   ├── bmm-workflow-status.yaml       # Source of truth for status
│   └── guides/
│       └── auto-readme-status-implementation.md  # This file
└── README.md                          # Contains status markers
```

---

## Generated Output Example

The script generates the following markdown structure:

```markdown
## Project Status & Roadmap

### ✅ Completed Phases

- [x] **Discovery** - Product brief created
- [x] **Planning** - PRD defined & Epics defined (99.6% validation)
- [x] **Solutioning** - Architecture designed (100/100 score)

### 🔄 Current Phase: Implementation

**MVP Goal:** ONE feature through 3 environments (dev → stg → prd)

**Progress:**
- [ ] Epic 1: Foundation & Deployment Pipeline (0/11 stories)
- [ ] Epic 2: Database Infrastructure (0/6 stories)
- [ ] Epic 3: Authentication & Access Control (0/8 stories)
- [ ] Epic 4: Hello World Dashboard (0/7 stories)

**Estimated Completion:** 7-12 days (based on story breakdown)

### 🔮 Future Phases

**Phase 2: Testing & Quality** (Deferred from MVP)
[... more content ...]
```

---

## Testing & Verification

### Local Testing

**Test Mode (Safe Preview):**
```bash
cd .github/scripts
npm install
cd ../..
node .github/scripts/update-readme-status.js --test
# Check README.test.md for output
```

**Production Mode:**
```bash
node .github/scripts/update-readme-status.js
# Updates README.md directly
```

### Idempotency Test

Running the script multiple times with the same YAML produces identical output:
```bash
node .github/scripts/update-readme-status.js
node .github/scripts/update-readme-status.js
# No changes on second run
```

✅ **Verified:** Script is idempotent and safe to run repeatedly.

### YAML Validation

```bash
cd .github/scripts
node -e "const yaml = require('js-yaml'); const fs = require('fs'); yaml.load(fs.readFileSync('../workflows/update-readme-status.yml', 'utf8')); console.log('Valid YAML');"
```

✅ **Verified:** Workflow YAML is valid and parseable.

---

## Usage

### Manual Update (Developer)

```bash
# Update YAML file
vim docs/bmm-workflow-status.yaml

# Test the update locally first
node .github/scripts/update-readme-status.js --test
cat README.test.md

# If it looks good, run production mode
node .github/scripts/update-readme-status.js

# Commit changes
git add README.md docs/bmm-workflow-status.yaml
git commit -m "chore: update workflow status"
git push
```

### Automatic Update (GitHub Actions)

1. Edit `docs/bmm-workflow-status.yaml` (e.g., mark a workflow as completed)
2. Commit and push to main branch
3. GitHub Actions automatically:
   - Detects the YAML file change
   - Runs the update script
   - Commits the updated README.md
   - Pushes back to the repository

### Manual Trigger (GitHub UI)

1. Go to **Actions** tab in GitHub
2. Select **Update README Status** workflow
3. Click **Run workflow**
4. Select branch and click **Run workflow** button

---

## Maintenance

### Adding New Workflows

To add a new workflow to the status tracking:

1. **Update YAML File:**
   ```yaml
   workflow_status:
     new-workflow: docs/path/to/new-workflow.md
   ```

2. **Update Script Metadata:**
   ```javascript
   // In update-readme-status.js
   const WORKFLOW_METADATA = {
     'new-workflow': {
       phase: 'Planning',  // or Discovery, Solutioning
       display: 'New workflow completed',
       validation: null  // or '95%' if applicable
     }
   };
   ```

3. **Test:**
   ```bash
   node .github/scripts/update-readme-status.js --test
   ```

### Modifying Output Format

Edit these functions in `update-readme-status.js`:
- `generateCompletedPhases()` - Completed phases section
- `generateCurrentPhase()` - Current phase/implementation progress
- `generateFuturePhases()` - Future roadmap items

### Updating Epic Story Counts

When epic story counts change, update:
```javascript
const EPIC_STORY_COUNTS = {
  'epic1': 11,  // Update these numbers
  'epic2': 6,
  'epic3': 8,
  'epic4': 7
};
```

---

## Troubleshooting

### Issue: Markers Not Found

**Error:** `Could not find STATUS_START or STATUS_END markers in README`

**Solution:** Add markers to README.md:
```markdown
<!-- STATUS_START -->
[existing content]
<!-- STATUS_END -->
```

### Issue: YAML Parse Error

**Error:** `Error reading YAML file: ...`

**Solution:** Validate YAML syntax:
```bash
cd .github/scripts
node -e "const yaml=require('js-yaml');const fs=require('fs');yaml.load(fs.readFileSync('../../docs/bmm-workflow-status.yaml','utf8'));"
```

### Issue: GitHub Actions Permission Denied

**Error:** `Permission denied` when trying to push

**Solution:** Ensure workflow has write permissions:
```yaml
permissions:
  contents: write
```

### Issue: Infinite Loop (Workflow Triggering Itself)

**Solution:** The commit message includes `[skip ci]` to prevent this:
```bash
git commit -m "chore: auto-update project status [skip ci]"
```

---

## Benefits

### For Developers
- ✅ No manual README updates needed
- ✅ Status always reflects current YAML state
- ✅ Test mode allows safe preview before production
- ✅ Local script can be run anytime

### For Project Management
- ✅ Single source of truth (YAML file)
- ✅ Automatic updates on every status change
- ✅ Consistent formatting and presentation
- ✅ Validation scores prominently displayed

### For Collaboration
- ✅ GitHub Actions bot handles updates
- ✅ Clear commit history of status changes
- ✅ Manual trigger available if needed
- ✅ Works with pull request workflows

---

## Future Enhancements

### Potential Improvements

1. **Epic Progress Tracking:**
   - Parse `docs/2-planning/epics.md` to count completed stories
   - Update progress automatically: `(3/11 stories)` instead of `(0/11 stories)`

2. **Dynamic Completion Dates:**
   - Calculate estimated completion based on velocity
   - Update dates as stories are completed

3. **Workflow Status Badges:**
   - Generate SVG badges for each phase
   - Display in README with color coding

4. **Notification Integration:**
   - Slack/Discord notifications when phases complete
   - Summary of changes in commit message

5. **Multi-File Updates:**
   - Update other documentation files simultaneously
   - Maintain consistency across all docs

6. **Historical Tracking:**
   - Append status changes to a changelog
   - Track progress over time

---

## Implementation Checklist

- [x] Create Node.js update script with YAML parsing
- [x] Add test mode for safe preview
- [x] Implement workflow metadata mapping
- [x] Add HTML comment markers to README.md
- [x] Create GitHub Actions workflow
- [x] Configure workflow permissions
- [x] Add `[skip ci]` to prevent infinite loops
- [x] Test script locally in both modes
- [x] Verify idempotency (multiple runs)
- [x] Validate YAML syntax
- [x] Create script documentation
- [x] Create implementation guide (this document)
- [x] Add .gitignore for node_modules
- [ ] Test GitHub Actions workflow (requires git repository)
- [ ] Monitor first automated update
- [ ] Verify commit attribution to github-actions bot

---

## References

- **Script:** `.github/scripts/update-readme-status.js`
- **Workflow:** `.github/workflows/update-readme-status.yml`
- **YAML Source:** `docs/bmm-workflow-status.yaml`
- **README Markers:** Lines 508-556 in `README.md`

---

## Questions & Support

For questions or issues:
1. Check troubleshooting section above
2. Review script comments in `update-readme-status.js`
3. Check GitHub Actions logs in repository Actions tab
4. Consult `.github/scripts/README.md` for script usage

---

**Status:** ✅ Implementation Complete  
**Last Updated:** 2025-11-06  
**Next Steps:** Initialize git repository and test GitHub Actions workflow

