import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { appConfigFactory } from './config/app-config.factory.js';
import { PostModule } from './post/post.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `config/${process.env.NODE_ENV || 'development'}.env`,
      expandVariables: true,
      isGlobal: true,
    }),
    ConfigModule.forFeature(appConfigFactory),
    PrismaModule,
    PostModule,
  ],
})
export class AppModule {}
