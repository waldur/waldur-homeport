import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Deliberately NOT copying waldur-homeport's own vite.config.ts (no `@/`
// resolve.alias, no proxy config, no shared plugin list). If this app
// needs something from there to build, that's exactly the kind of
// undeclared coupling this whole package is meant to catch.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5180,
  },
});
