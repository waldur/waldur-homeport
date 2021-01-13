# build environment
FROM node:lts-alpine as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json yarn.lock /app/
# Consider the following dependencies tree:
# node-sass -> node-gyp -> python
# Python is not installed on alpine, therefore we need to install it manually.
# --no-cache: download package index on-the-fly, no need to cleanup afterwards
# --virtual: bundle packages, remove whole bundle at once, when done
RUN apk add --no-cache --virtual python make g++ \
    && yarn install --frozen-lockfile

COPY . /app
ARG VERSION=latest
RUN sed -i "s/buildId: 'develop'/buildId: '$VERSION'/" src/configs/default.ts
RUN yarn build

# production environment
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY --from=build /app/build-info /

ENV API_URL="http://localhost:8080"

# put config template outside the public root
COPY docker/config.template.json /usr/share/nginx/
# replace default configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["/bin/sh",  "-c",  "mkdir -p /usr/share/nginx/html/scripts/configs/ && envsubst < /usr/share/nginx/config.template.json > /usr/share/nginx/html/scripts/configs/config.json && exec nginx -g 'daemon off;'"]
