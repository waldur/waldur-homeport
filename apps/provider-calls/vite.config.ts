import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { waldurBootSplash } from 'waldur-boot-splash/vite';

// Same shape as apps/micro-app-poc: standalone dev serves at the root of its
// own port; dev:subpath serves under /provider-calls/ for the root app's dev
// proxy, matching where nginx serves the production build.
export default defineConfig({
  base: process.env.DEV_SUBPATH ? '/provider-calls/' : '/',
  plugins: [react(), tailwindcss(), waldurBootSplash()],
  server: {
    port: 5181,
  },
});
