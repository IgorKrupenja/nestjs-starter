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

    it('should throw error when validation fails', () => {
      process.env.PORT = 'invalid-number';

      const schema = Joi.object({
        PORT: Joi.number().required(),
      });

      expect(() => ConfigUtil.validate(schema)).toThrow(/Config validation error:/);
    });
  });
});
