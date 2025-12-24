import type { Server } from 'node:http';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { configureApp } from '@src/app.config.js';
import { appConfigFactory } from '@src/config/app-config.factory.js';
import { AppConfig } from '@src/config/interfaces/app-config.interface.js';
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

  // Get validated config
  const appConfig = app.get<AppConfig>(appConfigFactory.KEY);

  // Apply the same configuration as the production app
  configureApp(app, appConfig);

  await app.init();
  const server = app.getHttpServer() as Server;

  return { app, server, prisma };
}
