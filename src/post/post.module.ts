import { Module } from '@nestjs/common';

import { PostController } from './controllers/post.controller.js';
import { PostService } from './services/post.service.js';

@Module({
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
