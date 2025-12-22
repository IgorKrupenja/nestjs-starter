import { Injectable } from '@nestjs/common';

import { Post, Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma.service';
import { CreatePostDto } from '../dtos/create-post-draft.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  getPost(id: number): Promise<Post | null> {
    return this.prisma.post.findUnique({
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
