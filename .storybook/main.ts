import path from 'path';
import { fileURLToPath } from 'url';

import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import { mergeConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(ts|tsx)',
    '../packages/*/src/**/*.stories.@(ts|tsx)',
  ],
  addons: [
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    'storybook-addon-pseudo-states',
  ],
  framework: '@storybook/react-vite',
  // Deliberately hand-written, not reused from ../vite.config.ts's plugins
  // array — that array registers its own react()/svgr()/etc. which would
  // double up with @storybook/react-vite's own React handling. Keep the
  // alias/scss/define values below in sync with vite.config.ts by hand;
  // they change rarely.
  viteFinal(viteConfig) {
    return Promise.resolve(
      mergeConfig(viteConfig, {
        plugins: [tailwindcss()],
        resolve: {
          alias: {
            '@': path.resolve(__dirname, '../src/'),
          },
        },
        css: {
          preprocessorOptions: {
            scss: {
              silenceDeprecations: [
                'import',
                'abs-percent',
                'function-units',
                'color-functions',
                'slash-div',
                'global-builtin',
                'if-function',
                'moz-document',
              ],
            },
          },
        },
        define: {
          global: 'globalThis',
        },
      }),
    );
  },
};
export default config;
