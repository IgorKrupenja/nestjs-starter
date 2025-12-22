import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PostModule } from './post/post.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    PrismaModule,
    PostModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
