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
} from '@nestjs/common';
import { Post as PostModel } from '@prisma/client';

import { CreatePostDto } from '../dtos/create-post-draft.dto';
import { PostService } from '../services/post.service';

@Controller('/v1/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('/:id')
  async getPost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    const post = await this.postService.getPost(id);
    if (!post) throw new NotFoundException(`Post with id ${id} not found`);
    return post;
  }

  @Get('/')
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.getPublishedPosts();
  }

  @Get('/search/:searchString')
  async getFilteredPosts(@Param('searchString') searchString: string): Promise<PostModel[]> {
    return this.postService.getFilteredPosts(searchString);
  }

  @Post('/')
  async createDraft(@Body() post: CreatePostDto): Promise<PostModel> {
    return this.postService.createDraft(post);
  }

  @Put('/publish/:id')
  async publishPost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return this.postService.publishPost(id);
  }

  @Delete('/:id')
  async deletePost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return this.postService.deletePost(id);
  }
}
