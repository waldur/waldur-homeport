# waldur-micro-app-poc

A standalone Vite + React app that consumes `packages/*` the way a real,
separate micro-frontend would — not through `waldur-homeport`'s own
`src/`, its `vite.config.ts` aliases, or its Tailwind theme overrides.
Proves the extracted packages are genuinely portable, not just
importable via workspace hoisting.

## Run it

```bash
cp apps/micro-app-poc/.env.example apps/micro-app-poc/.env  # once, point VITE_API_URL at a real backend
yarn workspace waldur-micro-app-poc dev      # dev server, port 5180
yarn apps:typecheck                          # tsc --noEmit for every apps/* member
yarn apps:build                              # vite build for every apps/* member
```

## What it touches

`src/App.tsx` calls a real entry point from each of the seven extracted
packages — not just an import — with no backend running:

- **`waldur-ui`**: renders `BaseButton` (`primary`/`secondary`/`danger`).
- **`waldur-design-tokens`**: `initBrandTokens()` themes the brand-reactive
  variants from a single hex color, with no code borrowed from
  `afterBootstrap.tsx`.
- **`waldur-i18n-runtime`**: `translate()`, safely falling back to the raw
  string with no catalog loaded.
- **`waldur-auth-core`**: `configureAuthCore()` with a real
  `localStorage`-backed `StorageAdapter` (namespaced under
  `waldur-micro-app-poc/`), then `isAuthenticated()`.
- **`waldur-api-client`**: `fixURL()`.
- **`waldur-runtime-config`**: `getApiUrlFromMeta()`, reading the same
  `VITE_API_URL`-backed `<meta name="api-url">` tag waldur-homeport's own
  `index.html` uses (see `.env.example`); and `fetchRuntimeConfig()` — a
  real network request via `waldur-js-client`'s `configurationRetrieve()`,
  wired up through `waldur-auth-core`'s `initApiClient()` exactly as
  `src/core/bootstrap.ts` does. Requires a live backend at `VITE_API_URL`;
  with none running the request fails and the failure is shown in the
  checks list below, same as a real host app would surface it.
- **`waldur-telemetry`**: `initSentry()` with an empty DSN, which the SDK
  no-ops on safely.

## Deployment

**Not shipped in production, but live-tested on every MR.** This app's
`package.json` sets `"waldur": { "deploy": false }`, so real production
images skip it — but CI/preview builds override that, so it's still built,
served, and reachable at `/micro-app-poc/` in every MR's live k8s preview.
It's a portability proof, not a deployable. See
[docs/micro-apps.md](../../docs/micro-apps.md) for how the `apps/*` build,
routing, and `waldur.deploy` opt-out actually work, and how to add a new,
actually-deployable micro-app.

## What this surfaced

- **Tailwind's default content auto-detection does not reach sibling
  workspace packages.** `waldur-ui`'s `BaseButton.tsx` resolves only
  through a `node_modules` symlink, which Tailwind v4 skips by
  convention. `src/tailwind.css` needs an explicit
  `@source '../../../packages/ui/src';` — the correct fix for a real
  standalone consumer, not a workaround.
- **`packages/*` are not strict-TypeScript clean.** This app's
  `tsconfig.json` has to mirror `waldur-homeport`'s own loose root
  settings (`strict: false`, `strictNullChecks: false`,
  `noImplicitAny: false`) — turning strict mode on here surfaces ~80 real
  errors across `api-client`, `auth-core`, and `design-tokens`. Those
  packages have always relied on the host's loose config to typecheck
  clean, not on being correct under normal strict TypeScript. Hardening
  them is follow-up work, not in this skeleton's scope.
- **`waldur-api-client`/`waldur-auth-core` assume `waldur-js-client` is
  available as a workspace-hoisted singleton.** Both deliberately omit it
  from their own `package.json` (see the comment on the import in
  `packages/api-client/src/requestHelpers.ts`) so every consumer shares
  root's exact pinned/linked SDK build instead of risking a second,
  drifted copy. That resolves fine for any app inside this workspace
  (this one included) but is a real constraint worth knowing before
  assuming these two packages work from a fully separate install.
- **No Metronic-workaround CSS needed.** `waldur-homeport`'s own
  `tailwind.css` pins `--spacing`/`--text-*`/`--radius-*` to px because
  Metronic forces a 13px root font-size. This app has no Metronic, so
  Tailwind's default rem scale (assuming 16px) is already correct with no
  override — evidence that override is a homeport-specific patch, not
  something `BaseButton` itself requires.
