// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'nestjs-starter',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: {
          profile: input.stage === 'production' ? 'personal-production' : 'personal-dev',
        },
      },
    };
  },
  async run() {
    const vpc = new sst.aws.Vpc('MyVpc');
    const cluster = new sst.aws.Cluster('MyCluster', { vpc });
    const rds = new sst.aws.Postgres('MyPostgres', {
      vpc,
      dev: {
        username: 'postgres',
        password: 'password',
        database: 'nestjs_starter',
        host: 'localhost',
        port: 5432,
      },
    });

    const DATABASE_URL = $interpolate`postgresql://postgres:postgres@localhost:5432/nestjs_starter?schema=starter`;

    new sst.aws.Service('MyService', {
      cluster,
      link: [rds],
      environment: { DATABASE_URL },
      loadBalancer: {
        ports: [{ listen: '80/http', forward: '3000/http' }],
      },
      dev: {
        command: 'pnpm dev',
      },
    });
  },
});
