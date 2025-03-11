// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'nestjs-starter',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      // todo https? -- added below but need to test
      // todo prisma logs in prod visible
      // todo gh actions deploy
      providers: {
        aws: {
          profile: input.stage,
        },
      },
    };
  },
  // eslint-disable-next-line @typescript-eslint/require-await
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

    const DATABASE_URL = $interpolate`postgresql://${rds.username}:${rds.password}@${rds.host}:${rds.port}/${rds.database}`;

    new sst.aws.Service('MyService', {
      cluster,
      link: [rds],
      environment: { DATABASE_URL },
      loadBalancer: {
        rules: [
          { listen: '80/http', redirect: '443/https' },
          { listen: '443/https', forward: '3000/http' },
        ],
      },
      dev: {
        command: 'pnpm dev',
      },
      capacity: 'spot',
    });
  },
});
