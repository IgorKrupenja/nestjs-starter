import { describe, expect, it } from 'vitest';

import { appConfigSchema } from './app-config.schema.js';

describe('appConfigSchema', () => {
  describe('DATABASE_URL', () => {
    it('should require DATABASE_URL', () => {
      const { error } = appConfigSchema.validate({});
      expect(error?.message).toContain('DATABASE_URL');
      expect(error?.message).toContain('required');
    });

    it('should validate DATABASE_URL as URI', () => {
      const { error } = appConfigSchema.validate({
        DATABASE_URL: 'not-a-valid-uri',
      });
      expect(error?.message).toContain('must be a valid uri');
    });

    it('should accept valid PostgreSQL URI', () => {
      const { error } = appConfigSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      });
      expect(error).toBeUndefined();
    });
  });

  describe('LOGGER_LOG_LEVELS', () => {
    it('should use default value when not provided', () => {
      const { value } = appConfigSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      });
      expect(value.LOGGER_LOG_LEVELS).toBe('error,warn,log');
    });

    it('should accept valid log levels', () => {
      const validCombinations = [
        'error',
        'warn',
        'log',
        'debug',
        'verbose',
        'fatal',
        'error,warn',
        'error,warn,log',
        'error,warn,log,debug',
        'log,error,warn,debug,verbose,fatal',
      ];

      validCombinations.forEach((levels) => {
        const { error } = appConfigSchema.validate({
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
          LOGGER_LOG_LEVELS: levels,
        });
        expect(error, `"${levels}" should be valid`).toBeUndefined();
      });
    });

    it('should reject invalid log levels', () => {
      const invalidCombinations = [
        'invalid',
        'error,invalid',
        'info', // not a valid NestJS log level
        'error,info,warn',
        'error, warn', // space after comma
      ];

      invalidCombinations.forEach((levels) => {
        const { error } = appConfigSchema.validate({
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
          LOGGER_LOG_LEVELS: levels,
        });
        expect(error, `"${levels}" should be invalid`).toBeDefined();
      });
    });

    it('should reject empty string', () => {
      const { error } = appConfigSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        LOGGER_LOG_LEVELS: '',
      });
      expect(error).toBeDefined();
    });
  });

  describe('LOGGER_COLORS', () => {
    it('should default to false', () => {
      const { value } = appConfigSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      });
      expect(value.LOGGER_COLORS).toBe(false);
    });

    it('should accept boolean true', () => {
      const { error, value } = appConfigSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        LOGGER_COLORS: true,
      });
      expect(error).toBeUndefined();
      expect(value.LOGGER_COLORS).toBe(true);
    });

    it('should accept boolean false', () => {
      const { error, value } = appConfigSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        LOGGER_COLORS: false,
      });
      expect(error).toBeUndefined();
      expect(value.LOGGER_COLORS).toBe(false);
    });

    it('should reject non-boolean values', () => {
      const { error } = appConfigSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        LOGGER_COLORS: 'yes',
      });
      expect(error).toBeDefined();
      expect(error?.message).toContain('boolean');
    });
  });

  describe('API_DOCUMENTATION_ENABLED', () => {
    it('should default to false', () => {
      const { value } = appConfigSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      });
      expect(value.API_DOCUMENTATION_ENABLED).toBe(false);
    });

    it('should accept boolean values', () => {
      const { error: error1, value: value1 } = appConfigSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        API_DOCUMENTATION_ENABLED: true,
      });
      expect(error1).toBeUndefined();
      expect(value1.API_DOCUMENTATION_ENABLED).toBe(true);

      const { error: error2, value: value2 } = appConfigSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        API_DOCUMENTATION_ENABLED: false,
      });
      expect(error2).toBeUndefined();
      expect(value2.API_DOCUMENTATION_ENABLED).toBe(false);
    });
  });

  describe('NODE_ENV', () => {
    it('should default to development', () => {
      const { value } = appConfigSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      });
      expect(value.NODE_ENV).toBe('development');
    });

    it('should accept valid environments', () => {
      const validEnvs = ['development', 'production', 'test'];

      validEnvs.forEach((env) => {
        const { error, value } = appConfigSchema.validate({
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
          NODE_ENV: env,
        });
        expect(error, `"${env}" should be valid`).toBeUndefined();
        expect(value.NODE_ENV).toBe(env);
      });
    });

    it('should reject invalid environments', () => {
      const { error } = appConfigSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        NODE_ENV: 'staging',
      });
      expect(error).toBeDefined();
      expect(error?.message).toContain('must be one of');
    });
  });

  describe('stripUnknown', () => {
    it('should strip unknown properties', () => {
      const { value } = appConfigSchema.validate(
        {
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
          UNKNOWN_PROPERTY: 'should be stripped',
        },
        { stripUnknown: true },
      );
      expect(value).not.toHaveProperty('UNKNOWN_PROPERTY');
    });
  });
});

