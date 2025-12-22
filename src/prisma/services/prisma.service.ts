import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../../generated/prisma/client.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    });

    const env = process.env.NODE_ENV || 'development';

    super({
      adapter,
      log:
        env === 'production'
          ? [
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ]
          : [
              { emit: 'event', level: 'query' },
              { emit: 'stdout', level: 'info' },
              { emit: 'stdout', level: 'warn' },
              { emit: 'stdout', level: 'error' },
            ],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();

    // In development, log queries using NestJS logger
    if (process.env.NODE_ENV !== 'production') {
      this.$on('query' as never, (e: { query: string; params: string; duration: number }) => {
        this.logger.log(`Query: ${e.query}`);
        this.logger.log(`Params: ${e.params}`);
        this.logger.log(`Duration: ${e.duration}ms`);
      });
    }
  }
}
