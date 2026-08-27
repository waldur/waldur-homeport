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

## Shared app-shell (`waldur-shell`)

`src/main.tsx` doesn't call the individual packages directly — it calls
`waldur-shell`'s single `bootstrapMicroApp()` entry point, which does that
internally. `waldur-shell` exists because this bootstrap code is identical
across every micro-app, not specific to this one — see
`docs/micro-apps.md`'s note on why this was extracted deliberately rather
than waiting for actual duplication to accumulate across several real
micro-apps (there's still only one). Every option `bootstrapMicroApp()`
takes is optional with a sane default, down to the API URL itself (reads
the same `VITE_API_URL`-backed `<meta name="api-url">` tag
`waldur-homeport`'s own `index.html` uses — see `.env.example`) and the
brand color (the backend's own real `BRAND_COLOR` setting default) — this
app calls it with no arguments at all.

Internally, `bootstrapMicroApp()` runs a synchronous half before returning
(some of it sets CSS custom properties/attributes read from first paint,
so it can't wait for a `useEffect`): `waldur-auth-core`'s
`configureAuthCore()`/`initApiClient()`, with a real `localStorage`-backed
`StorageAdapter` reading/writing the exact `waldur/auth/*` keys
`waldur-homeport`'s own `src/core/StorageManager.ts` uses (not
namespaced) — same-origin session sharing, not an isolated demo: a user
already logged into the root app shouldn't have to log in again on this
subpath — plus `waldur-design-tokens`'s font/brand/sidebar-style defaults.
It then kicks off (without awaiting) a genuinely async half: fetching
`waldur-runtime-config`'s `fetchRuntimeConfig()`, refining those same
font/brand/sidebar-style tokens with the tenant's real values,
initializing `waldur-i18n-runtime`'s `LanguageUtilsService`/
`loadSharedLocale()` (the same repo-root `locales/*.json` catalogs
`waldur-homeport`'s own `src/i18n` loads), and `waldur-telemetry`'s
`initSentry()` if a real DSN is passed (omitted here — this app has none
yet). The returned promise resolves with the fetched config, for a
micro-app that needs it for its own app-specific plugin settings; this
app doesn't.

This app no longer lists `waldur-auth-core`/`waldur-telemetry` as its own
direct dependencies — both are consumed exclusively through `waldur-shell`
now, which already declares them itself.

`<AppShell>` itself (not `bootstrapMicroApp()`) constructs current user,
theme, and language once internally — via `CurrentUserProvider`/
`ShellThemeProvider`/`ShellLanguageProvider` — and wraps page content in
a Sentry error boundary, so a crash there shows a fallback in the content
area while the Sidebar/TopBar/`UserMenu` chrome stays usable. This app
doesn't call any of those three hooks, or set up its own error handling,
at all.

## Dashboard mock

The app's only page — `OrgDashboardMock.tsx` composes `waldur-shell`'s
`<AppShell>` (the Sidebar/TopBar layout skeleton, plus the TopBar's
Apps/Help/Notifications/`UserMenu` cluster, and an error boundary around
page content — see `ShellErrorBoundary.tsx`) with `packages/ui`
primitives (`StatCard`, `StatusPill`, `DataTable`) for its own page
content, wired to real Waldur data via `waldur-js-client`
(`customersList`/`projectsList`/`invoicesList`/`projectsListUsersCount`).
Nav items, the org switcher's data, and all page content stay this app's
own responsibility — current user, theme, language, and the error
boundary all come from `AppShell` itself; this file doesn't call any of
those hooks directly. Supports both light and dark themes, toggled via
the user-menu dropdown in the TopBar (not a standalone TopBar icon —
matches `waldur-homeport`'s own real `UserDropdownMenu.tsx`) —
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
  something `BaseButton` itself requires. `Card.tsx`/`StatCard.tsx` lean on
  this directly: their padding/gaps are arbitrary rem values (`px-[2.25rem]`,
  not `px-[29px]`), matching the real Bootstrap component's own rem-based
  spacing at _any_ root font-size — this app's genuine 16px root and
  `waldur-homeport`'s forced 13px root both resolve correctly from the
  same class, with no per-app override needed.
- **`useIsMobile()`'s `window.innerWidth` read raced the real viewport.**
  Running `Sidebar` in this app (not just Storybook) surfaced a real,
  reproducible bug: `window.innerWidth` measured `0` at the exact moment
  the hook's mount effect first ran, latching `isMobile` to `true` at a
  genuine 1280px viewport with nothing to ever self-correct it (a real
  viewport never crosses the 768px `matchMedia` threshold it's also
  watching) — the desktop sidebar silently stayed replaced by a closed,
  invisible mobile `Sheet` for the rest of the session. Fixed by reading
  `matchMedia`'s own `.matches` instead, which can't observe a transient
  `0`. Sheet's own primitives had a real, separate ref-forwarding bug too
  (shadcn's canonical recipe wraps them in `forwardRef`; this port hadn't),
  invisible until the mobile path above actually mounted here.
- **The same `getLocaleData(locale)` dynamic-import wrapper existed twice**
  — once in `waldur-homeport`'s own `src/i18n/LanguageUtilsService.ts`,
  once in this app's own entry point — differing only in how many `../` reached
  the repo root's `locales/*.json` from each file's own location. Only
  visible as duplication once a second real consumer existed. Centralized
  as `waldur-i18n-runtime`'s `loadSharedLocale()`: a dynamic `import()`
  with a template literal resolves relative to the file it's _written_ in,
  not the caller, so one shared function's fixed location in the monorepo
  gives every consumer — this app, the root app, and any future micro-app —
  a correct path for free, with no Vite alias or per-app config.
