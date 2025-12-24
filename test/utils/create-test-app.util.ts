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
  // TODO: Hardcoded for now, will fix with ConfigService
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5433/nestjs_starter_test?schema=starter';

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  const prisma = app.get<PrismaService>(PrismaService);

  // Apply the same configuration as the production app
  configureApp(app);

  await app.init();
  const server = app.getHttpServer() as Server;

  return { app, server, prisma };
}
