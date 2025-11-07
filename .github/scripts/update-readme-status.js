#!/usr/bin/env node

/**
 * Update README.md with current project status from YAML
 * 
 * Usage:
 *   node update-readme-status.js --test    # Updates README.test.md
 *   node update-readme-status.js           # Updates README.md
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Check if running in test mode
const isTestMode = process.argv.includes('--test');

// File paths (relative to project root)
const projectRoot = path.join(__dirname, '../..');
const yamlPath = path.join(projectRoot, 'docs/bmm-workflow-status.yaml');
const epicsPath = path.join(projectRoot, 'docs/2-planning/epics.md');
const readmePath = isTestMode 
  ? path.join(projectRoot, 'README.test.md')
  : path.join(projectRoot, 'README.md');

// Story counts per epic (from epics.md)
const EPIC_STORY_COUNTS = {
  'epic1': 11,
  'epic2': 6,
  'epic3': 8,
  'epic4': 7
};

/**
 * Read and parse YAML file
 */
function readYamlFile(filePath) {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return yaml.load(fileContents);
  } catch (error) {
    console.error(`Error reading YAML file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Read README file
 */
function readReadmeFile(filePath) {
  try {
    if (!fs.existsSync(filePath) && isTestMode) {
      // Create test file with markers if it doesn't exist
      return `<!-- STATUS_START -->
## Project Status & Roadmap

[Content will be auto-generated here]

<!-- STATUS_END -->`;
    }
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading README file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Write README file
 */
function writeReadmeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Successfully updated ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`Error writing README file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Map workflow keys to display names and metadata
 */
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
  'validate-prd': {
    phase: 'Planning',
    display: null, // Skip, included in PRD display
    validation: '99.6%'
  },
  'create-epics-and-stories': {
    phase: 'Planning',
    display: 'Epics defined',
    validation: null
  },
  'create-architecture': {
    phase: 'Solutioning',
    display: 'Architecture designed',
    validation: '100/100'
  },
  'validate-architecture': {
    phase: 'Solutioning',
    display: null, // Skip, included in architecture display
    validation: null
  },
  'solutioning-gate-check': {
    phase: 'Solutioning',
    display: 'Implementation readiness verified',
    validation: '98/100'
  }
};

/**
 * Generate completed phases section
 */
function generateCompletedPhases(workflowStatus) {
  const phases = {
    'Discovery': [],
    'Planning': [],
    'Solutioning': []
  };

  // Group completed workflows by phase
  for (const [key, value] of Object.entries(workflowStatus)) {
    const metadata = WORKFLOW_METADATA[key];
    if (!metadata || !metadata.display) continue;
    
    // Check if completed (has a file path, not "required", "optional", etc.)
    if (typeof value === 'string' && value.startsWith('docs/')) {
      phases[metadata.phase].push({
        display: metadata.display,
        validation: metadata.validation
      });
    }
  }

  let markdown = '### ✅ Completed Phases\n\n';
  
  // Discovery
  if (phases.Discovery.length > 0) {
    const item = phases.Discovery[0];
    markdown += `- [x] **Discovery** - ${item.display}\n`;
  }
  
  // Planning
  if (phases.Planning.length > 0) {
    const displays = phases.Planning.map(p => p.display);
    const hasValidation = phases.Planning.find(p => p.validation);
    markdown += `- [x] **Planning** - ${displays.join(' & ')}`;
    if (hasValidation) {
      markdown += ` (${hasValidation.validation} validation)`;
    }
    markdown += '\n';
  }
  
  // Solutioning
  if (phases.Solutioning.length > 0) {
    const archItem = phases.Solutioning.find(p => p.display.includes('Architecture'));
    const gateItem = phases.Solutioning.find(p => p.display.includes('readiness'));
    
    if (archItem) {
      markdown += `- [x] **Solutioning** - ${archItem.display}`;
      if (archItem.validation) {
        markdown += ` (${archItem.validation} score)`;
      }
      markdown += '\n';
    }
  }
  
  return markdown;
}

/**
 * Generate current phase section
 */
function generateCurrentPhase() {
  let markdown = '### 🔄 Current Phase: Implementation\n\n';
  markdown += '**MVP Goal:** ONE feature through 3 environments (dev → stg → prd)\n\n';
  markdown += '**Progress:**\n';
  markdown += '- [ ] Epic 1: Foundation & Deployment Pipeline (0/11 stories)\n';
  markdown += '- [ ] Epic 2: Database Infrastructure (0/6 stories)\n';
  markdown += '- [ ] Epic 3: Authentication & Access Control (0/8 stories)\n';
  markdown += '- [ ] Epic 4: Hello World Dashboard (0/7 stories)\n\n';
  markdown += '**Estimated Completion:** 7-12 days (based on story breakdown)\n';
  
  return markdown;
}

/**
 * Generate future phases section
 */
function generateFuturePhases() {
  let markdown = '### 🔮 Future Phases\n\n';
  markdown += '**Phase 2: Testing & Quality** (Deferred from MVP)\n';
  markdown += '- Unit tests (Vitest, 70%+ coverage)\n';
  markdown += '- API integration tests (100% coverage)\n';
  markdown += '- E2E tests (Playwright, 5-10 scenarios)\n\n';
  
  markdown += '**Phase 3: Admin Interface**\n';
  markdown += '- Admin UI for code generation\n';
  markdown += '- Usage analytics per code\n';
  markdown += '- Access logs dashboard\n\n';
  
  markdown += '**Phase 4: Additional Dashboard Pages**\n';
  markdown += '- Workflow status page\n';
  markdown += '- Sprint status page\n\n';
  
  markdown += '**Phase 6: Core Application Features**\n';
  markdown += '- Role catalog display\n';
  markdown += '- Pricing information by region\n';
  markdown += '- Career track visualization\n';
  markdown += '- Search and filtering\n\n';
  
  markdown += '**Phase 7: Public Launch**\n';
  markdown += '- Remove invitation codes (or make optional)\n';
  markdown += '- Public marketing site\n';
  markdown += '- Full feature set\n';
  
  return markdown;
}

/**
 * Generate complete status section
 */
function generateStatusSection(yamlData) {
  const workflowStatus = yamlData.workflow_status || {};
  
  let markdown = '## Project Status & Roadmap\n\n';
  markdown += generateCompletedPhases(workflowStatus);
  markdown += '\n';
  markdown += generateCurrentPhase();
  markdown += '\n';
  markdown += generateFuturePhases();
  
  return markdown;
}

/**
 * Update README with new status section
 */
function updateReadme(readmeContent, statusSection) {
  const startMarker = '<!-- STATUS_START -->';
  const endMarker = '<!-- STATUS_END -->';
  
  const startIndex = readmeContent.indexOf(startMarker);
  const endIndex = readmeContent.indexOf(endMarker);
  
  if (startIndex === -1 || endIndex === -1) {
    console.error('Error: Could not find STATUS_START or STATUS_END markers in README');
    console.error('Please add these markers around the Project Status section:');
    console.error('  <!-- STATUS_START -->');
    console.error('  [Project Status content]');
    console.error('  <!-- STATUS_END -->');
    process.exit(1);
  }
  
  // Replace content between markers
  const before = readmeContent.substring(0, startIndex + startMarker.length);
  const after = readmeContent.substring(endIndex);
  
  return `${before}\n${statusSection}\n${after}`;
}

/**
 * Main function
 */
function main() {
  console.log(isTestMode ? '🧪 Running in TEST mode' : '🚀 Running in PRODUCTION mode');
  console.log(`Reading YAML from: ${yamlPath}`);
  console.log(`Updating: ${readmePath}\n`);
  
  // Read YAML file
  const yamlData = readYamlFile(yamlPath);
  
  // Generate new status section
  const statusSection = generateStatusSection(yamlData);
  
  // Read current README
  const readmeContent = readReadmeFile(readmePath);
  
  // Update README
  const updatedReadme = updateReadme(readmeContent, statusSection);
  
  // Write updated README
  writeReadmeFile(readmePath, updatedReadme);
  
  console.log('\n📊 Generated status section:');
  console.log('─'.repeat(60));
  console.log(statusSection);
  console.log('─'.repeat(60));
  
  if (isTestMode) {
    console.log('\n✨ Test complete! Review README.test.md to see the output.');
    console.log('   If it looks good, run without --test flag to update real README.md');
  }
}

// Run the script
main();

