import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig, PluginOption } from 'vite';
import { plugin as markdownPlugin, Mode } from 'vite-plugin-markdown';
import svgr from 'vite-plugin-svgr';

import reactDisplayNamePlugin from './vite-plugin-react-displayname';

// No Tailwind plugin here — nothing the main app bundle reaches imports
// tailwind.css. BaseButtonTw/tailwind.css only exist in Storybook
// (.storybook/main.ts has its own, separate Tailwind Vite plugin) and the
// Playwright parity spec (which runs against Storybook, not this app). See
// docs/tailwind-shadcn-migration-notes.md.
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
      // RabbitMQ web-STOMP for the realtime module. Production exposes it at
      // /rmqws-stomp on the API host (Caddy/ingress); dev serves the same path
      // here so the client needs no environment-specific configuration.
      '/rmqws-stomp': {
        target: process.env.VITE_STOMP_WS_URL || 'ws://localhost:15674',
        ws: true,
        rewrite: (path) => path.replace(/^\/rmqws-stomp/, '/ws'),
      },
      // apps/micro-app-poc's own dev server, reachable at this same
      // subpath in production (see docs/micro-apps.md). Requires it
      // running separately with its base set to match — see its
      // dev:subpath script. ws: true forwards its own Vite HMR client,
      // same as /rmqws-stomp above. Hardcoded to this one app for now;
      // generalizing to every apps/* member (each on its own dev port)
      // would need a small discoverable ports registry, not worth it
      // until there's a second real one.
      '/micro-app-poc': {
        target: 'http://localhost:5180',
        changeOrigin: true,
        ws: true,
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
