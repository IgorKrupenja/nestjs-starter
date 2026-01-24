import { ConfigUtil } from '@src/config/utils/config.util.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { appConfigFactory } from './app-config.factory.js';

describe('appConfigFactory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('factory function', () => {
    it('should return app configuration with all required fields', () => {
      const mockValidatedEnv = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
        LOGGER_LOG_LEVELS: 'error,warn,log',
        LOGGER_COLORS: true,
        API_DOCUMENTATION_ENABLED: false,
        API_CORS_ORIGIN: '*',
        NODE_ENV: 'development',
      };

      vi.spyOn(ConfigUtil, 'validate').mockReturnValue(mockValidatedEnv);

      const config = appConfigFactory();

      expect(config).toEqual({
        databaseUrl: 'postgresql://user:pass@localhost:5432/testdb',
        loggerLogLevels: ['error', 'warn', 'log'],
        loggerColors: true,
        apiDocumentationEnabled: false,
        corsOrigin: '*',
        nodeEnv: 'development',
      });
    });

    it('should parse single log level', () => {
      const mockValidatedEnv = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
        LOGGER_LOG_LEVELS: 'error',
        LOGGER_COLORS: false,
        API_DOCUMENTATION_ENABLED: true,
        API_CORS_ORIGIN: 'https://example.com',
        NODE_ENV: 'production',
      };

      vi.spyOn(ConfigUtil, 'validate').mockReturnValue(mockValidatedEnv);

      const config = appConfigFactory();

      expect(config.loggerLogLevels).toEqual(['error']);
    });

    it('should parse multiple log levels', () => {
      const mockValidatedEnv = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
        LOGGER_LOG_LEVELS: 'log,error,warn,debug,verbose,fatal',
        LOGGER_COLORS: false,
        API_DOCUMENTATION_ENABLED: false,
        API_CORS_ORIGIN: '',
        NODE_ENV: 'test',
      };

      vi.spyOn(ConfigUtil, 'validate').mockReturnValue(mockValidatedEnv);

      const config = appConfigFactory();

      expect(config.loggerLogLevels).toEqual(['log', 'error', 'warn', 'debug', 'verbose', 'fatal']);
    });

    it('should trim whitespace from log levels', () => {
      const mockValidatedEnv = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
        LOGGER_LOG_LEVELS: 'error , warn , log',
        LOGGER_COLORS: false,
        API_DOCUMENTATION_ENABLED: false,
        API_CORS_ORIGIN: '*',
        NODE_ENV: 'development',
      };

      vi.spyOn(ConfigUtil, 'validate').mockReturnValue(mockValidatedEnv);

      const config = appConfigFactory();

      expect(config.loggerLogLevels).toEqual(['error', 'warn', 'log']);
    });

    it('should handle different NODE_ENV values', () => {
      const environments = ['development', 'production', 'test'];

      environments.forEach((env) => {
        const mockValidatedEnv = {
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
          LOGGER_LOG_LEVELS: 'error',
          LOGGER_COLORS: false,
          API_DOCUMENTATION_ENABLED: false,
          API_CORS_ORIGIN: '*',
          NODE_ENV: env,
        };

        vi.spyOn(ConfigUtil, 'validate').mockReturnValue(mockValidatedEnv);

        const config = appConfigFactory();

        expect(config.nodeEnv).toBe(env);
      });
    });

    it('should have correct registerAs key', () => {
      expect(appConfigFactory.KEY).toBe('CONFIGURATION(app)');
    });
  });

  describe('CORS origin parsing', () => {
    it('should parse single CORS origin', () => {
      const mockValidatedEnv = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
        LOGGER_LOG_LEVELS: 'error',
        LOGGER_COLORS: false,
        API_DOCUMENTATION_ENABLED: false,
        API_CORS_ORIGIN: 'https://example.com',
        NODE_ENV: 'development',
      };

      vi.spyOn(ConfigUtil, 'validate').mockReturnValue(mockValidatedEnv);

      const config = appConfigFactory();

      expect(config.corsOrigin).toBe('https://example.com');
    });

    it('should parse multiple CORS origins', () => {
      const mockValidatedEnv = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
        LOGGER_LOG_LEVELS: 'error',
        LOGGER_COLORS: false,
        API_DOCUMENTATION_ENABLED: false,
        API_CORS_ORIGIN: 'https://example.com,https://app.example.com,http://localhost:3000',
        NODE_ENV: 'development',
      };

      vi.spyOn(ConfigUtil, 'validate').mockReturnValue(mockValidatedEnv);

      const config = appConfigFactory();

      expect(config.corsOrigin).toEqual([
        'https://example.com',
        'https://app.example.com',
        'http://localhost:3000',
      ]);
    });

    it('should trim whitespace from CORS origins', () => {
      const mockValidatedEnv = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
        LOGGER_LOG_LEVELS: 'error',
        LOGGER_COLORS: false,
        API_DOCUMENTATION_ENABLED: false,
        API_CORS_ORIGIN: 'https://example.com , https://app.example.com , http://localhost:3000',
        NODE_ENV: 'development',
      };

      vi.spyOn(ConfigUtil, 'validate').mockReturnValue(mockValidatedEnv);

      const config = appConfigFactory();

      expect(config.corsOrigin).toEqual([
        'https://example.com',
        'https://app.example.com',
        'http://localhost:3000',
      ]);
    });

    it('should handle wildcard CORS origin', () => {
      const mockValidatedEnv = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
        LOGGER_LOG_LEVELS: 'error',
        LOGGER_COLORS: false,
        API_DOCUMENTATION_ENABLED: false,
        API_CORS_ORIGIN: '*',
        NODE_ENV: 'development',
      };

      vi.spyOn(ConfigUtil, 'validate').mockReturnValue(mockValidatedEnv);

      const config = appConfigFactory();

      expect(config.corsOrigin).toBe('*');
    });

    it('should return empty string when CORS origin is empty string', () => {
      const mockValidatedEnv = {
        DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
        LOGGER_LOG_LEVELS: 'error',
        LOGGER_COLORS: false,
        API_DOCUMENTATION_ENABLED: false,
        API_CORS_ORIGIN: '',
        NODE_ENV: 'development',
      };

      vi.spyOn(ConfigUtil, 'validate').mockReturnValue(mockValidatedEnv);

      const config = appConfigFactory();

      expect(config.corsOrigin).toBe('');
    });
  });

  it('should call ConfigUtil.validate with appConfigSchema', () => {
    const validateSpy = vi.spyOn(ConfigUtil, 'validate').mockReturnValue({
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/testdb',
      LOGGER_LOG_LEVELS: 'error',
      LOGGER_COLORS: false,
      API_DOCUMENTATION_ENABLED: false,
      API_CORS_ORIGIN: '*',
      NODE_ENV: 'development',
    });

    appConfigFactory();

    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(validateSpy).toHaveBeenCalledWith(expect.any(Object));
  });
});
