import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { plugin as markdownPlugin, Mode } from 'vite-plugin-markdown';
import svgr from 'vite-plugin-svgr';

import reactDisplayNamePlugin from './vite-plugin-react-displayname';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
      'react-windowed-select': path.resolve(
        'node_modules/react-windowed-select/dist/main.js',
      ),
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
    },
  },
  plugins: [
    react(),
    svgr({
      include: '**/*.svg',
      svgrOptions: {
        dimensions: false,
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
      },
    }),
    markdownPlugin({ mode: [Mode.REACT] }),
    reactDisplayNamePlugin(),
  ],
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
  build: {
    sourcemap: true,
  },
});
