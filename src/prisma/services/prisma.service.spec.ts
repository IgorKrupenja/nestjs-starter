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
vi.mock('../../generated/prisma/client.js', () => ({
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
  let originalNodeEnv: string | undefined;
  let originalDatabaseUrl: string | undefined;
  let loggerLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Store original environment variables
    originalNodeEnv = process.env.NODE_ENV;
    originalDatabaseUrl = process.env.DATABASE_URL;

    // Set default test environment
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
    process.env.NODE_ENV = 'development';

    // Mock the logger to avoid console output during tests
    loggerLogSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original environment variables
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }

    if (originalDatabaseUrl !== undefined) {
      process.env.DATABASE_URL = originalDatabaseUrl;
    } else {
      delete process.env.DATABASE_URL;
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

    it('should be instantiable in production mode', () => {
      process.env.NODE_ENV = 'production';

      prismaService = new PrismaService();

      expect(prismaService).toBeDefined();
    });

    it('should be instantiable in development mode', () => {
      process.env.NODE_ENV = 'development';

      prismaService = new PrismaService();

      expect(prismaService).toBeDefined();
    });

    it('should default to development mode when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;

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

    it('should configure production logging when NODE_ENV is production', () => {
      process.env.NODE_ENV = 'production';
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

    it('should configure development logging when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';
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
    it('should set up query logging in development mode', async () => {
      process.env.NODE_ENV = 'development';
      prismaService = new PrismaService();

      await prismaService.onModuleInit();

      expect(prismaService.$connect).toHaveBeenCalledOnce();
      expect(prismaService.$on).toHaveBeenCalledWith('query', expect.any(Function));
    });

    it('should not set up query logging in production mode', async () => {
      process.env.NODE_ENV = 'production';
      prismaService = new PrismaService();

      await prismaService.onModuleInit();

      expect(prismaService.$connect).toHaveBeenCalledOnce();
      expect(prismaService.$on).not.toHaveBeenCalled();
    });

    it('should log query details when query event is emitted in development', async () => {
      process.env.NODE_ENV = 'development';
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
      process.env.NODE_ENV = 'development';
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

    it('should use development logging for non-production environments', async () => {
      const environments = ['development', 'test', 'staging', 'local'];

      for (const env of environments) {
        process.env.NODE_ENV = env;
        const service = new PrismaService();
        await service.onModuleInit();

        // Non-production environments should set up query logging
        expect(service.$on).toHaveBeenCalledWith('query', expect.any(Function));

        // Reset mocks for next iteration
        vi.clearAllMocks();
      }
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
