import { Inject, Injectable } from '@nestjs/common';
import { CustomPrismaService } from 'nestjs-prisma/dist/custom';

import { Post, Prisma } from '../../generated/prisma/client';
import { PrismaClientType } from '../../prisma.extension';
import { CreatePostDto } from '../dtos/create-post-draft.dto';

@Injectable()
export class PostService {
  // constructor(private prisma: PrismaService) {}
  constructor(
    // ✅ use `ExtendedPrismaClient` from extension for correct type-safety
    @Inject('PrismaService')
    private prismaService: CustomPrismaService<PrismaClientType>,
  ) {}

  getPost(id: number): Promise<Post | null> {
    return this.prismaService.client.post.findUnique({
      where: { id },
    });
  }

  getPublishedPosts(): Promise<Post[]> {
    return this.getPosts({
      where: { published: true },
    });
  }

  getFilteredPosts(searchString: string): Promise<Post[]> {
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
    return this.prismaService.client.post.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  createDraft(post: CreatePostDto): Promise<Post> {
    const { title, content, authorEmail } = post;

    return this.prismaService.client.post.create({
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
    return this.prismaService.client.post.update({
      where: { id },
      data: { published: true },
    });
  }

  deletePost(id: number): Promise<Post> {
    return this.prismaService.client.post.delete({
      where: { id },
    });
  }
}
