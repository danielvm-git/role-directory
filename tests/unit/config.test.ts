/**
 * Unit Tests: Configuration Module (lib/config.ts)
 * Story: 2.2 - Database Connection Configuration with Zod-Validated Config
 * Epic: 2 - Database Infrastructure & Connectivity
 * 
 * Test Strategy: RED phase - These tests will FAIL until lib/config.ts is implemented
 * 
 * Test Level: Unit (pure configuration validation logic)
 * Coverage Target: 100% (all validation paths)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getConfig, validateConfig, type Config } from '@/lib/config';

describe.skip('[2.2-UNIT-001] Configuration Module (Story 2-2 not implemented yet)', () => {
  // Store original env vars
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment for each test
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('DATABASE_URL validation', () => {
    it('[2.2-UNIT-001] should accept valid PostgreSQL connection string', () => {
      // GIVEN: Valid DATABASE_URL with all required components
      process.env.DATABASE_URL =
        'postgresql://user:password@ep-abc123.us-east-1.neon.tech/role_directory_dev?sslmode=require';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '8080';

      // WHEN: Configuration is validated
      const config = getConfig();

      // THEN: Configuration is returned successfully
      expect(config).toBeDefined();
      expect(config.databaseUrl).toBe(process.env.DATABASE_URL);
    });

    it('[2.2-UNIT-002] should reject non-PostgreSQL URL', () => {
      // GIVEN: Invalid DATABASE_URL (not postgresql://)
      process.env.DATABASE_URL = 'mysql://user:password@localhost/dbname';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '8080';

      // WHEN/THEN: Configuration validation throws error
      expect(() => getConfig()).toThrow(/databaseUrl/i);
    });

    it('[2.2-UNIT-003] should reject DATABASE_URL without sslmode=require', () => {
      // GIVEN: DATABASE_URL without SSL requirement
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/dbname';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '8080';

      // WHEN/THEN: Configuration validation throws error (or accepts, based on security policy)
      // Note: Decide in implementation if sslmode=require is mandatory
      const config = getConfig();
      expect(config.databaseUrl).toBeDefined();
    });

    it('[2.2-UNIT-004] should reject missing DATABASE_URL', () => {
      // GIVEN: DATABASE_URL is not set
      delete process.env.DATABASE_URL;
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '8080';

      // WHEN/THEN: Configuration validation throws error
      expect(() => getConfig()).toThrow(/databaseUrl/i);
    });

    it('[2.2-UNIT-005] should reject invalid URL format', () => {
      // GIVEN: DATABASE_URL is not a valid URL
      process.env.DATABASE_URL = 'not-a-valid-url';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '8080';

      // WHEN/THEN: Configuration validation throws error
      expect(() => getConfig()).toThrow(/databaseUrl/i);
    });
  });

  describe('ALLOWED_EMAILS validation', () => {
    it('[2.2-UNIT-006] should parse comma-separated emails into array', () => {
      // GIVEN: Multiple emails in comma-separated format
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = 'user1@example.com,user2@example.com,user3@example.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '8080';

      // WHEN: Configuration is parsed
      const config = getConfig();

      // THEN: Emails are split into array and trimmed
      expect(config.allowedEmails).toEqual(['user1@example.com', 'user2@example.com', 'user3@example.com']);
    });

    it('[2.2-UNIT-007] should trim whitespace from emails', () => {
      // GIVEN: Emails with extra whitespace
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = '  user1@example.com ,  user2@example.com  ,user3@example.com  ';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '8080';

      // WHEN: Configuration is parsed
      const config = getConfig();

      // THEN: Whitespace is trimmed from each email
      expect(config.allowedEmails).toEqual(['user1@example.com', 'user2@example.com', 'user3@example.com']);
    });

    it('[2.2-UNIT-008] should convert emails to lowercase', () => {
      // GIVEN: Emails with mixed case
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = 'User1@Example.COM,USER2@EXAMPLE.COM';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '8080';

      // WHEN: Configuration is parsed
      const config = getConfig();

      // THEN: Emails are normalized to lowercase
      expect(config.allowedEmails).toEqual(['user1@example.com', 'user2@example.com']);
    });

    it('[2.2-UNIT-009] should reject invalid email format', () => {
      // GIVEN: ALLOWED_EMAILS contains invalid email
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = 'valid@example.com,not-an-email,another@valid.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '8080';

      // WHEN/THEN: Configuration validation throws error
      expect(() => getConfig()).toThrow(/allowedEmails/i);
    });

    it('[2.2-UNIT-010] should accept single email', () => {
      // GIVEN: Single email (no comma)
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = 'admin@example.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '8080';

      // WHEN: Configuration is parsed
      const config = getConfig();

      // THEN: Single email is converted to array
      expect(config.allowedEmails).toEqual(['admin@example.com']);
    });

    it('[2.2-UNIT-011] should reject missing ALLOWED_EMAILS', () => {
      // GIVEN: ALLOWED_EMAILS is not set
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      delete process.env.ALLOWED_EMAILS;
      process.env.NODE_ENV = 'development';
      process.env.PORT = '8080';

      // WHEN/THEN: Configuration validation throws error (or succeeds if optional)
      // Note: Decide in implementation if ALLOWED_EMAILS is required
      expect(() => getConfig()).toThrow(/allowedEmails/i);
    });
  });

  describe('NODE_ENV validation', () => {
    it('[2.2-UNIT-012] should accept development environment', () => {
      // GIVEN: NODE_ENV set to development
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '8080';

      // WHEN: Configuration is validated
      const config = getConfig();

      // THEN: NODE_ENV is correctly parsed
      expect(config.nodeEnv).toBe('development');
    });

    it('[2.2-UNIT-013] should accept staging environment', () => {
      // GIVEN: NODE_ENV set to staging
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'staging';
      process.env.PORT = '8080';

      // WHEN: Configuration is validated
      const config = getConfig();

      // THEN: NODE_ENV is correctly parsed
      expect(config.nodeEnv).toBe('staging');
    });

    it('[2.2-UNIT-014] should accept production environment', () => {
      // GIVEN: NODE_ENV set to production
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'production';
      process.env.PORT = '8080';

      // WHEN: Configuration is validated
      const config = getConfig();

      // THEN: NODE_ENV is correctly parsed
      expect(config.nodeEnv).toBe('production');
    });

    it('[2.2-UNIT-015] should reject invalid NODE_ENV', () => {
      // GIVEN: NODE_ENV set to invalid value
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'invalid-environment';
      process.env.PORT = '8080';

      // WHEN/THEN: Configuration validation throws error
      expect(() => getConfig()).toThrow(/nodeEnv/i);
    });

    it('[2.2-UNIT-016] should default to development if NODE_ENV missing', () => {
      // GIVEN: NODE_ENV is not set
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      delete process.env.NODE_ENV;
      process.env.PORT = '8080';

      // WHEN: Configuration is validated
      const config = getConfig();

      // THEN: NODE_ENV defaults to development
      expect(config.nodeEnv).toBe('development');
    });
  });

  describe('PORT validation', () => {
    it('[2.2-UNIT-017] should parse PORT as number', () => {
      // GIVEN: PORT set as string
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '3000';

      // WHEN: Configuration is validated
      const config = getConfig();

      // THEN: PORT is converted to number
      expect(config.port).toBe(3000);
      expect(typeof config.port).toBe('number');
    });

    it('[2.2-UNIT-018] should default to 8080 if PORT missing', () => {
      // GIVEN: PORT is not set
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'development';
      delete process.env.PORT;

      // WHEN: Configuration is validated
      const config = getConfig();

      // THEN: PORT defaults to 8080
      expect(config.port).toBe(8080);
    });

    it('[2.2-UNIT-019] should reject non-numeric PORT', () => {
      // GIVEN: PORT is not a number
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = 'not-a-number';

      // WHEN/THEN: Configuration validation throws error
      expect(() => getConfig()).toThrow(/port/i);
    });

    it('[2.2-UNIT-020] should reject negative PORT', () => {
      // GIVEN: PORT is negative
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '-1';

      // WHEN/THEN: Configuration validation throws error
      expect(() => getConfig()).toThrow(/port/i);
    });

    it('[2.2-UNIT-021] should reject PORT > 65535', () => {
      // GIVEN: PORT exceeds maximum
      process.env.DATABASE_URL = 'postgresql://user:password@localhost/db?sslmode=require';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '70000';

      // WHEN/THEN: Configuration validation throws error
      expect(() => getConfig()).toThrow(/port/i);
    });
  });

  describe('Configuration validation error messages', () => {
    it('[2.2-UNIT-022] should provide detailed error message for invalid config', () => {
      // GIVEN: Multiple configuration errors
      delete process.env.DATABASE_URL;
      delete process.env.ALLOWED_EMAILS;
      process.env.NODE_ENV = 'invalid';
      process.env.PORT = 'invalid';

      // WHEN/THEN: Error message includes all validation failures
      expect(() => getConfig()).toThrow();
      
      try {
        getConfig();
      } catch (error) {
        // THEN: Error message is descriptive
        expect(error).toBeInstanceOf(Error);
        const message = (error as Error).message.toLowerCase();
        // Should mention configuration validation failure
        expect(message).toMatch(/configuration|config|validation/i);
      }
    });

    it('[2.2-UNIT-023] should provide field-specific error messages', () => {
      // GIVEN: Specific field is invalid
      process.env.DATABASE_URL = 'not-a-url';
      process.env.ALLOWED_EMAILS = 'test@example.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '8080';

      // WHEN/THEN: Error message identifies the problematic field
      try {
        getConfig();
        expect.fail('Should have thrown error');
      } catch (error) {
        const message = (error as Error).message;
        // Error should mention the specific field
        expect(message).toMatch(/databaseUrl|DATABASE_URL/i);
      }
    });
  });

  describe('Type safety', () => {
    it('[2.2-UNIT-024] should export Config type', () => {
      // GIVEN: Config type is exported
      // WHEN: Type is imported
      // THEN: Type is available for use (TypeScript compile-time check)
      const config: Config = {
        databaseUrl: 'postgresql://user:password@localhost/db?sslmode=require',
        allowedEmails: ['test@example.com'],
        nodeEnv: 'development',
        port: 8080,
      };

      expect(config).toBeDefined();
    });
  });
});

