import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ['**/*.test.ts', '**/*.test.tsx'],
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./test/setupTests.js'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov', 'clover', 'cobertura'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx,js,jsx}'],
        exclude: [
          'node_modules/',
          'test/',
          '**/*.test.{ts,tsx}',
          '**/*.d.ts',
          'vite.config.ts',
          'cypress/',
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
