import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma';

import { PostModule } from './post/post.module';
import { PostService } from './post/services/post.service';

// todo this file
const env = process.env.NODE_ENV;

@Module({
  imports: [
    PostModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // PrismaModule.forRoot({
    //   isGlobal: true,
    //   prismaServiceOptions: {
    //     prismaOptions: {
    //       adapter: process.env.DATABASE_URL,
    //       log:
    //         env === 'production'
    //           ? [
    //               { emit: 'stdout', level: 'warn' },
    //               { emit: 'stdout', level: 'error' },
    //             ]
    //           : [
    //               { emit: 'event', level: 'query' },
    //               { emit: 'stdout', level: 'info' },
    //               { emit: 'stdout', level: 'warn' },
    //               { emit: 'stdout', level: 'error' },
    //             ],
    //     },
    //   },
    // }),
  ],
  // providers: [providePrismaClientExceptionFilter()],
  providers: [PrismaService, PostService],
})
export class AppModule {}
