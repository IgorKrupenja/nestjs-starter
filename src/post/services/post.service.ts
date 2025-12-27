import { Injectable } from '@nestjs/common';
import { Post, Prisma } from '@src/generated/prisma/client.js';
import { PrismaService } from '@src/prisma/services/prisma.service.js';

import { PaginatedResponseDto } from '../../common/dtos/data-with-meta-response.dto.js';
import { CreatePostDto } from '../dtos/create-post-draft.dto.js';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  getPost(id: number): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
    });
  }

  getPublishedPosts(params?: {
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponseDto<Post[]>> {
    return this.getPosts({
      where: { published: true },
      take: params?.limit,
      skip: params?.offset,
    });
  }

  getFilteredPosts(
    searchString: string,
    params?: { limit?: number; offset?: number },
  ): Promise<PaginatedResponseDto<Post[]>> {
    return this.getPosts({
      where: {
        OR: [
          {
            title: { contains: searchString },
          },
          {
            content: { contains: searchString },
          },
        ],
      },
      take: params?.limit,
      skip: params?.offset,
    });
  }

  async getPosts(params: Prisma.PostFindManyArgs): Promise<PaginatedResponseDto<Post[]>> {
    const { where } = params;
    const [data, count] = await this.prisma.$transaction([
      this.prisma.post.findMany(params),
      this.prisma.post.count({ where }),
    ]);

    return { data, meta: { count } };
  }

  createDraft(post: CreatePostDto): Promise<Post> {
    const { title, content, authorEmail } = post;

    return this.prisma.post.create({
      data: {
        title,
        content,
        author: {
          connect: { email: authorEmail },
        },
      },
    });
  }

  publishPost(id: number): Promise<Post> {
    return this.prisma.post.update({
      where: { id },
      data: { published: true },
    });
  }

  deletePost(id: number): Promise<Post> {
    return this.prisma.post.delete({
      where: { id },
    });
  }
}
