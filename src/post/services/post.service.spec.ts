import { Test, TestingModule } from '@nestjs/testing';
import { Post } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import prisma from '../../../test/__mocks__/prisma.service';
import { PostService } from './post.service';

describe('PostService', () => {
  let postService: PostService;

  beforeEach(async () => {
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

      prisma.post.findMany.mockResolvedValueOnce(mockPosts);

      const result = await postService.getPosts({});
      expect(result).toEqual(mockPosts);
      expect(prisma.post.findMany).toHaveBeenCalledWith({});
    });
  });

  describe('getPublishedPosts', () => {
    it('should return only published posts', async () => {
      const mockPublishedPosts: Post[] = [
        { id: 1, title: 'Post 1', content: 'Content 1', published: true, authorId: 1 },
        { id: 3, title: 'Post 3', content: 'Content 3', published: true, authorId: 2 },
      ];

      vi.spyOn(postService, 'getPosts').mockResolvedValueOnce(mockPublishedPosts);

      const result = await postService.getPublishedPosts();
      expect(result).toEqual(mockPublishedPosts);
      expect(postService.getPosts).toHaveBeenCalledWith({
        where: { published: true },
      });
    });
  });

  describe('getFilteredPosts', () => {
    it('should return posts filtered by search string', async () => {
      const searchString = 'test';
      const mockFilteredPosts: Post[] = [
        { id: 1, title: 'Test Post', content: 'Content 1', published: true, authorId: 1 },
        { id: 2, title: 'Post 2', content: 'Test content', published: false, authorId: 2 },
      ];

      vi.spyOn(postService, 'getPosts').mockResolvedValueOnce(mockFilteredPosts);

      const result = await postService.getFilteredPosts(searchString);
      expect(result).toEqual(mockFilteredPosts);
      expect(postService.getPosts).toHaveBeenCalledWith({
        where: {
          OR: [{ title: { contains: searchString } }, { content: { contains: searchString } }],
        },
      });
    });
  });

  describe('createPost', () => {
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
