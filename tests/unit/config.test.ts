import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getConfig, resetConfig, type Config } from '@/lib/config';

describe('Configuration Module', () => {
  // Store original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset module state before each test
    resetConfig();
    
    // Reset environment variables
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  describe('getConfig() - Valid Configuration', () => {
    it('should return valid config with all required fields', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname?sslmode=require';
      process.env.ALLOWED_EMAILS = 'user1@example.com,user2@example.com';
      process.env.NODE_ENV = 'development';
      process.env.PORT = '3000';

      // Act
      const config = getConfig();

      // Assert
      expect(config).toBeDefined();
      expect(config.databaseUrl).toBe('postgresql://user:pass@host.neon.tech/dbname?sslmode=require');
      expect(config.allowedEmails).toEqual(['user1@example.com', 'user2@example.com']);
      expect(config.nodeEnv).toBe('development');
      expect(config.port).toBe(3000);
    });

    it('should transform and lowercase emails correctly', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname';
      process.env.ALLOWED_EMAILS = 'User1@Example.COM , User2@Example.COM ';

      // Act
      const config = getConfig();

      // Assert
      expect(config.allowedEmails).toEqual(['user1@example.com', 'user2@example.com']);
    });

    it('should use default values for optional fields', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname';
      process.env.ALLOWED_EMAILS = 'user@example.com';
      // NODE_ENV and PORT not provided (but NODE_ENV may be 'test' in test environment)
      delete process.env.PORT; // Ensure PORT is not set

      // Act
      const config = getConfig();

      // Assert
      // NODE_ENV defaults to 'development' if not set, but in test env it's 'test'
      expect(['development', 'test']).toContain(config.nodeEnv);
      expect(config.port).toBe(8080); // default
    });

    it('should parse PORT from string to number', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname';
      process.env.ALLOWED_EMAILS = 'user@example.com';
      process.env.PORT = '9000';

      // Act
      const config = getConfig();

      // Assert
      expect(config.port).toBe(9000);
      expect(typeof config.port).toBe('number');
    });

    it('should cache configuration on subsequent calls', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname';
      process.env.ALLOWED_EMAILS = 'user@example.com';

      // Act
      const config1 = getConfig();
      process.env.DATABASE_URL = 'postgresql://different:url@host.neon.tech/other';
      const config2 = getConfig();

      // Assert - should return cached config, not re-parse
      expect(config1).toBe(config2); // Same reference
      expect(config2.databaseUrl).toBe('postgresql://user:pass@host.neon.tech/dbname');
    });
  });

  describe('getConfig() - Invalid Configuration', () => {
    it('should throw error when DATABASE_URL is missing', () => {
      // Arrange
      delete process.env.DATABASE_URL; // Ensure it's not set
      process.env.ALLOWED_EMAILS = 'user@example.com';

      // Act & Assert
      expect(() => getConfig()).toThrow('Configuration validation failed');
      expect(() => getConfig()).toThrow('databaseUrl');
    });

    it('should throw error when DATABASE_URL is not a valid URL', () => {
      // Arrange
      process.env.DATABASE_URL = 'not-a-valid-url';
      process.env.ALLOWED_EMAILS = 'user@example.com';

      // Act & Assert
      expect(() => getConfig()).toThrow('Configuration validation failed');
    });

    it('should throw error when DATABASE_URL does not start with postgresql://', () => {
      // Arrange
      process.env.DATABASE_URL = 'mysql://user:pass@host.com/db';
      process.env.ALLOWED_EMAILS = 'user@example.com';

      // Act & Assert
      expect(() => getConfig()).toThrow('Configuration validation failed');
      expect(() => getConfig()).toThrow('postgresql://');
    });

    it('should throw error when ALLOWED_EMAILS is missing', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname';
      delete process.env.ALLOWED_EMAILS; // Ensure it's not set

      // Act & Assert
      expect(() => getConfig()).toThrow('Configuration validation failed');
      expect(() => getConfig()).toThrow('allowedEmails');
    });

    it('should throw error when ALLOWED_EMAILS contains invalid email', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname';
      process.env.ALLOWED_EMAILS = 'not-an-email';

      // Act & Assert
      expect(() => getConfig()).toThrow('Configuration validation failed');
    });

    it('should throw error when NODE_ENV is invalid', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname';
      process.env.ALLOWED_EMAILS = 'user@example.com';
      process.env.NODE_ENV = 'invalid-env';

      // Act & Assert
      expect(() => getConfig()).toThrow('Configuration validation failed');
    });

    it('should throw error when PORT is not a number', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname';
      process.env.ALLOWED_EMAILS = 'user@example.com';
      process.env.PORT = 'not-a-number';

      // Act & Assert
      expect(() => getConfig()).toThrow('PORT must be a valid number');
    });

    it('should throw error when PORT is out of range', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname';
      process.env.ALLOWED_EMAILS = 'user@example.com';
      process.env.PORT = '99999'; // > 65535

      // Act & Assert
      expect(() => getConfig()).toThrow('Configuration validation failed');
    });

    it('should throw error when PORT is negative', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname';
      process.env.ALLOWED_EMAILS = 'user@example.com';
      process.env.PORT = '-1';

      // Act & Assert
      expect(() => getConfig()).toThrow('Configuration validation failed');
    });
  });

  describe('getConfig() - Optional Fields', () => {
    it('should accept optional Neon Auth fields', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname';
      process.env.ALLOWED_EMAILS = 'user@example.com';
      process.env.NEON_AUTH_PROJECT_ID = 'project-123';
      process.env.NEON_AUTH_SECRET_KEY = 'secret-key-456';

      // Act
      const config = getConfig();

      // Assert
      expect(config.neonAuthProjectId).toBe('project-123');
      expect(config.neonAuthSecretKey).toBe('secret-key-456');
    });

    it('should accept optional NEXT_PUBLIC_API_URL', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname';
      process.env.ALLOWED_EMAILS = 'user@example.com';
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

      // Act
      const config = getConfig();

      // Assert
      expect(config.nextPublicApiUrl).toBe('http://localhost:3000');
    });

    it('should allow optional fields to be undefined', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname';
      process.env.ALLOWED_EMAILS = 'user@example.com';
      // No optional fields set

      // Act
      const config = getConfig();

      // Assert
      expect(config.neonAuthProjectId).toBeUndefined();
      expect(config.neonAuthSecretKey).toBeUndefined();
      expect(config.nextPublicApiUrl).toBeUndefined();
    });
  });

  describe('resetConfig()', () => {
    it('should clear cached configuration', () => {
      // Arrange
      process.env.DATABASE_URL = 'postgresql://user:pass@host.neon.tech/dbname';
      process.env.ALLOWED_EMAILS = 'user@example.com';
      const config1 = getConfig();

      // Act
      resetConfig();
      process.env.DATABASE_URL = 'postgresql://new:url@host.neon.tech/other';
      const config2 = getConfig();

      // Assert - should get new config after reset
      expect(config1.databaseUrl).not.toBe(config2.databaseUrl);
      expect(config2.databaseUrl).toBe('postgresql://new:url@host.neon.tech/other');
    });
  });
});
