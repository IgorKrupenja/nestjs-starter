import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PostModule } from './post/post.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

// todo prisma logger + more? from old commit
@Module({
  imports: [
    PrismaModule,
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
})
export class AppModule {}
