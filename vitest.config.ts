import { fileURLToPath } from 'node:url';
import path from 'path';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';
const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      teardownTimeout: 10000,
      coverage: {
        provider: 'v8',
        reporter: ['cobertura'],
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
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            include: ['**/*.test.ts', '**/*.test.tsx', 'test/**/*.test.ts'],
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./test/setupTests.js'],
            alias: [
              {
                find: /^.*\.svg$/,
                replacement: path.resolve(__dirname, './test/mocks/svg.tsx'),
              },
            ],
            testTimeout: 10000,
            hookTimeout: 10000,
          },
        },
        {
          extends: true,
          plugins: [
            // The plugin will run tests for the stories defined in your Storybook config
            // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
            storybookTest({
              configDir: path.join(dirname, '.storybook'),
            }),
          ],
          // Vite's dependency scanner only discovers deps to pre-bundle by
          // crawling from project source files — it can't see into
          // @storybook/addon-vitest's own internal setup file, so none of
          // that file's transitive CJS deps get esbuild's pre-bundle pass,
          // and each hits a browser-native ESM named-export error ("does
          // not provide an export named 'X'") when served on-demand
          // instead. Listed explicitly since `optimizeDeps.entries`
          // pointed at the setup file didn't get esbuild's static scanner
          // to trace through it either (tried, reverted).
          optimizeDeps: {
            include: ['aria-query', 'lz-string', 'pretty-format'],
          },
          test: {
            name: 'storybook',
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({}),
              instances: [
                {
                  browser: 'chromium',
                },
              ],
            },
          },
        },
      ],
    },
  }),
);
