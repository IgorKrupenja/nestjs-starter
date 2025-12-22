import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CustomPrismaModule } from 'nestjs-prisma/dist/custom';

import { PostModule } from './post/post.module';
import { prisma } from './prisma.extension';

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
    CustomPrismaModule.forRootAsync({
      name: 'PrismaService',
      useFactory: () => {
        return prisma;
      },
    }),
  ],
  // providers: [providePrismaClientExceptionFilter()],
})
export class AppModule {}
