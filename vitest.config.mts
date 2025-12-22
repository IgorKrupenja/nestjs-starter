import swc from 'unplugin-swc';
import { configDefaults, defineConfig } from 'vitest/config';

// The file has .mts extension since CJS build of Vite is deprecated
// https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated
export default defineConfig({
  test: {
    globals: true,
    root: './',
    coverage: {
      exclude: [
        ...configDefaults.exclude,
        'prisma/seeders/seed.ts',
        'src/main.ts',
        '**/*.module.ts',
        'generated/**/*',
      ],
    },
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
});
