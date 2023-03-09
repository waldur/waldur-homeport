#!/bin/sh

mkdir -p /usr/share/nginx/html/scripts/configs/ && envsubst < /usr/share/nginx/config.template.json > /usr/share/nginx/html/scripts/configs/config.json

cp /usr/share/nginx/html/index.orig.html /usr/share/nginx/html/index.html
[[ ! -z "${TITLE}" ]] && sed -i "s/<title>Waldur | Cloud Service Management<\/title>/<title>${TITLE}<\/title>/" /usr/share/nginx/html/index.html

mkdir -p /usr/share/nginx/html/next/scripts/configs/ && envsubst < /usr/share/nginx/config.template.json > /usr/share/nginx/html/next/scripts/configs/config.json

cp /usr/share/nginx/html/next/index.orig.html /usr/share/nginx/html/next/index.html
[[ ! -z "${TITLE}" ]] && sed -i "s/<title>Waldur | Cloud Service Management<\/title>/<title>${TITLE}<\/title>/" /usr/share/nginx/html/next/index.html

[[ -n "${API_URL}" ]] && sed -i "s#href=\"images/favicon.ico\" type=\"image/x-icon\"#href=\"${API_URL}api/icons/favicon/\" type=\"image/x-icon\"#" /usr/share/nginx/html/index.html

nginx -g 'daemon off;'
