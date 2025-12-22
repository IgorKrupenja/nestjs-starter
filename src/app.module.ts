import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PostModule } from './post/post.module.js';
import { PrismaModule } from './prisma.module.js';

// todo prisma logger + more? from old commit
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
