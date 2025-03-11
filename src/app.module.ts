import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule, providePrismaClientExceptionFilter } from 'nestjs-prisma';

import { PostModule } from './post/post.module';

const env = process.env.NODE_ENV;
console.log('IGOR prisma env', env);

@Module({
  imports: [
    PostModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        prismaOptions: {
          log:
            env === 'production'
              ? [
                  { emit: 'stdout', level: 'warn' },
                  { emit: 'stdout', level: 'error' },
                ]
              : [
                  { emit: 'event', level: 'query' },
                  { emit: 'stdout', level: 'info' },
                  { emit: 'stdout', level: 'warn' },
                  { emit: 'stdout', level: 'error' },
                ],
        },
      },
    }),
  ],
  providers: [providePrismaClientExceptionFilter()],
})
export class AppModule {}
