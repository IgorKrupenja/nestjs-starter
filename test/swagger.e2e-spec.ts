import type { Server } from 'node:http';

import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '@src/app.module.js';
import { PrismaExceptionFilter } from '@src/prisma/filters/prisma-exception.filter.js';
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

      // Setup Swagger API documentation
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
