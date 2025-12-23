import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Version,
} from '@nestjs/common';
import { PostModel } from '@src/generated/prisma/models';

import { CreatePostDto } from '../dtos/create-post-draft.dto.js';
import { PostService } from '../services/post.service.js';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Version('1')
  @Get('/:id')
  async getPost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    const post = await this.postService.getPost(id);
    if (!post) throw new NotFoundException(`Post with id ${id} not found`);
    return post;
  }

  @Version('1')
  @Get('/')
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.getPublishedPosts();
  }

  @Version('1')
  @Get('/search/:searchString')
  async getFilteredPosts(@Param('searchString') searchString: string): Promise<PostModel[]> {
    return this.postService.getFilteredPosts(searchString);
  }

  @Version('1')
  @Post('/')
  async createDraft(@Body() post: CreatePostDto): Promise<PostModel> {
    return this.postService.createDraft(post);
  }

  @Version('1')
  @Put('/publish/:id')
  async publishPost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return this.postService.publishPost(id);
  }

  @Version('1')
  @Delete('/:id')
  async deletePost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return this.postService.deletePost(id);
  }
}
