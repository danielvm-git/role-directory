import { neon } from '@neondatabase/serverless';
import { getConfig } from '@/lib/config';

/**
 * Database Connection Module
 * 
 * Provides database query functions using Neon serverless driver.
 * Uses HTTP-based connection (stateless, no persistent connections).
 * Handles Neon auto-suspend/resume automatically.
 */

// Get validated configuration
const config = getConfig();

// Initialize Neon client (HTTP-based, stateless)
// No connection pooling needed - handled by Neon driver
const sql = neon(config.databaseUrl);

/**
 * Query Database
 * 
 * Executes parameterized SQL queries via Neon HTTP driver.
 * Logs slow queries (>200ms) for performance monitoring.
 * Sanitizes errors to prevent information leakage.
 * 
 * @template T - Result row type
 * @param {string} text - SQL query text with $1, $2, etc. placeholders
 * @param {any[]} params - Optional query parameters
 * @returns {Promise<T[]>} Array of result rows
 * @throws {Error} Generic "Database query failed" error (sanitized)
 * 
 * @example
 * ```typescript
 * // Simple query
 * const version = await query('SELECT version()');
 * 
 * // Parameterized query (prevents SQL injection)
 * const users = await query<User>(
 *   'SELECT * FROM users WHERE email = $1',
 *   ['user@example.com']
 * );
 * 
 * // Multiple parameters
 * const profiles = await query<Profile>(
 *   'SELECT * FROM role_profiles WHERE career_path_id = $1 AND role_name ILIKE $2',
 *   [5, '%engineer%']
 * );
 * ```
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const start = Date.now();

  try {
    // Execute query via Neon HTTP driver
    const result = await sql(text, params);
    const duration = Date.now() - start;

    // Log slow queries (>200ms threshold)
    if (duration > 200) {
      console.warn('[DB] Slow query detected:', {
        duration: `${duration}ms`,
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        timestamp: new Date().toISOString(),
      });
    }

    return result as T[];
  } catch (error) {
    // Log full error details server-side for debugging
    console.error('[DB] Query error:', {
      query: text,
      params: params || [],
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Throw sanitized error (don't expose database details to client)
    throw new Error('Database query failed');
  }
}

/**
 * Query Single Row
 * 
 * Helper function for queries expected to return a single row.
 * Returns first result or null if no rows found.
 * 
 * @template T - Result row type
 * @param {string} text - SQL query text
 * @param {any[]} params - Optional query parameters
 * @returns {Promise<T | null>} First result row or null
 * 
 * @example
 * ```typescript
 * // Get user by ID
 * const user = await queryOne<User>(
 *   'SELECT * FROM users WHERE id = $1',
 *   [userId]
 * );
 * 
 * if (user) {
 *   console.log(user.email);
 * } else {
 *   console.log('User not found');
 * }
 * ```
 */
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const results = await query<T>(text, params);
  return results.length > 0 ? results[0] : null;
}
