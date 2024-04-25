#!/bin/sh

mkdir -p /usr/share/nginx/html/scripts/configs/ && envsubst < /usr/share/nginx/config.template.json > /usr/share/nginx/html/scripts/configs/config.json

envsubst '$ASSET_PATH' < /etc/nginx/nginx-tpl.conf > /etc/nginx/nginx.conf

cp /usr/share/nginx/html/index.orig.html /usr/share/nginx/html/index.html
[[ -z "${TITLE}" ]] && sed -i "s/<title>Waldur | Cloud Service Management<\/title>/<title>${TITLE}<\/title>/" /usr/share/nginx/html/index.html

[[ -n "${API_URL}" ]] && sed -i -E '/<link.*rel="shortcut icon".*href="[^"]*\/?favicon\.ico[^"]*".*>/s#href="[^"]*\/?favicon\.ico[^"]*"#href="'${API_URL}'api/icons/favicon"#' /usr/share/nginx/html/index.html

# Move all the assets and scripts to the custom dir if defined
if [ -n "${ASSET_PATH}" ]; then
    mkdir -p /usr/share/nginx/html/${ASSET_PATH}
    # Ignore recursion error
    mv /usr/share/nginx/html/* /usr/share/nginx/html/${ASSET_PATH}/ || true
fi

nginx -g 'daemon off;'
