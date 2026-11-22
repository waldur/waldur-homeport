import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { waldurBootSplash } from 'waldur-boot-splash/vite';

// Same shape as apps/provider-calls: standalone dev serves at the root of its
// own port; dev:subpath serves under /ai-inference/ for the root app's dev
// proxy, matching where nginx serves the production build.
export default defineConfig({
  base: process.env.DEV_SUBPATH ? '/ai-inference/' : '/',
  plugins: [react(), tailwindcss(), waldurBootSplash()],
  server: {
    port: 5183,
  },
});
