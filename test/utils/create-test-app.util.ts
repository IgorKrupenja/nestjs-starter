import type { Server } from 'node:http';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { configureApp } from '@src/app.config.js';
import { AppModule } from '@src/app.module.js';
import { PrismaService } from '@src/prisma/services/prisma.service.js';

/**
 * Creates and configures a NestJS application for E2E testing
 * This ensures all tests use the same app configuration as production
 */
export async function createTestApp(): Promise<{
  app: INestApplication;
  server: Server;
  prisma: PrismaService;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const prisma = app.get<PrismaService>(PrismaService);

  try {
    await prisma.$connect();
    // Check if database is ready by running a simple query
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    const useColors = process.env.LOGGER_COLORS?.toLowerCase() === 'true';
    const errorMessage = 'E2E setup failed: database is not ready.';
    const formattedMessage = useColors ? `\x1b[1m\x1b[31m${errorMessage}\x1b[0m` : errorMessage;
    console.error(formattedMessage);
  }

  // Apply the same configuration as the production app (logger, compression, pipes, filters, swagger)
  configureApp(app);

  await app.init();
  const server = app.getHttpServer() as Server;

  return { app, server, prisma };
}
