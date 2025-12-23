import { ConsoleLogger, Logger, LogLevel, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';

import { AppModule } from './app.module.js';
import { PrismaExceptionFilter } from './prisma/filters/prisma-exception.filter.js';

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
  app.use(compression());
  app.enableVersioning({
    type: VersioningType.URI,
  });
  // Validate DTOs for incoming requests globally
  // Also rejects requests with non-whitelisted properties
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  // Transform Prisma errors into appropriate HTTP responses (e.g., P2002 → 409 Conflict)
  // Otherwise, 500 would be returned
  app.useGlobalFilters(new PrismaExceptionFilter());

  const config = new DocumentBuilder()
    .addBearerAuth({ in: 'header', type: 'http' })
    .setTitle('NestJS Starter')
    .setDescription('API documentation for NestJS Starter project')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document, {
    swaggerOptions: {
      operationsSorter: 'alpha',
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  });

  await app.listen(3000);

  if (process.env.NODE_ENV === 'development') {
    const logger = new Logger('bootstrap');
    logger.log(`Listening on ${await app.getUrl()}`);
  }
}

void bootstrap();
