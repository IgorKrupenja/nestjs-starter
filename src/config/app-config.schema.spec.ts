import { describe, expect, it } from 'vitest';

import { appConfigSchema } from './app-config.schema.js';

describe('appConfigSchema', () => {
  describe('LOGGER_LOG_LEVELS', () => {
    it('should use default value when not provided', () => {
      const result = appConfigSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      });
      expect((result.value as Record<string, unknown>).LOGGER_LOG_LEVELS).toBe('error,warn,log');
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
        const result = appConfigSchema.validate({
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
          LOGGER_LOG_LEVELS: levels,
        });
        expect(result.error, `"${levels}" should be valid`).toBeUndefined();
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
        const result = appConfigSchema.validate({
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
          LOGGER_LOG_LEVELS: levels,
        });
        expect(result.error, `"${levels}" should be invalid`).toBeDefined();
      });
    });

    it('should reject empty string', () => {
      const result = appConfigSchema.validate({
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        LOGGER_LOG_LEVELS: '',
      });
      expect(result.error).toBeDefined();
    });
  });
});
