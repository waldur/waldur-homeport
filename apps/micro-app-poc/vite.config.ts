import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Deliberately NOT copying waldur-homeport's own vite.config.ts (no `@/`
// resolve.alias, no proxy config, no shared plugin list). If this app
// needs something from there to build, that's exactly the kind of
// undeclared coupling this whole package is meant to catch.
export default defineConfig({
  // Only prefixed when running proxied under the root app's own dev server
  // (see its /micro-app-poc proxy entry and this app's dev:subpath script)
  // — standalone dev (plain `yarn dev`, what .claude/launch.json uses)
  // stays at root so http://localhost:5180/ keeps working unchanged.
  // Without this, Vite's own special dev paths (/@vite/client, /@fs/*,
  // /node_modules/.vite/*) would collide with the root app's own — both
  // dev servers otherwise expect to own those paths at the origin root.
  base: process.env.DEV_SUBPATH ? '/micro-app-poc/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5180,
  },
});
