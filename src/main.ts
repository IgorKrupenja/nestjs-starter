import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { configureApp } from './app.config.js';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  const logger = new ConsoleLogger({
    logLevels: (process.env.LOGGER_LOG_LEVELS?.split(',') as LogLevel[]) || [
      'error',
      'warn',
      'log',
    ],
    timestamp: true,
    colors: process.env.LOGGER_COLORS === 'true',
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true, logger });

  // Apply shared app configuration (compression, versioning, pipes, filters, swagger)
  configureApp(app);

  await app.listen(3000);
}

void bootstrap();
