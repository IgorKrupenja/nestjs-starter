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
  Query,
  UseInterceptors,
  Version,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOkDataResponse } from '@src/common/decorators/api-data-response.decorator.js';
import { DataResponseDto } from '@src/common/dtos/data-response.dto.js';
import { PostModel } from '@src/generated/prisma/models';

import { ApiOkDataWithMetaResponse } from '../../common/decorators/api-data-with-meta-response.decorator.js';
import { CountMetaDto } from '../../common/dtos/count-meta.dto.js';
import { DataWithMetaResponseDto } from '../../common/dtos/data-with-meta-response.dto.js';
import { RequestLogger } from '../../common/interceptors/request-logger.interceptor.js';
import { CreatePostDto } from '../dtos/create-post-draft.dto.js';
import { PostDto } from '../dtos/post.dto.js';
import { PostService } from '../services/post.service.js';

@ApiTags('Posts')
@Controller('posts')
@UseInterceptors(RequestLogger)
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Version('1')
  @Get('/:id')
  @ApiOkDataResponse({
    data: { type: PostDto },
  })
  @ApiOperation({ summary: 'Get a post by ID' })
  async getPost(@Param('id', ParseIntPipe) id: number): Promise<DataResponseDto<PostDto>> {
    const post = await this.postService.getPost(id);
    if (!post) throw new NotFoundException(`Post with id ${id} not found`);
    return { data: post };
  }

  @Version('1')
  @Get('/')
  @ApiOkDataWithMetaResponse({
    data: { type: PostDto, isArray: true },
    meta: { type: CountMetaDto },
  })
  @ApiOperation({ summary: 'Get all published posts' })
  async getPublishedPosts(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ): Promise<DataWithMetaResponseDto<PostModel[], CountMetaDto>> {
    return this.postService.getPublishedPosts({ limit, offset });
  }

  @Version('1')
  @Get('/search/:searchString')
  @ApiOkDataWithMetaResponse({
    data: { type: PostDto, isArray: true },
    meta: { type: CountMetaDto },
  })
  @ApiOperation({ summary: 'Search posts by title or content' })
  async getFilteredPosts(
    @Param('searchString') searchString: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ): Promise<DataWithMetaResponseDto<PostModel[], CountMetaDto>> {
    return this.postService.getFilteredPosts(searchString, { limit, offset });
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
  async publishPost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return this.postService.publishPost(id);
  }

  @Version('1')
  @Delete('/:id')
  @ApiOkResponse({ description: 'Post deleted successfully' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiOperation({ summary: 'Delete a post' })
  async deletePost(@Param('id', ParseIntPipe) id: number): Promise<PostModel> {
    return this.postService.deletePost(id);
  }
}
