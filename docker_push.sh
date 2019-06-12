#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
cd docker && docker build -t opennode/waldur-homeport .
docker push "opennode/waldur-homeport:latest"
docker images
