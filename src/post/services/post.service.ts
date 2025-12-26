import { Injectable } from '@nestjs/common';
import { Post, Prisma } from '@src/generated/prisma/client.js';
import { PrismaService } from '@src/prisma/services/prisma.service.js';

import { CreatePostDto } from '../dtos/create-post-draft.dto.js';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  getPost(id: number): Promise<Post | null> {
    return this.prisma.post.findUnique({
      where: { id },
    });
  }

  getPublishedPosts(params?: { limit?: number; offset?: number }): Promise<Post[]> {
    return this.getPosts({
      where: { published: true },
      take: params?.limit,
      skip: params?.offset,
    });
  }

  getFilteredPosts(
    searchString: string,
    params?: { limit?: number; offset?: number },
  ): Promise<Post[]> {
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

  getPosts(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PostWhereUniqueInput;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput;
  }): Promise<Post[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.post.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
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
