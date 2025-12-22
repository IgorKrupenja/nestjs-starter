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

    const logLevels = process.env.LOGGER_LOG_LEVELS?.split(',') || ['error', 'warn', 'log'];

    const logConfig: Array<{
      emit: 'stdout' | 'event';
      level: 'query' | 'info' | 'warn' | 'error';
    }> = [];

    if (logLevels.includes('error')) {
      logConfig.push({ emit: 'stdout', level: 'error' });
    }
    if (logLevels.includes('warn')) {
      logConfig.push({ emit: 'stdout', level: 'warn' });
    }
    if (logLevels.includes('log')) {
      logConfig.push({ emit: 'stdout', level: 'info' });
    }
    if (logLevels.includes('debug')) {
      logConfig.push({ emit: 'event', level: 'query' });
    }

    super({
      adapter,
      log: logConfig,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();

    const logLevels = process.env.LOGGER_LOG_LEVELS?.split(',') || ['error', 'warn', 'log'];

    // Log queries using NestJS logger when debug is enabled
    if (logLevels.includes('debug')) {
      this.$on('query' as never, (e: { query: string; params: string; duration: number }) => {
        this.logger.log(`Query: ${e.query}`);
        this.logger.log(`Params: ${e.params}`);
        this.logger.log(`Duration: ${e.duration}ms`);
      });
    }
  }
}
