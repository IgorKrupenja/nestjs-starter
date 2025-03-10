import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule, providePrismaClientExceptionFilter } from 'nestjs-prisma';

import { PostModule } from './post/post.module';

const env = process.env.NODE_ENV;

// const pool = new Pool({
//   host: Resource.MyPostgres.host,
//   port: Resource.MyPostgres.port,
//   user: Resource.MyPostgres.username,
//   password: Resource.MyPostgres.password,
//   database: Resource.MyPostgres.database,
// });

// const rds = Resource.MyPostgres;

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
          // datasourceUrl: `postgresql://${rds.username}:${rds.password}@${rds.host}:${rds.port}/${rds.database}`,
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
