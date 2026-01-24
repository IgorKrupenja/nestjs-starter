import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfigFactory } from '@src/config/app-config.factory.js';
import { HealthModule } from '@src/health/health.module.js';
import { PostModule } from '@src/post/post.module.js';
import { PrismaModule } from '@src/prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `config/${process.env.NODE_ENV || 'development'}.env`,
      expandVariables: true,
      isGlobal: true,
    }),
    ConfigModule.forFeature(appConfigFactory),
    PrismaModule,
    HealthModule,
    PostModule,
  ],
})
export class AppModule {}
