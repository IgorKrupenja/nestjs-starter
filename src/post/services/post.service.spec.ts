import { Test, TestingModule } from '@nestjs/testing';
import { Post, PrismaClient } from '@src/generated/prisma/client.js';
import { PrismaService } from '@src/prisma/services/prisma.service.js';
import { beforeEach, vi } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';

import { PostService } from './post.service.js';

// Create a mock instance of PrismaClient
const prisma = mockDeep<PrismaClient>();

describe('PostService', () => {
  let postService: PostService;

  beforeEach(async () => {
    // Reset the mock before each test
    mockReset(prisma);

    const module: TestingModule = await Test.createTestingModule({
      providers: [PostService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    postService = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(postService).toBeDefined();
  });

  describe('getPost', () => {
    it('should return a single post', async () => {
      const mockPost: Post = {
        id: 1,
        title: 'Test Post',
        content: 'Test Content',
        published: true,
        authorId: 1,
      };

      prisma.post.findUnique.mockResolvedValueOnce(mockPost);

      const result = await postService.getPost(1);
      expect(result).toEqual(mockPost);
      expect(prisma.post.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('getPosts', () => {
    it('should return an array of posts', async () => {
      const mockPosts: Post[] = [
        { id: 1, title: 'Post 1', content: 'Content 1', published: true, authorId: 1 },
        { id: 2, title: 'Post 2', content: 'Content 2', published: false, authorId: 2 },
      ];

      prisma.$transaction.mockResolvedValueOnce([mockPosts, mockPosts.length]);

      const result = await postService.getPosts({});
      expect(result).toEqual({ data: mockPosts, meta: { count: mockPosts.length } });
    });
  });

  describe('getPublishedPosts', () => {
    it('should return only published posts', async () => {
      const mockPublishedPosts: Post[] = [
        { id: 1, title: 'Post 1', content: 'Content 1', published: true, authorId: 1 },
        { id: 3, title: 'Post 3', content: 'Content 3', published: true, authorId: 2 },
      ];
      const mockResponse = {
        data: mockPublishedPosts,
        meta: { count: mockPublishedPosts.length },
      };

      vi.spyOn(postService, 'getPosts').mockResolvedValueOnce(mockResponse);

      const result = await postService.getPublishedPosts();
      expect(result).toEqual(mockResponse);
      expect(postService.getPosts).toHaveBeenCalledWith({
        where: { published: true },
        skip: undefined,
        take: undefined,
      });
    });

    it('should return paginated published posts', async () => {
      const mockPublishedPosts: Post[] = [
        { id: 1, title: 'Post 1', content: 'Content 1', published: true, authorId: 1 },
      ];
      const mockResponse = {
        data: mockPublishedPosts,
        meta: { count: mockPublishedPosts.length },
      };

      vi.spyOn(postService, 'getPosts').mockResolvedValueOnce(mockResponse);

      const result = await postService.getPublishedPosts({ limit: 10, offset: 5 });
      expect(result).toEqual(mockResponse);
      expect(postService.getPosts).toHaveBeenCalledWith({
        where: { published: true },
        take: 10,
        skip: 5,
      });
    });
  });

  describe('getFilteredPosts', () => {
    it('should return posts filtered by search string', async () => {
      const searchString = 'test';
      const mockFilteredPosts: Post[] = [
        { id: 1, title: 'Test Post', content: 'Test Content', published: true, authorId: 1 },
        { id: 2, title: 'Post 2', content: 'Test content', published: false, authorId: 2 },
      ];
      const mockResponse = {
        data: mockFilteredPosts,
        meta: { count: mockFilteredPosts.length },
      };

      vi.spyOn(postService, 'getPosts').mockResolvedValueOnce(mockResponse);

      const result = await postService.getFilteredPosts(searchString);
      expect(result).toEqual(mockResponse);
      expect(postService.getPosts).toHaveBeenCalledWith({
        where: {
          OR: [{ title: { contains: searchString } }, { content: { contains: searchString } }],
        },
        skip: undefined,
        take: undefined,
      });
    });

    it('should return paginated filtered posts', async () => {
      const searchString = 'test';
      const mockFilteredPosts: Post[] = [
        { id: 1, title: 'Test Post', content: 'Test Content', published: true, authorId: 1 },
      ];
      const mockResponse = {
        data: mockFilteredPosts,
        meta: { count: mockFilteredPosts.length },
      };

      vi.spyOn(postService, 'getPosts').mockResolvedValueOnce(mockResponse);

      const result = await postService.getFilteredPosts(searchString, { limit: 10, offset: 5 });
      expect(result).toEqual(mockResponse);
      expect(postService.getPosts).toHaveBeenCalledWith({
        where: {
          OR: [{ title: { contains: searchString } }, { content: { contains: searchString } }],
        },
        take: 10,
        skip: 5,
      });
    });
  });

  describe('createDraft', () => {
    it('should create a new post', async () => {
      const mockPost: Post = {
        id: 1,
        title: 'New Post',
        content: 'New Content',
        published: false,
        authorId: 1,
      };

      prisma.post.create.mockResolvedValueOnce(mockPost);

      const postData = {
        title: 'New Post',
        content: 'New Content',
        authorEmail: 'test@example.com',
      };

      const result = await postService.createDraft(postData);
      expect(result).toEqual(mockPost);
      expect(prisma.post.create).toHaveBeenCalledWith({
        data: {
          title: 'New Post',
          content: 'New Content',
          author: {
            connect: { email: 'test@example.com' },
          },
        },
      });
    });
  });

  describe('publishPost', () => {
    it('should publish a post', async () => {
      const mockUpdatedPost: Post = {
        id: 1,
        title: 'Updated Post',
        content: 'Updated Content',
        published: true,
        authorId: 1,
      };

      prisma.post.update.mockResolvedValueOnce(mockUpdatedPost);

      const result = await postService.publishPost(1);

      expect(result).toEqual(mockUpdatedPost);
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { published: true },
      });
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const mockDeletedPost: Post = {
        id: 1,
        title: 'Deleted Post',
        content: 'Deleted Content',
        published: true,
        authorId: 1,
      };

      prisma.post.delete.mockResolvedValueOnce(mockDeletedPost);

      const result = await postService.deletePost(1);
      expect(result).toEqual(mockDeletedPost);
      expect(prisma.post.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
