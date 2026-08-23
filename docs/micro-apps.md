# Micro-Apps Guide

How standalone apps under `apps/*` (e.g. `apps/micro-app-poc`) are built,
served, and deployed alongside the root Waldur Homeport app. This is the
systematic explanation the Dockerfile, `docker/nginx-tpl.conf`,
`docker/entrypoint.sh`, and `.gitlab-ci.yml` comments point back to — read
this instead of reconstructing the mechanism from those comments.

## What a micro-app is

Any directory under `apps/*` is a standalone Vite app, its own yarn
workspace member (root `package.json`'s `"workspaces"` already includes
`"apps/*"`), consuming `packages/*` the way a genuinely separate
micro-frontend would — not through the root app's own `src/`, its
`vite.config.ts` aliases, or its Tailwind theme overrides. See
[`apps/micro-app-poc`](../apps/micro-app-poc) for a concrete example and
what building one that way surfaced about `packages/*`'s own portability
gaps.

**The convention is directory presence, not a manifest.** Every `apps/*`
member is picked up automatically — by `yarn install` (via the
workspace glob), by the Dockerfile's build loop, by CI's typecheck/build
job, and by the generated nginx routing. A new micro-app needs zero
Dockerfile/nginx/`entrypoint.sh`/CI changes — see
[Adding a new micro-app](#adding-a-new-micro-app).

## Local development

```bash
yarn workspace <package-name> dev   # dev server, own port (see its vite.config.ts)
yarn apps:typecheck                 # tsc --noEmit for every apps/* member
yarn apps:build                     # vite build for every apps/* member
```

`apps:typecheck`/`apps:build` (root `package.json`) run via
`yarn workspaces foreach -A --include 'apps/*' run <script>` — one generic
command instead of a hand-maintained script pair per app.

### Testing the subpath locally, with HMR

The root app's own `vite.config.ts` can proxy a micro-app's subpath to its
dev server, mirroring the production nginx routing below without a full
Docker build — see `apps/micro-app-poc/README.md` for the exact commands.
This needs the micro-app's own `vite.config.ts` to set its `base` to match
(env-var-gated, so standalone dev stays at `/`) — otherwise Vite's own dev
paths (`/@vite/client`, `/@fs/*`) collide between the two dev servers
sharing one origin. Currently hardcoded to `micro-app-poc`'s one proxy
entry/port; generalizing to every `apps/*` member automatically would need
a small discoverable ports registry (e.g. extending the `waldur.deploy`
package.json convention below with a `devPort` field) — not worth it with
only one real example today.

## Build & serve pipeline

Every `apps/*` member ships inside the **same production image** as the
root app, at its own subpath on the same domain/port — not as a separate
deployment. Three files cooperate, each scanning for `apps/*` content
rather than naming it:

1. **`Dockerfile`** — after the root app's own `vite build`, loops over
   `apps/*/`, builds each with `vite build <app_dir> --base="$ASSET_PATH<name>/"`
   (the same `$ASSET_PATH` build arg the root app's build uses — see
   "ASSET_PATH (relocated deployments)" below), and nests the
   result into `dist/<name>/` alongside the root app's own `dist/`. The
   final image stage is then a single `COPY --from=build /app/dist
   /usr/share/nginx/html` — no per-app `COPY` lines.
2. **`docker/entrypoint.sh`** — at container start, generates one nginx
   `location` block per `apps/*` directory it finds under the html root,
   into `/etc/nginx/conf.d/micro-apps.conf` (created empty at build time so
   the `include` below is never missing). It also substitutes the real
   `API_URL` into every app's `index.orig.html` (root's and every
   micro-app's — anywhere it finds that filename), the same
   `__API_URL__`-placeholder mechanism the root app uses via
   `VITE_API_URL=__API_URL__` at build time.
3. **`docker/nginx-tpl.conf`** — just `include`s that generated file. No
   micro-app location block is hand-written here.

### `ASSET_PATH` (relocated deployments)

`ASSET_PATH` lets an entire deployment (root app + every micro-app) be
relocated under a URL prefix — used by the k8s MR-preview environment,
which sets it to `/<mr-id>/` so multiple preview deployments can share one
domain. It exists in two forms that must not be confused:

- **Build-time** (`ARG ASSET_PATH="/"` in the Dockerfile): a full path
  with a leading slash, e.g. `/21684/`. Baked into every JS/CSS asset URL
  at `vite build` time, for both the root app and every micro-app.
- **Runtime** (a container env var of the same name, e.g. `21684/`, no
  leading slash — the leading slash comes from the literal `/` already in
  `docker/nginx-tpl.conf`'s `location /${ASSET_PATH}`): drives nginx
  routing and `entrypoint.sh`'s "Handle asset path" step, which duplicates
  the whole html tree (root app _and_ every micro-app directory) into
  `/usr/share/nginx/html/${ASSET_PATH}/`.

A micro-app's own build and its generated nginx location block both key off
`$ASSET_PATH` for exactly this reason: if the root app moves under a
prefix, a micro-app must move with it, not stay pinned to the domain root.
Get this wrong and a micro-app's location block silently never matches
under a relocated deployment — requests fall through to the root app's own
SPA fallback instead. (This exact bug existed briefly during development;
verified fixed by simulating the full pipeline locally with both an empty
and a set `ASSET_PATH`.)

## Opting out of production: `waldur.deploy`

A micro-app that should stay buildable/typecheckable/live-testable but
never reach a real deployment (a demo or proof-of-concept, not a
deployable) opts out via its own `package.json`:

```json
{
  "waldur": { "deploy": false }
}
```

The Dockerfile's `apps/*` loop checks this (via a one-line `node -e`
read of the app's `package.json`) before building/copying it. **Absent
this field, an app ships by default** — the flag is opt-out, not opt-in,
so a real new micro-app needs no `package.json` change to be deployed.

### Live-testing without shipping

`waldur.deploy: false` only controls _production_ images. CI/preview
builds override it with a second Dockerfile arg,
`INCLUDE_DEPLOY_FALSE_APPS=true`, so every `apps/*` member — including
opted-out ones — is still built, packaged, served, and `API_URL`-substituted
on every MR:

| Job (`.gitlab-ci.yml`)                   | `INCLUDE_DEPLOY_FALSE_APPS` | Purpose                                       |
| ---------------------------------------- | :-------------------------: | --------------------------------------------- |
| `Build test docker image` (E2E image)    |           `true`            | Image the downstream E2E suite runs against   |
| `Build test docker image` (k8s preview)  |           `true`            | Feeds `Test k8s deployment`'s live MR preview |
| `Publish YOLO docker image`              |       unset (`false`)       | Real `develop`-branch production image        |
| `Publish latest docker image`            |       unset (`false`)       | Retags YOLO → `latest`                        |
| `Publish multiarch ... specific version` |       unset (`false`)       | Real tagged-release production image          |

So `apps/micro-app-poc` is reachable at `/micro-app-poc/` (or
`/<mr-id>/micro-app-poc/` under the preview env's `ASSET_PATH`) in every
MR's live k8s preview, while never appearing in a real `Publish` image.

## CI coverage

- **`Run apps typecheck and build`** — `yarn apps:typecheck` +
  `yarn apps:build`, gated on changes under `apps/**/*`, `packages/**/*`,
  `package.json`, `yarn.lock`. Vite-level correctness only; doesn't touch
  Docker.
- **`Test docker image build`** — MR-time smoke build (`docker buildx`),
  gated on `Dockerfile`, `docker/**/*`, `apps/**/*` (the Dockerfile builds
  `apps/*` into the image now, so a change there affects the built image).
- **`Build test docker image`** + **`Test k8s deployment`** — the real
  end-to-end check: builds the E2E/preview images (with
  `INCLUDE_DEPLOY_FALSE_APPS=true`) and deploys the preview one to a live,
  browsable k8s environment at `https://helm-testing.waldur.com/<mr-id>/`.

## Adding a new micro-app

1. Create `apps/<name>/` — `package.json` (with `dev`/`build`/`typecheck`
   scripts and its own `vite`/`typescript` deps), `index.html` (with
   `<meta name="api-url" content="%VITE_API_URL%">`, same as the root
   app's), `vite.config.ts` (own dev port — check `.claude/launch.json` and
   existing `apps/*` for ports already taken), `tsconfig.json`.
2. Decide whether it ships: omit `"waldur": { "deploy": false }` to ship by
   default, or add it if it's a demo/POC that should stay CI/preview-only
   (see above).
3. That's it for Dockerfile/nginx/`entrypoint.sh`/CI — all four scan for
   `apps/*` content, none hand-list app names.
4. Optional, for local dev convenience: add an entry to `.claude/launch.json`
   (both the repo-root one and, if working from the `waldur-claude-workspace`
   hub, its own hub-level copy — these can drift out of sync since nothing
   keeps them in sync automatically) so `preview_start` can launch it by
   name.

## Known gaps / follow-ups

- **`.claude/launch.json` isn't part of the zero-touch convention.** It's a
  static list read by an external tool, one port per entry — a new
  micro-app still needs a hand-added entry there, and the hub-level and
  repo-level copies can drift.
- **Shared bootstrap code vs. the portability proof.** If several
  micro-apps accumulate the same `configureAuthCore`/`initApiClient`/
  storage-adapter wiring, extracting it into a shared `packages/*` package
  would be reasonable DRY — but it also means later micro-apps stop being
  independent evidence that `packages/*` needs no shared internal glue.
  Decide this on purpose if/when it comes up, not by accretion.
- **One shared image vs. one image per micro-app.** Today every micro-app
  is coupled to the root app's release cadence (a micro-app change forces a
  full homeport rebuild/redeploy). True per-micro-app deploy independence
  would mean separate images (still reusing the manifest-prune `yarn
  install` trick) composed at the ingress/Helm layer instead of in this
  repo's `nginx-tpl.conf` — real infra work, only worth it once independent
  deploy cadence is an actual requirement.
