/**
 * Vitest Setup File
 * 
 * Runs before all tests for global configuration
 */

import '@testing-library/jest-dom';
import { config } from 'dotenv';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';

// Load .env.local for testing (enables database tests)
config({ path: path.resolve(process.cwd(), '.env.local') });

// Extend expect matchers
import { expect, beforeAll, beforeEach, afterEach } from 'vitest';

// Global setup: Ensure initial_schema migration is tracked if periodic_table exists
// This prevents migrate:up from trying to re-apply it during integration tests
beforeAll(async () => {
  if (process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      
      // Check if periodic_table exists
      const tableCheck = await sql`SELECT 1 FROM periodic_table LIMIT 1`;
      if (tableCheck.length > 0) {
        // periodic_table exists, ensure migration is tracked
        await sql`
          CREATE TABLE IF NOT EXISTS schema_migrations (
            version VARCHAR(255) PRIMARY KEY,
            applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            description TEXT
          )
        `;
        
        const existing = await sql`
          SELECT version FROM schema_migrations WHERE version LIKE '%initial_schema%'
        `;
        
        if (existing.length === 0) {
          // Find the actual migration version
          const migrationsDir = path.join(process.cwd(), 'migrations');
          const files = fs.readdirSync(migrationsDir);
          const initialFile = files.find(f => f.includes('initial_schema') && f.endsWith('.up.sql'));
          
          if (initialFile) {
            const version = initialFile.replace('.up.sql', '');
            await sql`
              INSERT INTO schema_migrations (version, description)
              VALUES (${version}, 'Initial schema - periodic_table (pre-existing)')
              ON CONFLICT (version) DO NOTHING
            `;
            console.log('✅ [Test Setup] initial_schema migration tracked');
          }
        }
      }
    } catch (error) {
      // Ignore if periodic_table doesn't exist yet or DATABASE_URL not configured
    }
  }
});

// Global test setup (if needed)
beforeEach(() => {
  // Reset mocks, clear state, etc.
});

afterEach(() => {
  // Cleanup after each test
});

