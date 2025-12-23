import { PrismaService } from '@src/prisma/services/prisma.service.js';

/**
 * Database utility functions for E2E tests
 */
export class DatabaseUtil {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Truncates all tables in the database (except migrations)
   * Useful for cleaning up test data between tests
   */
  async truncate(): Promise<void> {
    // Get the schema from Prisma's configuration
    const schema = this.getSchema();

    const tables = await this.prisma.$queryRawUnsafe<Array<{ tablename: string }>>(
      `SELECT tablename
       FROM pg_tables
       WHERE schemaname = $1`,
      schema,
    );

    for (const { tablename } of tables) {
      if (tablename === '_prisma_migrations') {
        continue;
      }
      try {
        await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE "${schema}"."${tablename}" CASCADE;`);
      } catch (error) {
        console.error(`Error truncating table ${tablename}:`, error);
      }
    }
  }

  /**
   * Resets all sequences in the database
   * Useful for ensuring consistent IDs in tests
   */
  async resetSequences(): Promise<void> {
    // Get the schema from Prisma's configuration
    const schema = this.getSchema();

    // PostgreSQL specific: reset sequences for auto-incrementing IDs
    // This ensures IDs start from 1 again after truncation
    const results = await this.prisma.$queryRawUnsafe<Array<{ relname: string }>>(
      `SELECT c.relname
       FROM pg_class AS c
                JOIN pg_namespace AS n ON c.relnamespace = n.oid
       WHERE c.relkind = 'S'
         AND n.nspname = $1`,
      schema,
    );

    for (const { relname } of results) {
      await this.prisma.$executeRawUnsafe(
        `ALTER SEQUENCE "${schema}"."${relname}" RESTART WITH 1;`,
      );
    }
  }

  /**
   * Gets the current schema from the DATABASE_URL
   */
  private getSchema(): string {
    const databaseUrl = process.env.DATABASE_URL || '';
    const schemaMatch = databaseUrl.match(/[?&]schema=([^&]+)/);
    return schemaMatch ? schemaMatch[1] : 'public';
  }
}
