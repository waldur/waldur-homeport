import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ['**/*.test.ts', '**/*.test.tsx', 'test/**/*.test.ts'],
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./test/setupTests.js'],
      testTimeout: 10000,
      hookTimeout: 10000,
      teardownTimeout: 10000,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov', 'clover', 'cobertura'],
        reportOnFailure: true,
        reportsDirectory: './coverage',
        exclude: [
          'node_modules/',
          'test/',
          '**/*.test.{ts,tsx}',
          '**/*.fixture.{ts,tsx}',
          '**/*.spec.{ts,tsx}',
          '**/*.d.ts',
          'vite.config.ts',
          'e2e/',
          'src/vendor.ts',
          'src/echarts/',
          'src/metronic/',
          'build.dev/',
          '**/*.config.{ts,js}',
          '**/*.setup.{ts,js}',
        ],
      },
    },
  }),
);
