import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@src/generated/prisma/client.js';

/**
 * Database helper for E2E tests
 * Provides utilities for cleaning up test data
 */
export class DatabaseHelper {
  private prisma: PrismaClient;

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
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
