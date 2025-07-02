ARG DOCKER_REGISTRY=docker.io/

# build environment
FROM ${DOCKER_REGISTRY}node:lts-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json yarn.lock /app/
# Git is needed to refer with yarn to unrealised versions of libraries from github
# --no-cache: download package index on-the-fly, no need to cleanup afterwards
RUN apk add --no-cache git && yarn install --frozen-lockfile

COPY . /app

ARG COMMIT_INFO="local-build"
# Create build-info directory and file if run locally
RUN mkdir -p /app/build-info && echo "$COMMIT_INFO" > /app/build-info/COMMIT_INFO

ARG VERSION=latest
ARG ASSET_PATH="/"
ENV VITE_API_URL="__API_URL__"
RUN sed -i "s/buildId: 'develop'/buildId: '$VERSION'/" src/core/config.ts
ENV NODE_OPTIONS --max-old-space-size=32768
RUN yarn vite build --base=$ASSET_PATH

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
