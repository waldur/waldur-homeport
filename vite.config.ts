import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, PluginOption } from 'vite';
import { plugin as markdownPlugin, Mode } from 'vite-plugin-markdown';
import svgr from 'vite-plugin-svgr';

import reactDisplayNamePlugin from './vite-plugin-react-displayname';

// @vitejs/plugin-react and vite-plugin-svgr ship their own pinned vite types,
// which TS can't reconcile with the top-level vite types after the develop
// merge. Casting at the plugin slot keeps the rest of the config strictly
// typed without hiding the actual plugin objects.
const plugins: PluginOption[] = [
  react() as unknown as PluginOption,
  svgr({
    include: '**/*.svg',
    svgrOptions: {
      dimensions: false,
      plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
    },
  }) as unknown as PluginOption,
  markdownPlugin({ mode: [Mode.REACT] }) as unknown as PluginOption,
  reactDisplayNamePlugin(),
];

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target:
          process.env.VITE_PROXY_TARGET ||
          process.env.VITE_API_URL ||
          'http://localhost:8000',
        changeOrigin: true,
        secure: process.env.VITE_PROXY_SECURE !== 'false',
      },
      '/lk-jwt': {
        target: process.env.VITE_LK_JWT_URL || 'http://localhost:8090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lk-jwt/, ''),
      },
    },
  },
  plugins,
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
        ],
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    sourcemap: true,
  },
});
