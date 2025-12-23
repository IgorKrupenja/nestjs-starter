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
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PostModel } from '@src/generated/prisma/models';

import { CreatePostDto } from '../dtos/create-post-draft.dto.js';
import { PostService } from '../services/post.service.js';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Version('1')
  @Get('/:id')
  @ApiOkResponse({ description: 'Post found' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiOperation({ summary: 'Get a post by ID' })
  // todo do i need this?
  @ApiParam({ name: 'id', description: 'Post ID', type: Number })
  async getPost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    const post = await this.postService.getPost(id);
    if (!post) throw new NotFoundException(`Post with id ${id} not found`);
    return post;
  }

  @Version('1')
  @Get('/')
  @ApiOkResponse({ description: 'List of published posts' })
  @ApiOperation({ summary: 'Get all published posts' })
  async getPublishedPosts(): Promise<PostModel[]> {
    return this.postService.getPublishedPosts();
  }

  @Version('1')
  @Get('/search/:searchString')
  @ApiOkResponse({ description: 'List of matching posts' })
  @ApiOperation({ summary: 'Search posts by title or content' })
  @ApiParam({ name: 'searchString', description: 'Search term', type: String })
  async getFilteredPosts(@Param('searchString') searchString: string): Promise<PostModel[]> {
    return this.postService.getFilteredPosts(searchString);
  }

  @Version('1')
  @Post('/')
  @ApiOkResponse({ description: 'Post created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiOperation({ summary: 'Create a new draft post' })
  async createDraft(@Body() post: CreatePostDto): Promise<PostModel> {
    return this.postService.createDraft(post);
  }

  @Version('1')
  @Put('/publish/:id')
  @ApiOkResponse({ description: 'Post published successfully' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiOperation({ summary: 'Publish a draft post' })
  @ApiParam({ name: 'id', description: 'Post ID', type: Number })
  async publishPost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return this.postService.publishPost(id);
  }

  @Version('1')
  @Delete('/:id')
  @ApiOkResponse({ description: 'Post deleted successfully' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', description: 'Post ID', type: Number })
  async deletePost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return this.postService.deletePost(id);
  }
}
