#!/bin/bash
set -e

if [ -z "$1" ]
then
  export VERSION='latest'
else
  # Strip prefix from tag name so that v3.7.5 becomes 3.7.5
  export VERSION=${1#v}
fi

DOCKER_PASSWORD=${DOCKER_PASSWORD:-$WALDUR_DOCKER_HUB_PASSWORD}
DOCKER_USERNAME=${DOCKER_USERNAME:-$WALDUR_DOCKER_HUB_USER}

mkdir build-info
if [ $CI_COMMIT_SHA ]
then
  echo "[+] Adding CI_COMMIT_SHA to build-info/COMMIT_SHA file"
  echo $CI_COMMIT_SHA > build-info/COMMIT_SHA
  cat build-info/COMMIT_SHA
fi

if [ $CI_COMMIT_TAG ]
then
  echo "[+] Adding CI_COMMIT_TAG to build-info/COMMIT_TAG file"
  echo $CI_COMMIT_TAG > build-info/COMMIT_TAG
  cat build-info/COMMIT_TAG
fi

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t opennode/waldur-homeport:$VERSION . --build-arg VERSION
docker push "opennode/waldur-homeport:$VERSION"
docker images
