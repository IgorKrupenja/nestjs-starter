import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';

import { AppConfig } from './config/interfaces/app-config.interface.js';
import { PrismaExceptionFilter } from './prisma/filters/prisma-exception.filter.js';

/**
 * Configures the NestJS application with common settings
 * This function is used by both the main application and tests
 * to ensure consistent configuration
 */
export function configureApp(app: INestApplication, config: AppConfig): void {
  app.use(compression());

  // Enable URI versioning (e.g., /v1/posts)
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Validate DTOs for incoming requests globally
  // Also rejects requests with non-whitelisted properties
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Transform Prisma errors into appropriate HTTP responses (e.g., P2002 → 409 Conflict)
  // Otherwise, 500 would be returned
  app.useGlobalFilters(new PrismaExceptionFilter());

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
