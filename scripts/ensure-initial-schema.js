#!/usr/bin/env node

/**
 * Ensure Initial Schema Migration
 * 
 * This script ensures the initial_schema migration is properly tracked.
 * Safe to run multiple times - idempotent.
 * 
 * Usage:
 *   node scripts/ensure-initial-schema.js
 * 
 * This is useful after running tests that might affect migration tracking.
 */

import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function main() {
  try {
    // 1. Ensure schema_migrations table exists
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        description TEXT
      )
    `;

    // 2. Find the migration file
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migrationsDir);
    const upFile = files.find(f => f.includes('initial_schema') && f.endsWith('.up.sql'));

    if (!upFile) {
      console.error('❌ initial_schema migration file not found');
      process.exit(1);
    }

    const version = upFile.replace('.up.sql', '');

    // 3. Check if already recorded
    const existing = await sql`
      SELECT version FROM schema_migrations WHERE version = ${version}
    `;

    if (existing.length > 0) {
      console.log('✅ initial_schema already tracked');
      return;
    }

    // 4. Verify periodic_table exists with data
    try {
      const tableCheck = await sql`
        SELECT COUNT(*) as count FROM periodic_table
      `;

      const count = parseInt(tableCheck[0].count);
      if (count !== 118) {
        console.error(`⚠️  Warning: Expected 118 elements, found ${count}`);
      }
    } catch (error) {
      console.error('❌ periodic_table does not exist or is not accessible');
      console.error('   Run the migration first: npm run migrate:up');
      process.exit(1);
    }

    // 5. Record the migration
    await sql`
      INSERT INTO schema_migrations (version, description) 
      VALUES (${version}, 'Initial schema - periodic_table from Neon sample data')
    `;

    console.log(`✅ initial_schema migration tracked: ${version}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

