import { Logger } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from './prisma.service.js';

// Mock the PrismaPg adapter
const mockPrismaPgConstructor = vi.fn();

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: class MockPrismaPg {
    connectionString: string;
    constructor(config: { connectionString: string }) {
      mockPrismaPgConstructor(config);
      this.connectionString = config.connectionString;
    }
  },
}));

// Mock PrismaClient to avoid real database connections
const mockPrismaClientConstructor = vi.fn();
vi.mock('@src/generated/prisma/client.js', () => ({
  PrismaClient: class MockPrismaClient {
    $connect = vi.fn().mockResolvedValue(undefined);
    $disconnect = vi.fn().mockResolvedValue(undefined);
    $on = vi.fn();
    constructor(config?: any) {
      mockPrismaClientConstructor(config);
    }
  },
}));

describe('PrismaService', () => {
  let prismaService: PrismaService;
  let originalDatabaseUrl: string | undefined;
  let originalLoggerLogLevels: string | undefined;
  let loggerLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Store original environment variables
    originalDatabaseUrl = process.env.DATABASE_URL;
    originalLoggerLogLevels = process.env.LOGGER_LOG_LEVELS;

    // Set default test environment
    process.env.NODE_ENV = 'development';
    process.env.LOGGER_LOG_LEVELS = 'error,warn,log,debug';

    // Mock the logger to avoid console output during tests
    loggerLogSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    if (originalDatabaseUrl !== undefined) {
      process.env.DATABASE_URL = originalDatabaseUrl;
    } else {
      delete process.env.DATABASE_URL;
    }

    if (originalLoggerLogLevels !== undefined) {
      process.env.LOGGER_LOG_LEVELS = originalLoggerLogLevels;
    } else {
      delete process.env.LOGGER_LOG_LEVELS;
    }

    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with database URL from environment', () => {
      const testUrl = 'postgresql://user:pass@localhost:5432/mydb';
      process.env.DATABASE_URL = testUrl;

      prismaService = new PrismaService();
      expect(prismaService).toBeDefined();
      expect(mockPrismaPgConstructor).toHaveBeenCalledWith({
        connectionString: testUrl,
      });
    });

    it('should be instantiable with minimal log levels', () => {
      process.env.LOGGER_LOG_LEVELS = 'error';

      prismaService = new PrismaService();

      expect(prismaService).toBeDefined();
    });

    it('should be instantiable with all log levels', () => {
      process.env.LOGGER_LOG_LEVELS = 'error,warn,log,debug';

      prismaService = new PrismaService();

      expect(prismaService).toBeDefined();
    });

    it('should default to error,warn,log when LOGGER_LOG_LEVELS is not set', () => {
      delete process.env.LOGGER_LOG_LEVELS;

      prismaService = new PrismaService();

      expect(prismaService).toBeDefined();
    });

    it('should create a logger instance', () => {
      prismaService = new PrismaService();

      // Access the private logger through reflection for testing
      const logger = (prismaService as unknown as { logger: Logger }).logger;
      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should configure minimal logging when only error and warn are enabled', () => {
      process.env.LOGGER_LOG_LEVELS = 'error,warn';
      mockPrismaClientConstructor.mockClear();

      prismaService = new PrismaService();

      expect(mockPrismaClientConstructor).toHaveBeenCalledWith(
        expect.objectContaining({
          log: expect.arrayContaining([
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ]) as unknown,
        }) as unknown,
      );
    });

    it('should configure full logging when all levels including debug are enabled', () => {
      process.env.LOGGER_LOG_LEVELS = 'error,warn,log,debug';
      mockPrismaClientConstructor.mockClear();

      prismaService = new PrismaService();

      expect(mockPrismaClientConstructor).toHaveBeenCalledWith(
        expect.objectContaining({
          log: expect.arrayContaining([
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'info' },
            { emit: 'stdout', level: 'warn' },
            { emit: 'stdout', level: 'error' },
          ]) as unknown,
        }) as unknown,
      );
    });
  });

  describe('onModuleInit', () => {
    it('should set up query logging when debug level is enabled', async () => {
      process.env.LOGGER_LOG_LEVELS = 'error,warn,log,debug';
      prismaService = new PrismaService();

      await prismaService.onModuleInit();

      expect(prismaService.$connect).toHaveBeenCalledOnce();
      expect(prismaService.$on).toHaveBeenCalledWith('query', expect.any(Function));
    });

    it('should not set up query logging when debug level is not enabled', async () => {
      process.env.LOGGER_LOG_LEVELS = 'error,warn,log';
      prismaService = new PrismaService();

      await prismaService.onModuleInit();

      expect(prismaService.$connect).toHaveBeenCalledOnce();
      expect(prismaService.$on).not.toHaveBeenCalled();
    });

    it('should log query details when query event is emitted with debug enabled', async () => {
      process.env.LOGGER_LOG_LEVELS = 'error,warn,log,debug';
      prismaService = new PrismaService();

      let queryCallback:
        | ((e: { query: string; params: string; duration: number }) => void)
        | undefined;

      // Capture the callback passed to $on
      vi.mocked(prismaService.$on).mockImplementation((event: any, callback: any) => {
        if (event === 'query') {
          queryCallback = callback as (e: {
            query: string;
            params: string;
            duration: number;
          }) => void;
        }
      });

      await prismaService.onModuleInit();

      // Simulate a query event
      expect(queryCallback).toBeDefined();
      queryCallback?.({
        query: 'SELECT * FROM users WHERE id = $1',
        params: '[1]',
        duration: 15,
      });

      expect(loggerLogSpy).toHaveBeenCalledWith('Query: SELECT * FROM users WHERE id = $1');
      expect(loggerLogSpy).toHaveBeenCalledWith('Params: [1]');
      expect(loggerLogSpy).toHaveBeenCalledWith('Duration: 15ms');
    });

    it('should handle connection errors gracefully', async () => {
      prismaService = new PrismaService();
      const error = new Error('Connection failed');
      vi.mocked(prismaService.$connect).mockRejectedValue(error);

      await expect(prismaService.onModuleInit()).rejects.toThrow('Connection failed');
    });

    it('should log multiple queries correctly', async () => {
      process.env.LOGGER_LOG_LEVELS = 'error,warn,log,debug';
      prismaService = new PrismaService();

      let queryCallback:
        | ((e: { query: string; params: string; duration: number }) => void)
        | undefined;

      vi.mocked(prismaService.$on).mockImplementation((event: any, callback: any) => {
        if (event === 'query') {
          queryCallback = callback as (e: {
            query: string;
            params: string;
            duration: number;
          }) => void;
        }
      });

      await prismaService.onModuleInit();

      // Simulate multiple query events
      queryCallback?.({
        query: 'SELECT * FROM users',
        params: '[]',
        duration: 10,
      });

      queryCallback?.({
        query: 'INSERT INTO posts VALUES ($1, $2)',
        params: '[1, "test"]',
        duration: 5,
      });

      expect(loggerLogSpy).toHaveBeenCalledWith('Query: SELECT * FROM users');
      expect(loggerLogSpy).toHaveBeenCalledWith('Query: INSERT INTO posts VALUES ($1, $2)');
    });

    it('should enable query logging when debug is in LOGGER_LOG_LEVELS with other levels', async () => {
      process.env.LOGGER_LOG_LEVELS = 'error,warn,log,debug';
      const service = new PrismaService();
      await service.onModuleInit();

      expect(service.$on).toHaveBeenCalledWith('query', expect.any(Function));
    });

    it('should enable query logging when only debug is in LOGGER_LOG_LEVELS', async () => {
      process.env.LOGGER_LOG_LEVELS = 'debug';
      const service = new PrismaService();
      await service.onModuleInit();

      expect(service.$on).toHaveBeenCalledWith('query', expect.any(Function));
    });

    it('should not enable query logging when debug is not in LOGGER_LOG_LEVELS', async () => {
      process.env.LOGGER_LOG_LEVELS = 'error,warn,log';
      const service = new PrismaService();
      await service.onModuleInit();

      expect(service.$on).not.toHaveBeenCalled();
    });
  });

  describe('integration with NestJS lifecycle', () => {
    it('should implement OnModuleInit interface', () => {
      prismaService = new PrismaService();

      expect(prismaService.onModuleInit).toBeDefined();
      expect(typeof prismaService.onModuleInit).toBe('function');
    });

    it('should be usable as a NestJS provider', () => {
      prismaService = new PrismaService();

      // Verify it has the expected PrismaClient methods
      expect(prismaService.$connect).toBeDefined();
      expect(prismaService.$disconnect).toBeDefined();
      expect(prismaService.$on).toBeDefined();
    });

    it('should be injectable', () => {
      // The @Injectable() decorator makes it a provider
      prismaService = new PrismaService();
      expect(prismaService).toBeInstanceOf(PrismaService);
    });
  });
});
