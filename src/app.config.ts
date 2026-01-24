import {
  ClassSerializerInterceptor,
  ConsoleLogger,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { appConfigFactory } from '@src/config/app-config.factory.js';
import { AppConfig } from '@src/config/interfaces/app-config.interface.js';
import { PrismaExceptionFilter } from '@src/prisma/filters/prisma-exception.filter.js';
import compression from 'compression';

/**
 * Configures the NestJS application with common settings
 * This function is used by both the main application and tests
 * to ensure consistent configuration
 */
export function configureApp(app: INestApplication): void {
  const config = app.get<AppConfig>(appConfigFactory.KEY);
  const configService = app.get(ConfigService);

  const logger = new ConsoleLogger({
    logLevels: config.loggerLogLevels,
    timestamp: true,
    colors: config.loggerColors,
  });
  app.useLogger(logger);

  app.use(compression());

  // Enable CORS with dynamic origin configuration
  if (config.corsOrigin) {
    app.enableCors({
      origin: config.corsOrigin,
    });
  }

  // Enable URI versioning (e.g., /v1/posts)
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Validate DTOs for incoming requests globally
  // Also rejects requests with non-whitelisted properties
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Serialize responses through DTOs and strip out unexposed properties
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
    }),
  );

  // Transform Prisma errors into appropriate HTTP responses (e.g., P2002 → 409 Conflict)
  // Otherwise, 500 would be returned
  app.useGlobalFilters(new PrismaExceptionFilter(configService));

  // Setup Swagger API documentation (if enabled)
  if (config.apiDocumentationEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .addBearerAuth({ in: 'header', type: 'http' })
      .setTitle('NestJS Starter')
      .setDescription('API documentation for NestJS Starter project')
      .setVersion('1.0.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('documentation', app, document, {
      swaggerOptions: {
        operationsSorter: 'alpha',
        persistAuthorization: true,
        tagsSorter: 'alpha',
      },
    });
  }
}
