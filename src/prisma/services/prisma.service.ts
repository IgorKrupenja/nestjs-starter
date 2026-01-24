import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { AppConfig } from '@src/config/interfaces/app-config.interface.js';
import { PrismaClient } from '@src/generated/prisma/client.js';
import { PrismaTransactionClient } from '@src/prisma/interfaces/prisma-transaction-client.interface.js';

interface AdvisoryLockResult {
  pg_try_advisory_xact_lock: boolean;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    const appConfig = configService.get<AppConfig>('app')!;

    const adapter = new PrismaPg({
      connectionString: appConfig.databaseUrl,
    });

    const logConfig: Array<{
      emit: 'stdout' | 'event';
      level: 'query' | 'info' | 'warn' | 'error';
    }> = [];

    if (appConfig.loggerLogLevels.includes('error')) {
      logConfig.push({ emit: 'stdout', level: 'error' });
    }
    if (appConfig.loggerLogLevels.includes('warn')) {
      logConfig.push({ emit: 'stdout', level: 'warn' });
    }
    if (appConfig.loggerLogLevels.includes('log')) {
      logConfig.push({ emit: 'stdout', level: 'info' });
    }
    if (appConfig.loggerLogLevels.includes('debug')) {
      logConfig.push({ emit: 'event', level: 'query' });
    }

    super({
      adapter,
      log: logConfig,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();

    const appConfig = this.configService.get<AppConfig>('app')!;

    // Log queries using NestJS logger when debug is enabled
    if (appConfig.loggerLogLevels.includes('debug')) {
      this.$on('query' as never, (e: { query: string; params: string; duration: number }) => {
        this.logger.log(`Query: ${e.query}`);
        this.logger.log(`Params: ${e.params}`);
        this.logger.log(`Duration: ${e.duration}ms`);
      });
    }
  }

  // Executes the callback inside a SERIALIZABLE transaction that first tries
  // to acquire a PostgreSQL advisory transaction lock; returns undefined when
  // the lock can't be acquired within the timeout.
  // Can be used to prevent concurrent execution of code that modifies the same data.
  // E.g. with Cron jobs in multi-instance set ups.
  async runWithLock<T>(
    lockKey: bigint,
    timeoutInSeconds: number,
    callback: (tx: PrismaTransactionClient) => Promise<T>,
  ): Promise<T | undefined> {
    return this.$transaction(
      async (tx) => {
        const [result] = await tx.$queryRaw<
          AdvisoryLockResult[]
        >`select pg_try_advisory_xact_lock(${lockKey})`;
        if (result?.pg_try_advisory_xact_lock) return callback(tx);
        return undefined;
      },
      { timeout: timeoutInSeconds * 1000, isolationLevel: 'Serializable' },
    );
  }
}
