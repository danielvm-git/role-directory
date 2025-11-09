#!/usr/bin/env node

/**
 * Database Migration CLI
 * 
 * Manages database schema migrations across environments.
 * Uses raw SQL files with timestamp-based ordering.
 * 
 * Commands:
 *   up      - Apply pending migrations
 *   down    - Rollback last migration
 *   status  - Show migration status
 *   create  - Create new migration files
 * 
 * Usage:
 *   DATABASE_URL="postgresql://..." node scripts/migrate.js up
 *   npm run migrate:up
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration & Validation
// ============================================================================

// Get command first (before checking DATABASE_URL)
const command = process.argv[2];

// Get migrations directory
const migrationsDir = path.join(__dirname, '..', 'migrations');

// DATABASE_URL is required for all commands except 'create'
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL && command !== 'create') {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('\nUsage:');
  console.error('  DATABASE_URL="postgresql://..." npm run migrate:up');
  process.exit(1);
}

// Warn if running against production
if (DATABASE_URL && (DATABASE_URL.includes('prd') || DATABASE_URL.includes('production'))) {
  console.warn('⚠️  WARNING: Running against PRODUCTION database!');
  console.warn('⚠️  DATABASE_URL:', maskDatabaseUrl(DATABASE_URL));
  console.warn('');
}

// Initialize Neon client (only if DATABASE_URL is set)
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Mask database password in URL for logging
 */
function maskDatabaseUrl(url) {
  return url.replace(/:[^:@]+@/, ':***@');
}

/**
 * Ensure schema_migrations table exists
 */
async function ensureSchemaMigrationsTable() {
  await sql(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      description TEXT
    )
  `);
}

/**
 * Get all applied migrations from database
 */
async function getAppliedMigrations() {
  await ensureSchemaMigrationsTable();
  const rows = await sql('SELECT version, applied_at FROM schema_migrations ORDER BY version');
  return rows;
}

/**
 * Get all migration files from filesystem
 */
function getMigrationFiles() {
  if (!fs.existsSync(migrationsDir)) {
    return [];
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.up.sql'))
    .sort();
  
  return files;
}

/**
 * Validate migration file format
 */
function validateMigrationFile(filename) {
  // Should be: YYYYMMDDHHMMSS_name.up.sql
  const pattern = /^\d{14}_[a-z0-9_]+\.up\.sql$/;
  if (!pattern.test(filename)) {
    console.error(`❌ Invalid migration filename: ${filename}`);
    console.error('   Expected format: YYYYMMDDHHMMSS_name.up.sql');
    return false;
  }
  return true;
}

/**
 * Check for duplicate migration versions
 */
function checkDuplicateVersions(files) {
  const versions = files.map(f => f.replace('.up.sql', ''));
  const duplicates = versions.filter((v, i) => versions.indexOf(v) !== i);
  
  if (duplicates.length > 0) {
    console.error('❌ Duplicate migration versions found:');
    duplicates.forEach(d => console.error(`   - ${d}`));
    return false;
  }
  return true;
}

/**
 * Generate timestamp in YYYYMMDDHHMMSS format
 */
function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// ============================================================================
// Command Handlers
// ============================================================================

/**
 * migrate:up - Apply pending migrations
 */
async function up() {
  console.log('📦 Applying migrations...\n');
  
  // Ensure migrations directory exists
  if (!fs.existsSync(migrationsDir)) {
    console.log('ℹ️  No migrations directory found. Nothing to apply.');
    return;
  }
  
  // Get applied migrations
  const applied = await getAppliedMigrations();
  const appliedVersions = new Set(applied.map(r => r.version));
  
  // Get all migration files
  const files = getMigrationFiles();
  
  if (files.length === 0) {
    console.log('ℹ️  No migration files found. Nothing to apply.');
    return;
  }
  
  // Validate migration files
  for (const file of files) {
    if (!validateMigrationFile(file)) {
      process.exit(1);
    }
  }
  
  // Check for duplicates
  if (!checkDuplicateVersions(files)) {
    process.exit(1);
  }
  
  // Apply pending migrations
  let appliedCount = 0;
  
  for (const file of files) {
    const version = file.replace('.up.sql', '');
    
    if (appliedVersions.has(version)) {
      console.log(`  ✓ ${version} (already applied)`);
      continue;
    }
    
    console.log(`  ⏳ Applying ${version}...`);
    
    // Read migration SQL
    const migrationPath = path.join(migrationsDir, file);
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    
    try {
      // Split SQL into individual statements and execute each
      // Neon serverless driver doesn't support multiple statements in one query
      const statements = migrationSql
        .split(';')
        .map(s => s.trim())
        .filter(s => {
          // Filter out empty statements and comment-only lines
          if (!s || s.length === 0) return false;
          // Remove comment lines but keep statements with inline comments
          const lines = s.split('\n').filter(line => {
            const trimmed = line.trim();
            return trimmed && !trimmed.startsWith('--');
          });
          return lines.length > 0;
        })
        .map(s => {
          // Remove inline comments from statements
          return s.split('\n')
            .map(line => {
              const commentIndex = line.indexOf('--');
              if (commentIndex > 0) {
                return line.substring(0, commentIndex).trim();
              }
              return line.trim().startsWith('--') ? '' : line;
            })
            .filter(line => line)
            .join('\n')
            .trim();
        })
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        if (statement) {
          await sql(statement);
        }
      }
      
      // Record in schema_migrations
      await sql(
        'INSERT INTO schema_migrations (version, description) VALUES ($1, $2)',
        [version, `Migration: ${file}`]
      );
      
      console.log(`  ✅ ${version} applied`);
      appliedCount++;
    } catch (error) {
      console.error(`\n❌ Migration failed: ${version}`);
      console.error(`   Error: ${error.message}`);
      console.error('\n   Migration was NOT recorded in schema_migrations.');
      console.error('   Fix the error and run migrate:up again.');
      process.exit(1);
    }
  }
  
  if (appliedCount === 0) {
    console.log('\n✅ All migrations already applied');
  } else {
    console.log(`\n✅ Successfully applied ${appliedCount} migration(s)`);
  }
}

/**
 * migrate:down - Rollback last migration
 */
async function down() {
  console.log('🔄 Rolling back last migration...\n');
  
  // Get last applied migration
  const result = await sql(`
    SELECT version FROM schema_migrations
    ORDER BY applied_at DESC LIMIT 1
  `);
  
  if (result.length === 0) {
    console.log('ℹ️  No migrations to rollback');
    return;
  }
  
  const version = result[0].version;
  console.log(`  ⏳ Rolling back ${version}...`);
  
  // Find rollback file
  const downFile = path.join(migrationsDir, `${version}.down.sql`);
  
  if (!fs.existsSync(downFile)) {
    console.error(`\n❌ Rollback file not found: ${version}.down.sql`);
    console.error('   Cannot rollback without .down.sql file');
    process.exit(1);
  }
  
  // Read rollback SQL
  const migrationSql = fs.readFileSync(downFile, 'utf-8');
  
  try {
    // Split SQL into individual statements and execute each
    // Neon serverless driver doesn't support multiple statements in one query
    const statements = migrationSql
      .split(';')
      .map(s => s.trim())
      .filter(s => {
        // Filter out empty statements and comment-only lines
        if (!s || s.length === 0) return false;
        // Remove comment lines but keep statements with inline comments
        const lines = s.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed && !trimmed.startsWith('--');
        });
        return lines.length > 0;
      })
      .map(s => {
        // Remove inline comments from statements
        return s.split('\n')
          .map(line => {
            const commentIndex = line.indexOf('--');
            if (commentIndex > 0) {
              return line.substring(0, commentIndex).trim();
            }
            return line.trim().startsWith('--') ? '' : line;
          })
          .filter(line => line)
          .join('\n')
          .trim();
      })
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      if (statement) {
        await sql(statement);
      }
    }
    
    // Remove from schema_migrations
    await sql('DELETE FROM schema_migrations WHERE version = $1', [version]);
    
    console.log(`  ✅ ${version} rolled back\n`);
  } catch (error) {
    console.error(`\n❌ Rollback failed: ${version}`);
    console.error(`   Error: ${error.message}`);
    process.exit(1);
  }
}

/**
 * migrate:status - Show migration status
 */
async function status() {
  // Get applied migrations
  const applied = await getAppliedMigrations();
  const appliedMap = new Map(applied.map(m => [m.version, m.applied_at]));
  
  // Get all migration files
  const files = getMigrationFiles();
  
  console.log('\n📊 Migration Status:\n');
  
  if (files.length === 0) {
    console.log('ℹ️  No migration files found\n');
    return;
  }
  
  for (const file of files) {
    const version = file.replace('.up.sql', '');
    
    if (appliedMap.has(version)) {
      const appliedAt = new Date(appliedMap.get(version)).toISOString();
      console.log(`  ✅ ${version} (applied ${appliedAt})`);
    } else {
      console.log(`  ❌ ${version} (pending)`);
    }
  }
  
  console.log('');
}

/**
 * migrate:create - Create new migration files
 */
async function create() {
  const name = process.argv[3];
  
  if (!name) {
    console.error('❌ Migration name is required');
    console.error('\nUsage:');
    console.error('  npm run migrate:create migration_name');
    console.error('\nExample:');
    console.error('  npm run migrate:create create_users_table');
    process.exit(1);
  }
  
  // Validate name format (lowercase with underscores)
  if (!/^[a-z0-9_]+$/.test(name)) {
    console.error('❌ Invalid migration name');
    console.error('   Name must be lowercase with underscores only');
    console.error('   Example: create_users_table');
    process.exit(1);
  }
  
  // Ensure migrations directory exists
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  // Generate timestamp
  const timestamp = generateTimestamp();
  const version = `${timestamp}_${name}`;
  
  // Create up migration
  const upFile = path.join(migrationsDir, `${version}.up.sql`);
  const upContent = `-- Up migration: ${name}
-- Created: ${new Date().toISOString()}
-- Add your SQL statements here

-- Example:
-- CREATE TABLE IF NOT EXISTS example (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );
`;
  
  fs.writeFileSync(upFile, upContent);
  
  // Create down migration
  const downFile = path.join(migrationsDir, `${version}.down.sql`);
  const downContent = `-- Down migration: ${name}
-- Created: ${new Date().toISOString()}
-- Add your rollback SQL statements here

-- Example:
-- DROP TABLE IF EXISTS example;
`;
  
  fs.writeFileSync(downFile, downContent);
  
  console.log(`✅ Created migration: ${version}`);
  console.log(`   - ${upFile}`);
  console.log(`   - ${downFile}`);
  console.log('\nNext steps:');
  console.log('  1. Edit the .up.sql file with your schema changes');
  console.log('  2. Edit the .down.sql file with the rollback logic');
  console.log('  3. Run: npm run migrate:up');
}

// ============================================================================
// Command Dispatcher
// ============================================================================

(async () => {
  try {
    switch (command) {
      case 'up':
        await up();
        break;
      
      case 'down':
        await down();
        break;
      
      case 'status':
        await status();
        break;
      
      case 'create':
        await create();
        break;
      
      default:
        console.error('❌ Unknown command:', command || '(none)');
        console.error('\nAvailable commands:');
        console.error('  up      - Apply pending migrations');
        console.error('  down    - Rollback last migration');
        console.error('  status  - Show migration status');
        console.error('  create  - Create new migration files');
        console.error('\nUsage:');
        console.error('  npm run migrate:up');
        console.error('  npm run migrate:down');
        console.error('  npm run migrate:status');
        console.error('  npm run migrate:create migration_name');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
})();

