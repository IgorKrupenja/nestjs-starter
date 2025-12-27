import type { Server } from 'node:http';

import { INestApplication } from '@nestjs/common';
import { PostModel } from '@src/generated/prisma/models.js';
import { CreatePostDto } from '@src/post/dtos/create-post-draft.dto.js';
import { PrismaService } from '@src/prisma/services/prisma.service.js';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createTestApp } from './utils/create-test-app.util.js';
import { DatabaseUtil } from './utils/database.util.js';
import { CountMetaDto } from '../src/common/dtos/count-meta.dto.js';
import { DataResponseDto } from '../src/common/dtos/data-response.dto.js';
import { DataWithMetaResponseDto } from '../src/common/dtos/data-with-meta-response.dto.js';
import { PostDto } from '../src/post/dtos/post.dto.js';

describe('Post API (E2E)', () => {
  let app: INestApplication;
  let server: Server;
  let prisma: PrismaService;
  let dbUtil: DatabaseUtil;

  beforeAll(async () => {
    ({ app, server, prisma } = await createTestApp());
    dbUtil = new DatabaseUtil(prisma);

    // Clean database before starting tests
    await dbUtil.truncate();
    await dbUtil.resetSequences();

    // Create a test user for post creation
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
      },
    });
  });

  afterAll(async () => {
    await dbUtil.truncate();
    await dbUtil.resetSequences();
    await prisma.$disconnect();
    await app.close();
  });

  afterEach(async () => {
    // Clean up posts after each test to ensure isolation
    await prisma.post.deleteMany();
  });

  describe('POST /v1/posts', () => {
    it('should create a new draft post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'This is a test post content',
        authorEmail: 'test@example.com',
      };

      const response = await request(server).post('/v1/posts').send(createPostDto).expect(201);

      const body = response.body as PostModel;
      expect(body).toMatchObject({
        title: createPostDto.title,
        content: createPostDto.content,
        published: false,
      });
      expect(body.id).toBeDefined();
    });

    it('should return 400 when required fields are missing', async () => {
      const invalidDto = {
        title: 'Test Post',
        // missing content and authorEmail
      };

      await request(server).post('/v1/posts').send(invalidDto).expect(400);
    });

    it('should return 400 when email is invalid', async () => {
      const invalidDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Content',
        authorEmail: 'invalid-email',
      };

      await request(server).post('/v1/posts').send(invalidDto).expect(400);
    });
  });

  describe('GET /v1/posts/:id', () => {
    it('should return a post by id', async () => {
      // Create a post first
      const post = await prisma.post.create({
        data: {
          title: 'Test Post',
          content: 'Test Content',
          author: {
            connect: { email: 'test@example.com' },
          },
        },
      });

      const response = await request(server).get(`/v1/posts/${post.id}`).expect(200);

      const body = response.body as DataResponseDto<PostDto>;
      expect(body).toMatchObject({
        data: {
          id: post.id,
          title: post.title,
          content: post.content,
        },
      });
    });

    it('should return 404 when post does not exist', async () => {
      await request(server).get('/v1/posts/99999').expect(404);
    });
  });

  describe('GET /v1/posts', () => {
    it('should return only published posts', async () => {
      // Get the test user
      const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });

      // Create published and draft posts
      await prisma.post.createMany({
        data: [
          {
            title: 'Published Post 1',
            content: 'Content 1',
            published: true,
            authorId: user!.id,
          },
          {
            title: 'Draft Post',
            content: 'Content 2',
            published: false,
            authorId: user!.id,
          },
          {
            title: 'Published Post 2',
            content: 'Content 3',
            published: true,
            authorId: user!.id,
          },
        ],
      });

      const response = await request(server).get('/v1/posts').expect(200);

      const body = response.body as DataWithMetaResponseDto<PostDto[], CountMetaDto>;
      expect(body.data).toHaveLength(2);
      expect(body.data.every((post) => post.published)).toBe(true);
      expect(body.meta).toEqual({ count: 2 });
    });

    it('should return empty data array when no published posts exist', async () => {
      const response = await request(server).get('/v1/posts').expect(200);

      const body = response.body as DataWithMetaResponseDto<PostDto[], CountMetaDto>;
      expect(body.data).toEqual([]);
      expect(body.meta).toEqual({ count: 0 });
    });

    it('should return paginated posts', async () => {
      // Get the test user
      const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });

      // Create 5 published posts
      await prisma.post.createMany({
        data: [
          {
            title: 'Published Post 1',
            content: 'Content 1',
            published: true,
            authorId: user!.id,
          },
          {
            title: 'Published Post 2',
            content: 'Content 2',
            published: true,
            authorId: user!.id,
          },
          {
            title: 'Published Post 3',
            content: 'Content 3',
            published: true,
            authorId: user!.id,
          },
          {
            title: 'Published Post 4',
            content: 'Content 4',
            published: true,
            authorId: user!.id,
          },
          {
            title: 'Published Post 5',
            content: 'Content 5',
            published: true,
            authorId: user!.id,
          },
        ],
      });

      // Get 2 posts, skipping the first 2 (i.e., get posts 3 and 4)
      const response = await request(server).get('/v1/posts?limit=2&offset=2').expect(200);

      const body = response.body as DataWithMetaResponseDto<PostDto[], CountMetaDto>;
      expect(body.data).toHaveLength(2);
      expect(body.data[0].title).toBe('Published Post 3');
      expect(body.data[1].title).toBe('Published Post 4');
      expect(body.meta).toEqual({ count: 5 });
    });
  });

  describe('PUT /v1/posts/publish/:id', () => {
    it('should publish a draft post', async () => {
      const post = await prisma.post.create({
        data: {
          title: 'Draft Post',
          content: 'Content',
          published: false,
          author: {
            connect: { email: 'test@example.com' },
          },
        },
      });

      const response = await request(server).put(`/v1/posts/publish/${post.id}`).expect(200);

      const body = response.body as PostModel;
      expect(body.published).toBe(true);
      expect(body.id).toBe(post.id);
    });
  });

  describe('DELETE /v1/posts/:id', () => {
    it('should delete a post', async () => {
      const post = await prisma.post.create({
        data: {
          title: 'Post to Delete',
          content: 'Content',
          author: {
            connect: { email: 'test@example.com' },
          },
        },
      });

      await request(server).delete(`/v1/posts/${post.id}`).expect(200);

      // Verify post is deleted
      const deletedPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(deletedPost).toBeNull();
    });
  });

  describe('GET /v1/posts/search/:searchString', () => {
    it('should return posts matching the search string', async () => {
      // Get the test user
      const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });

      await prisma.post.createMany({
        data: [
          {
            title: 'JavaScript Tutorial',
            content: 'Learn JavaScript',
            published: true,
            authorId: user!.id,
          },
          {
            title: 'Python Guide',
            content: 'Learn Python',
            published: true,
            authorId: user!.id,
          },
        ],
      });

      const response = await request(server).get('/v1/posts/search/JavaScript').expect(200);

      const body = response.body as DataWithMetaResponseDto<PostDto[], CountMetaDto>;
      expect(body.data).toHaveLength(1);
      expect(body.data[0]?.title).toContain('JavaScript');
      expect(body.meta).toEqual({ count: 1 });
    });

    it('should return paginated search results', async () => {
      // Get the test user
      const user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });

      await prisma.post.createMany({
        data: [
          {
            title: 'JavaScript Tutorial 1',
            content: 'Learn JavaScript',
            published: true,
            authorId: user!.id,
          },
          {
            title: 'JavaScript Tutorial 2',
            content: 'Learn JavaScript Advanced',
            published: true,
            authorId: user!.id,
          },
          {
            title: 'JavaScript Tutorial 3',
            content: 'Learn JavaScript Pro',
            published: true,
            authorId: user!.id,
          },
          {
            title: 'JavaScript Tutorial 4',
            content: 'Learn JavaScript Expert',
            published: true,
            authorId: user!.id,
          },
          {
            title: 'Python Guide',
            content: 'Learn Python',
            published: true,
            authorId: user!.id,
          },
        ],
      });

      // Search for 'JavaScript', get 2 posts, skipping the first 2 (i.e., get posts 3 and 4)
      const response = await request(server)
        .get('/v1/posts/search/JavaScript?limit=2&offset=2')
        .expect(200);

      const body = response.body as DataWithMetaResponseDto<PostDto[], CountMetaDto>;
      expect(body.data).toHaveLength(2);
      expect(body.data[0]?.title).toContain('JavaScript Tutorial 3');
      expect(body.data[1]?.title).toContain('JavaScript Tutorial 4');
      expect(body.meta).toEqual({ count: 4 });
    });
  });
});
