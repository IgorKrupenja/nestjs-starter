// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

const name = 'nestjs-starter';

export default $config({
  app(input) {
    return {
      name,
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      // todo gh actions deploy https://craig.madethis.co.uk/2024/sst-github-actions
      // todo readme - also mention CI/CD
      // todo simplify "Set up the project" in Readme, make setup script more prominent
      // todo package update error - GH checks are also failing
      providers: {
        aws: {
          profile: input.stage === 'production' ? `${name}-production` : `${name}-dev`,
        },
      },
    };
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  async run() {
    const vpc = new sst.aws.Vpc('StarterVpc');
    const cluster = new sst.aws.Cluster('StarterCluster', { vpc });
    const rds = new sst.aws.Postgres('StarterPostgres', {
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

    new sst.aws.Service('StarterService', {
      cluster,
      link: [rds],
      environment: { DATABASE_URL },
      loadBalancer: {
        rules: [{ listen: '80/http', forward: '3000/http' }],
      },
      dev: {
        command: 'pnpm dev',
      },
      capacity: $app.stage === 'production' ? undefined : 'spot',
    });
  },
});
