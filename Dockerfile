ARG DOCKER_REGISTRY=docker.io/

# Extracts just the workspace manifests (each package.json under packages/
# and apps/) into their original relative paths, discarding everything
# else. `yarn install --immutable` only needs these to resolve
# `workspace:*` dependencies, so copying just this pruned set — instead of
# every source file — into the build stage keeps its own `yarn install`
# layer cached across builds where only application code changed, not
# dependencies. Automatic: picks up any new workspace member with zero
# Dockerfile changes, unlike the hand-maintained COPY list this replaced
# (see git history — that list broke CI the first time a package's
# package.json was forgotten here).
FROM ${DOCKER_REGISTRY}node:lts-alpine AS manifests
WORKDIR /src
COPY packages ./packages
COPY apps ./apps
RUN find packages apps -name package.json -exec sh -c \
      'mkdir -p "/manifests/$(dirname "$1")" && cp "$1" "/manifests/$1"' _ {} \;

# build environment
FROM ${DOCKER_REGISTRY}node:lts-alpine AS build
WORKDIR /app
ENV PATH=/app/node_modules/.bin:$PATH
COPY package.json yarn.lock .yarnrc.yml /app/
COPY --from=manifests /manifests/packages /app/packages
COPY --from=manifests /manifests/apps /app/apps
# stubs/ holds local packages that `resolutions` points at over `portal:`
# (see stubs/nodebox). Yarn resolves those targets during `yarn install`, so
# they have to be here before it runs — the later `COPY . /app` is too late,
# and the failure is "Manifest not found" at the resolution step. Copied whole
# rather than manifest-only: portal: links the directory, not just its
# package.json. Tiny and near-static, so it costs the install layer nothing.
COPY stubs /app/stubs
# Git is needed to refer with yarn to unrealised versions of libraries from github
# --no-cache: download package index on-the-fly, no need to cleanup afterwards
# Skip unnecessary post-install scripts - not needed for production builds
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV HUSKY=0
RUN corepack enable && apk add --no-cache git && yarn install --immutable

COPY . /app

ARG COMMIT_INFO="local-build"
# Create build-info directory and file if run locally
RUN mkdir -p /app/build-info && echo "$COMMIT_INFO" > /app/build-info/COMMIT_INFO

ARG VERSION=latest
ARG ASSET_PATH="/"
ENV VITE_API_URL="__API_URL__"
RUN sed -i "s/buildId: 'develop'/buildId: '$VERSION'/" src/core/config.ts
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN yarn vite build --base=$ASSET_PATH

# Every apps/* member is a standalone micro-app, built and served alongside
# the root app on this same image/domain/port, nested into dist/<name>/ so
# the single COPY below ships it too — no per-app COPY lines. See
# docs/micro-apps.md for the full pipeline (nginx routing, ASSET_PATH,
# the waldur.deploy opt-out below, and INCLUDE_DEPLOY_FALSE_APPS's CI/prod
# split).
ARG INCLUDE_DEPLOY_FALSE_APPS=false
RUN for app_dir in apps/*/; do \
      [ -d "$app_dir" ] || continue; \
      name=$(basename "$app_dir"); \
      if [ "$INCLUDE_DEPLOY_FALSE_APPS" = "true" ] || node -e "process.exit(require('./$app_dir/package.json').waldur?.deploy === false ? 1 : 0)"; then \
        vite build "$app_dir" --base="${ASSET_PATH}$name/"; \
        cp -r "$app_dir/dist" "dist/$name"; \
        cp "$app_dir/dist/index.html" "dist/$name/index.orig.html"; \
      else \
        echo "Skipping $app_dir (waldur.deploy=false in its package.json)"; \
      fi; \
    done

# Precompress once here; nginx serves the .gz siblings through gzip_static
# (docker/nginx-tpl.conf) instead of running gzip -9 on every response.
# Source maps are skipped: rarely fetched, and they would double the image.
RUN find dist -type f \( -name '*.js' -o -name '*.css' -o -name '*.svg' -o -name '*.json' \) \
      -exec sh -c 'gzip -9 -c "$1" > "$1.gz"' _ {} \;

# production environment
FROM ${DOCKER_REGISTRY}nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/dist/index.html /usr/share/nginx/html/index.orig.html
COPY --from=build /app/build-info/ /build-info/

ENV API_URL="http://localhost:8080"
ENV TITLE="Waldur | Cloud Service Management"

RUN mkdir -p /tmp/nginx && \
    chgrp -R 0 /tmp/nginx && \
    chmod -R g=u /tmp/nginx

# Placeholder for entrypoint.sh to (re)generate at container start: one
# location block per subpath micro-app actually present under
# /usr/share/nginx/html, included from nginx-tpl.conf. Created here (rather
# than left for entrypoint.sh to mkdir) so `nginx -t`/`include` never faces
# a missing file, and so it's covered by the chgrp/chmod below.
RUN mkdir -p /etc/nginx/conf.d && touch /etc/nginx/conf.d/micro-apps.conf

# replace default configuration
RUN chgrp -R 0 /etc/nginx && \
    chmod -R g=u /etc/nginx && \
    chgrp -R 0 /var/cache/nginx && \
    chmod -R g=u /var/cache/nginx && \
    chgrp -R 0 /var/log/nginx && \
    chmod -R g=u /var/log/nginx && \
    chgrp -R 0 /usr/share/nginx && \
    chmod -R g=u /usr/share/nginx

COPY docker/nginx-tpl.conf /etc/nginx/nginx-tpl.conf
COPY docker/entrypoint.sh /
RUN chmod g+x /entrypoint.sh

EXPOSE 8080
CMD [ "/entrypoint.sh" ]
