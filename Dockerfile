# build environment
FROM node:12.4.0-alpine as build
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
RUN yarn build

# production environment
FROM nginx:1.16.0-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
