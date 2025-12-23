import type { Server } from 'node:http';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { configureApp } from '@src/app.config.js';
import { AppModule } from '@src/app.module.js';
import { PrismaService } from '@src/prisma/services/prisma.service.js';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Swagger Documentation (E2E)', () => {
  describe('when API_DOCUMENTATION_ENABLED is true', () => {
    let app: INestApplication;
    let server: Server;
    let prisma: PrismaService;

    beforeAll(async () => {
      // TODO: Hardcoded for now, will fix with ConfigService
      process.env.DATABASE_URL =
        'postgresql://postgres:postgres@localhost:5433/nestjs_starter_test?schema=starter';
      process.env.API_DOCUMENTATION_ENABLED = 'true';

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      prisma = app.get<PrismaService>(PrismaService);

      // Apply the same configuration as the production app
      configureApp(app, { enableSwagger: true });

      await app.init();
      server = app.getHttpServer() as Server;
    });

    afterAll(async () => {
      await prisma.$disconnect();
      await app.close();
      delete process.env.API_DOCUMENTATION_ENABLED;
    });

    it('should serve Swagger UI at /documentation', async () => {
      const response = await request(server).get('/documentation').expect(200);

      expect(response.text).toContain('Swagger UI');
    });

    it('should serve OpenAPI JSON at /documentation-json', async () => {
      const response = (await request(server).get('/documentation-json').expect(200)) as {
        body: { openapi: string; info: { title: string } };
      };

      expect(response.body).toHaveProperty('openapi');
      expect(response.body).toHaveProperty('info');
      expect(response.body.info.title).toBe('NestJS Starter');
    });
  });

  describe('when API_DOCUMENTATION_ENABLED is false', () => {
    let app: INestApplication;
    let server: Server;
    let prisma: PrismaService;

    beforeAll(async () => {
      // Set test database URL
      process.env.DATABASE_URL =
        'postgresql://postgres:postgres@localhost:5433/nestjs_starter_test?schema=starter';
      process.env.API_DOCUMENTATION_ENABLED = 'false';

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      prisma = app.get<PrismaService>(PrismaService);

      // Apply the same configuration as the production app
      configureApp(app, { enableSwagger: false });

      await app.init();
      server = app.getHttpServer() as Server;
    });

    afterAll(async () => {
      await prisma.$disconnect();
      await app.close();
      delete process.env.API_DOCUMENTATION_ENABLED;
    });

    it('should return 404 for /documentation', async () => {
      await request(server).get('/documentation').expect(404);
    });

    it('should return 404 for /documentation-json', async () => {
      await request(server).get('/documentation-json').expect(404);
    });
  });

  describe('when API_DOCUMENTATION_ENABLED is not set', () => {
    let app: INestApplication;
    let server: Server;
    let prisma: PrismaService;

    beforeAll(async () => {
      // Set test database URL
      process.env.DATABASE_URL =
        'postgresql://postgres:postgres@localhost:5433/nestjs_starter_test?schema=starter';
      delete process.env.API_DOCUMENTATION_ENABLED;

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      prisma = app.get<PrismaService>(PrismaService);

      // Apply the same configuration as the production app
      configureApp(app); // Swagger disabled by default

      await app.init();
      server = app.getHttpServer() as Server;
    });

    afterAll(async () => {
      await prisma.$disconnect();
      await app.close();
    });

    it('should return 404 for /documentation (disabled by default)', async () => {
      await request(server).get('/documentation').expect(404);
    });
  });
});
