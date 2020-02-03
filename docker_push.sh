#!/bin/bash
if [ -z "$1" ]
then
  export VERSION='latest'
else
  # Strip prefix from tag name so that v3.7.5 becomes 3.7.5
  export VERSION=${1#v}
fi

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t opennode/waldur-homeport:$VERSION . --build-arg VERSION
docker push "opennode/waldur-homeport:$VERSION"
docker images
