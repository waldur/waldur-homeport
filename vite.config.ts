import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, PluginOption } from 'vite';
import { plugin as markdownPlugin, Mode } from 'vite-plugin-markdown';
import svgr from 'vite-plugin-svgr';

import reactDisplayNamePlugin from './vite-plugin-react-displayname';

const plugins: PluginOption[] = [
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
          // _scroll.scss uses @-moz-document url-prefix() for Firefox-only
          // scrollbar overrides; Sass 1.100+ actively warns on this. Mute it
          // so real warnings stay visible in the build log.
          'moz-document',
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
