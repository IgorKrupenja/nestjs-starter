import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Post as PostModel } from './generated/prisma/client';
import { describe } from 'vitest';

import { PostController } from './post.controller';
import { PostService } from '../services/post.service';

describe('PostController', () => {
  let postController: PostController;
  let postService: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: {
            getPost: vi.fn(),
            getPublishedPosts: vi.fn(),
            getFilteredPosts: vi.fn(),
            createDraft: vi.fn(),
            publishPost: vi.fn(),
            deletePost: vi.fn(),
          },
        },
      ],
    }).compile();

    postController = module.get<PostController>(PostController);
    postService = module.get<PostService>(PostService);
  });

  describe('getPost', () => {
    it('should return a post by id', async () => {
      const mockPost: PostModel = {
        id: 1,
        title: 'Test Post',
        content: 'Test Content',
        published: true,
        authorId: 1,
      };
      vi.spyOn(postService, 'getPost').mockResolvedValueOnce(mockPost);

      const result = await postController.getPost(1);
      expect(result).toEqual(mockPost);
      expect(postService.getPost).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if post is not found', async () => {
      const id = 1;
      vi.spyOn(postService, 'getPost').mockResolvedValueOnce(null);

      await expect(postController.getPost(id)).rejects.toThrow(NotFoundException);
      expect(postService.getPost).toHaveBeenCalledWith(id);
    });
  });

  describe('getPublishedPosts', () => {
    it('should return all published posts', async () => {
      const mockPosts: PostModel[] = [
        { id: 1, title: 'Post 1', content: 'Content 1', published: true, authorId: 1 },
        { id: 2, title: 'Post 2', content: 'Content 2', published: true, authorId: 2 },
      ];
      vi.spyOn(postService, 'getPublishedPosts').mockResolvedValueOnce(mockPosts);

      const result = await postController.getPublishedPosts();
      expect(result).toEqual(mockPosts);
      expect(postService.getPublishedPosts).toHaveBeenCalled();
    });
  });

  describe('getFilteredPosts', () => {
    it('should return filtered posts', async () => {
      const mockPosts: PostModel[] = [
        { id: 1, title: 'Test Post', content: 'Test Content', published: true, authorId: 1 },
      ];
      vi.spyOn(postService, 'getFilteredPosts').mockResolvedValueOnce(mockPosts);

      const result = await postController.getFilteredPosts('Test');
      expect(result).toEqual(mockPosts);
      expect(postService.getFilteredPosts).toHaveBeenCalledWith('Test');
    });
  });

  describe('createDraft', () => {
    it('should create a new draft post', async () => {
      const mockPost: PostModel = {
        id: 1,
        title: 'New Post',
        content: 'New Content',
        published: false,
        authorId: 1,
      };

      const postDto = {
        title: 'New Post',
        content: 'New Content',
        authorEmail: 'test@example.com',
      };

      vi.spyOn(postService, 'createDraft').mockResolvedValueOnce(mockPost);

      const result = await postController.createDraft(postDto);
      expect(result).toEqual(mockPost);
      expect(postService.createDraft).toHaveBeenCalledWith(postDto);
    });
  });

  describe('publishPost', () => {
    it('should publish a post', async () => {
      const mockPost: PostModel = {
        id: 1,
        title: 'Published Post',
        content: 'Published Content',
        published: true,
        authorId: 1,
      };
      vi.spyOn(postService, 'publishPost').mockResolvedValueOnce(mockPost);

      const result = await postController.publishPost(1);
      expect(result).toEqual(mockPost);
      expect(postService.publishPost).toHaveBeenCalledWith(1);
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      const mockPost: PostModel = {
        id: 1,
        title: 'Deleted Post',
        content: 'Deleted Content',
        published: true,
        authorId: 1,
      };
      vi.spyOn(postService, 'deletePost').mockResolvedValueOnce(mockPost);

      const result = await postController.deletePost(1);
      expect(result).toEqual(mockPost);
      expect(postService.deletePost).toHaveBeenCalledWith(1);
    });
  });
});
