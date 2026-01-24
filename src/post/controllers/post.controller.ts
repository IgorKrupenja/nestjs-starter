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
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiOkDataResponse } from '@src/common/decorators/api-data-response.decorator.js';
import { ApiOkDataWithMetaResponse } from '@src/common/decorators/api-data-with-meta-response.decorator.js';
import { CountMetaDto } from '@src/common/dtos/count-meta.dto.js';
import { DataResponseDto } from '@src/common/dtos/data-response.dto.js';
import { DataWithMetaResponseDto } from '@src/common/dtos/data-with-meta-response.dto.js';
import { RequestLogger } from '@src/common/interceptors/request-logger.interceptor.js';
import { CreatePostDraftDto } from '@src/post/dtos/create-post-draft.dto.js';
import { PostDto } from '@src/post/dtos/post.dto.js';
import { PostService } from '@src/post/services/post.service.js';
import { plainToInstance } from 'class-transformer';

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
    return { data: plainToInstance(PostDto, post) };
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
  ): Promise<DataWithMetaResponseDto<PostDto[], CountMetaDto>> {
    const response = await this.postService.getPublishedPosts({ limit, offset });
    return {
      data: plainToInstance(PostDto, response.data),
      meta: response.meta,
    };
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
  ): Promise<DataWithMetaResponseDto<PostDto[], CountMetaDto>> {
    const response = await this.postService.getFilteredPosts(searchString, { limit, offset });
    return {
      data: plainToInstance(PostDto, response.data),
      meta: response.meta,
    };
  }

  @Version('1')
  @Post('/')
  @ApiOkResponse({ description: 'Post created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiBody({ type: CreatePostDraftDto })
  @ApiOperation({ summary: 'Create a new draft post' })
  async createDraft(@Body() post: CreatePostDraftDto): Promise<PostDto> {
    const createdPost = await this.postService.createDraft(post);
    return plainToInstance(PostDto, createdPost);
  }

  @Version('1')
  @Put('/publish/:id')
  @ApiOkResponse({ description: 'Post published successfully' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiOperation({ summary: 'Publish a draft post' })
  async publishPost(@Param('id', ParseIntPipe) id: number): Promise<PostDto> {
    const publishedPost = await this.postService.publishPost(id);
    return plainToInstance(PostDto, publishedPost);
  }

  @Version('1')
  @Delete('/:id')
  @ApiOkResponse({ description: 'Post deleted successfully' })
  @ApiNotFoundResponse({ description: 'Post not found' })
  @ApiOperation({ summary: 'Delete a post' })
  async deletePost(@Param('id', ParseIntPipe) id: number): Promise<PostDto> {
    const deletedPost = await this.postService.deletePost(id);
    return plainToInstance(PostDto, deletedPost);
  }
}
