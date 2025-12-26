import Joi from 'joi';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ConfigUtil } from './config.util';

describe('ConfigUtil', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validate', () => {
    it('should validate and return valid configuration', () => {
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'development';

      const schema = Joi.object({
        PORT: Joi.string().required(),
        NODE_ENV: Joi.string().required(),
      });

      const result = ConfigUtil.validate(schema);

      expect(result).toEqual({
        PORT: '3000',
        NODE_ENV: 'development',
      });
    });

    it('should strip unknown properties', () => {
      process.env.PORT = '3000';
      process.env.UNKNOWN_FIELD = 'should-be-removed';

      const schema = Joi.object({
        PORT: Joi.string().required(),
      });

      const result = ConfigUtil.validate(schema);

      expect(result).toEqual({
        PORT: '3000',
      });
      expect(result).not.toHaveProperty('UNKNOWN_FIELD');
    });

    it('should throw error when required field is missing', () => {
      const schema = Joi.object({
        REQUIRED_FIELD: Joi.string().required(),
      });

      expect(() => ConfigUtil.validate(schema)).toThrow(
        /Config validation error:.*REQUIRED_FIELD.*required/,
      );
    });

    it('should throw error when validation fails', () => {
      process.env.PORT = 'invalid-number';

      const schema = Joi.object({
        PORT: Joi.number().required(),
      });

      expect(() => ConfigUtil.validate(schema)).toThrow(/Config validation error:/);
    });

    it('should handle complex validation schemas', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      process.env.PORT = '3000';
      process.env.ENABLE_FEATURE = 'true';

      const schema = Joi.object({
        DATABASE_URL: Joi.string().uri().required(),
        PORT: Joi.string().pattern(/^\d+$/).required(),
        ENABLE_FEATURE: Joi.string().valid('true', 'false').required(),
      });

      const result = ConfigUtil.validate(schema);

      expect(result).toEqual({
        DATABASE_URL: 'postgresql://localhost:5432/test',
        PORT: '3000',
        ENABLE_FEATURE: 'true',
      });
    });

    it('should return empty object for empty schema', () => {
      const schema = Joi.object({});

      const result = ConfigUtil.validate(schema);

      expect(result).toEqual({});
    });

    it('should handle optional fields', () => {
      process.env.REQUIRED_FIELD = 'value';

      const schema = Joi.object({
        REQUIRED_FIELD: Joi.string().required(),
        OPTIONAL_FIELD: Joi.string().optional(),
      });

      const result = ConfigUtil.validate(schema);

      expect(result).toEqual({
        REQUIRED_FIELD: 'value',
      });
    });

    it('should handle default values', () => {
      const schema = Joi.object({
        PORT: Joi.string().default('8080'),
      });

      const result = ConfigUtil.validate(schema);

      expect(result).toEqual({
        PORT: '8080',
      });
    });
  });
});
