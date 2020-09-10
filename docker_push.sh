#!/bin/bash
if [ -z "$1" ]
then
  export VERSION='latest'
else
  # Strip prefix from tag name so that v3.7.5 becomes 3.7.5
  export VERSION=${1#v}
fi

DOCKER_PASSWORD=${DOCKER_PASSWORD:-$WALDUR_DOCKER_HUB_PASSWORD}
DOCKER_USERNAME=${DOCKER_USERNAME:-$WALDUR_DOCKER_HUB_USER}

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t opennode/waldur-homeport:$VERSION . --build-arg VERSION
docker push "opennode/waldur-homeport:$VERSION"
docker images
