import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@src/generated/prisma/client.js';

/**
 * Database helper for E2E tests
 * Provides utilities for cleaning up test data
 * Uses a separate test database for complete isolation from development data
 */
export class DatabaseHelper {
  private prisma: PrismaClient;

  constructor() {
    // Use test database URL (separate database on port 5433)
    const testDatabaseUrl =
      process.env.TEST_DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5433/nestjs_starter_test?schema=starter';

    const adapter = new PrismaPg({
      connectionString: testDatabaseUrl,
    });

    this.prisma = new PrismaClient({
      adapter,
    });
  }

  /**
   * Cleans all data from the database
   * Use this in beforeEach or afterEach hooks to ensure test isolation
   */
  async cleanDatabase(): Promise<void> {
    // Delete in order to respect foreign key constraints
    await this.prisma.post.deleteMany();
    await this.prisma.user.deleteMany();
  }

  /**
   * Disconnects from the database
   * Call this in afterAll hooks
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  /**
   * Gets the Prisma client instance
   * Use this if you need direct database access in tests
   */
  getClient(): PrismaClient {
    return this.prisma;
  }
}
