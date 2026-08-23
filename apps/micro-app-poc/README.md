# waldur-micro-app-poc

A standalone Vite + React app that consumes `packages/*` the way a real,
separate micro-frontend would — not through `waldur-homeport`'s own
`src/`, its `vite.config.ts` aliases, or its Tailwind theme overrides.
Proves the extracted packages are genuinely portable, not just
importable via workspace hoisting.

## Run it

```bash
cp apps/micro-app-poc/.env.example apps/micro-app-poc/.env  # once, point VITE_API_URL at a real backend
yarn workspace waldur-micro-app-poc dev      # standalone dev server, port 5180
yarn apps:typecheck                          # tsc --noEmit for every apps/* member
yarn apps:build                              # vite build for every apps/* member
```

### Under the root app's own dev server, at `/micro-app-poc/`

Mirrors the production nginx subpath routing (see
[docs/micro-apps.md](../../docs/micro-apps.md)), with real HMR, for testing
subpath-specific concerns locally (asset base-path resolution, real
same-origin session sharing) without a full Docker build:

```bash
yarn workspace waldur-micro-app-poc dev:subpath   # this app, base set to /micro-app-poc/
yarn start                                        # root app, in a second terminal — proxies /micro-app-poc to the above
```

Then visit `http://localhost:8001/micro-app-poc/`. The root app's
`vite.config.ts` proxy entry is hardcoded to this one app's port for now —
see its comment for why generalizing to more `apps/*` members isn't worth
it yet.

## What it touches

`src/App.tsx` calls a real entry point from several of the extracted
packages — not just an import — with no backend running:

- **`waldur-design-tokens`**: `initBrandTokens()` themes the brand-reactive
  variants from a single hex color, with no code borrowed from
  `afterBootstrap.tsx`.
- **`waldur-auth-core`**: `configureAuthCore()` with a real
  `localStorage`-backed `StorageAdapter` reading/writing the exact
  `waldur/auth/*` keys `waldur-homeport`'s own `src/core/StorageManager.ts`
  uses (not namespaced) — same-origin session sharing, not an isolated
  demo: a user already logged into the root app shouldn't have to log in
  again on this subpath.
- **`waldur-runtime-config`**: `getApiUrlFromMeta()`, reading the same
  `VITE_API_URL`-backed `<meta name="api-url">` tag waldur-homeport's own
  `index.html` uses (see `.env.example`), wired up through
  `waldur-auth-core`'s `initApiClient()` exactly as `src/core/bootstrap.ts`
  does.
- **`waldur-telemetry`**: `initSentry()` with an empty DSN, which the SDK
  no-ops on safely.

## Dashboard mock

The app's only page — `OrgDashboardMock.tsx` composes the `Dashboard/*`
primitives from `packages/ui` (`StatCard`, `StatusPill`, `DataTable`,
`Sidebar`, `TopBar`) into a full page matching an organization-admin
dashboard mockup, wired to real Waldur data via `waldur-js-client`
(`customersList`/`projectsList`/`invoicesList`/`projectsListUsersCount`).
Moved here from `packages/ui`'s own Storybook (where each primitive still
has its own isolated story) to validate the same composition works in a
real standalone app, not just Storybook's build pipeline. Supports both
light and dark themes, toggled via a Sun/Moon `IconButton` in the TopBar —
`waldur-design-tokens/theme.ts` reads/writes the same shared
`waldur/theme/name` localStorage key and `data-theme` attribute the main
app's own `src/theme/` uses, so a theme choice made in either app carries
over to the other.

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
