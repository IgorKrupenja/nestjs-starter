import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module.js';
import { PrismaExceptionFilter } from '@src/prisma/filters/prisma-exception.filter.js';

/**
 * Creates a NestJS application instance for E2E testing
 * This helper ensures consistent app configuration across all E2E tests
 * The app connects to the test database (port 5433) for complete isolation
 */
export async function createTestApp(): Promise<INestApplication> {
  // Set test database URL for the app
  process.env.DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5433/nestjs_starter_test?schema=starter';

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply the same configuration as the production app
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.init();

  return app;
}
