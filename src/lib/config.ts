import { z } from 'zod';

/**
 * Configuration Schema
 * 
 * Validates all environment variables required for the application.
 * Uses Zod for runtime validation with type inference.
 */
export const configSchema = z.object({
  // Database Configuration
  databaseUrl: z.string()
    .url()
    .startsWith('postgresql://', {
      message: 'DATABASE_URL must be a valid PostgreSQL connection string starting with postgresql://'
    })
    .describe('PostgreSQL connection string from Neon'),

  // Authentication Configuration
  allowedEmails: z.string()
    .min(1, { message: 'ALLOWED_EMAILS must not be empty' })
    .transform(s => s.split(',').map(e => e.trim().toLowerCase()))
    .pipe(z.array(z.string().email({ message: 'Each email in ALLOWED_EMAILS must be valid' })))
    .describe('Comma-separated list of allowed email addresses'),

  // Environment Configuration
  nodeEnv: z.enum(['development', 'staging', 'production', 'test'], {
    errorMap: () => ({ message: 'NODE_ENV must be one of: development, staging, production, test' })
  })
    .default('development')
    .describe('Application environment'),

  // Port Configuration
  port: z.string()
    .default('8080')
    .transform(val => {
      const num = Number(val);
      if (isNaN(num)) {
        throw new Error('PORT must be a valid number');
      }
      return num;
    })
    .pipe(
      z.number()
        .int({ message: 'PORT must be an integer' })
        .positive({ message: 'PORT must be positive' })
        .max(65535, { message: 'PORT must be less than or equal to 65535' })
    )
    .describe('Server port number'),

  // Neon Auth Configuration (optional, for Epic 3)
  neonAuthProjectId: z.string()
    .min(1)
    .optional()
    .describe('Neon Auth project ID (Epic 3)'),

  neonAuthSecretKey: z.string()
    .min(1)
    .optional()
    .describe('Neon Auth secret key (Epic 3)'),

  // Runtime Configuration (optional)
  nextPublicApiUrl: z.string()
    .url()
    .optional()
    .describe('Public API URL for client-side requests'),
});

/**
 * Configuration Type
 * 
 * Type-safe configuration object inferred from Zod schema.
 */
export type Config = z.infer<typeof configSchema>;

/**
 * Cached Configuration
 * 
 * Stores validated configuration to avoid re-parsing on every call.
 */
let cachedConfig: Config | null = null;

/**
 * Get Validated Configuration
 * 
 * Validates environment variables using Zod schema and returns type-safe config.
 * Fails fast with detailed error messages if configuration is invalid.
 * Caches result to avoid re-validation on subsequent calls.
 * 
 * @returns {Config} Validated configuration object
 * @throws {Error} If configuration validation fails
 * 
 * @example
 * ```typescript
 * import { getConfig } from '@/lib/config';
 * 
 * const config = getConfig();
 * console.log(config.databaseUrl); // Type-safe access
 * console.log(config.allowedEmails); // string[]
 * ```
 */
export function getConfig(): Config {
  // Return cached config if available
  if (cachedConfig) {
    return cachedConfig;
  }

  // Validate environment variables
  const parsed = configSchema.safeParse({
    databaseUrl: process.env.DATABASE_URL,
    allowedEmails: process.env.ALLOWED_EMAILS,
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    neonAuthProjectId: process.env.NEON_AUTH_PROJECT_ID,
    neonAuthSecretKey: process.env.NEON_AUTH_SECRET_KEY,
    nextPublicApiUrl: process.env.NEXT_PUBLIC_API_URL,
  });

  // Handle validation failure
  if (!parsed.success) {
    const errors = parsed.error.errors
      .map(e => `  ${e.path.join('.')}: ${e.message}`)
      .join('\n');
    
    throw new Error(
      `Configuration validation failed:\n${errors}\n\n` +
      `Please check your environment variables in .env.local (local) or Cloud Run configuration (production).`
    );
  }

  // Cache and return validated config
  cachedConfig = parsed.data;
  return cachedConfig;
}

/**
 * Reset Cached Configuration
 * 
 * Clears cached configuration. Useful for testing.
 * NOT intended for production use.
 */
export function resetConfig(): void {
  cachedConfig = null;
}
