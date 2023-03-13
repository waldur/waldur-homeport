# build environment
FROM node:lts-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json yarn.lock /app/
# Git is needed to refer with yarn to unrealised versions of libraries from github
# --no-cache: download package index on-the-fly, no need to cleanup afterwards
RUN apk add --no-cache git && yarn install --frozen-lockfile

COPY . /app
ARG VERSION=latest
RUN sed -i "s/buildId: 'develop'/buildId: '$VERSION'/" src/configs/default.ts
RUN yarn build

# build environment
FROM node:lts-alpine as next
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY next/package.json next/yarn.lock /app/
# Git is needed to refer with yarn to unrealised versions of libraries from github
# --no-cache: download package index on-the-fly, no need to cleanup afterwards
RUN apk add --no-cache git && yarn install --frozen-lockfile

COPY next /app
ARG VERSION=latest
RUN sed -i "s/buildId: 'develop'/buildId: '$VERSION'/" src/configs/default.ts
RUN ASSET_PATH=/next/ yarn build

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/build/index.html /usr/share/nginx/html/index.orig.html

COPY --from=next /app/build /usr/share/nginx/html/next
COPY --from=next /app/build/index.html /usr/share/nginx/html/next/index.orig.html

ENV API_URL="http://localhost:8080"
ENV TITLE="Waldur | Cloud Service Management"
ENV ACCOUNTING_MODE="billing"
ENV AUTH_STORAGE="sessionStorage"

# put config template outside the public root
COPY docker/config.template.json /usr/share/nginx/

# replace default configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/entrypoint.sh /

EXPOSE 80
CMD [ "/entrypoint.sh" ]
