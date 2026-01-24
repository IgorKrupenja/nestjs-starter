import { Module } from '@nestjs/common';
import { PostController } from '@src/post/controllers/post.controller.js';
import { PostService } from '@src/post/services/post.service.js';

@Module({
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
