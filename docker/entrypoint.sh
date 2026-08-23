#!/bin/sh

# Create temp directory with correct permissions
TEMP_DIR=$(mktemp -d)
chmod g+rwx $TEMP_DIR

# Listen on IPv6 too when the kernel has it, so the container is reachable on
# IPv6-only and dual-stack clusters — without it nginx binds 0.0.0.0 only and
# the readiness probe against the pod's IPv6 address is refused forever.
# /proc/net/if_inet6 is absent exactly when IPv6 is compiled out or disabled at
# boot, where opening a [::] socket would fail and nginx would refuse to start.
if [ -f /proc/net/if_inet6 ]; then
    IPV6_LISTEN="listen [::]:8080;"
else
    IPV6_LISTEN=""
fi
export IPV6_LISTEN

# Process nginx config using temp directory
envsubst '$ASSET_PATH $IPV6_LISTEN' < /etc/nginx/nginx-tpl.conf > $TEMP_DIR/nginx.conf
cp $TEMP_DIR/nginx.conf /etc/nginx/nginx.conf || true

# One nginx location block per apps/* micro-app actually present under the
# html root, regenerated on every start — see docs/micro-apps.md for why
# this is keyed off $ASSET_PATH (same as the root app's own build/routing
# below) rather than always pinned to the domain root. -mindepth/-maxdepth 2
# scopes this to apps/* only, excluding the root app's own index.orig.html
# one level up.
MICRO_APPS_CONF=/etc/nginx/conf.d/micro-apps.conf
: > "$MICRO_APPS_CONF"
find /usr/share/nginx/html -mindepth 2 -maxdepth 2 -name index.orig.html | while read -r ORIG; do
    APP_NAME=$(basename "$(dirname "$ORIG")")
    cat >> "$MICRO_APPS_CONF" <<EOF
location /${ASSET_PATH}${APP_NAME}/ {
    alias /usr/share/nginx/html/${ASSET_PATH}${APP_NAME}/;
    index index.html;
    try_files \$uri \$uri/ /${ASSET_PATH}${APP_NAME}/index.html;

    location = /${ASSET_PATH}${APP_NAME}/index.html {
        expires -1;
    }
}
EOF
done

# Process every index.orig.html under the html root — the root app's own,
# plus one per apps/* micro-app — into a sibling index.html. See
# docs/micro-apps.md.
find /usr/share/nginx/html -name index.orig.html | while read -r ORIG; do
    DEST_DIR=$(dirname "$ORIG")
    cp "$ORIG" $TEMP_DIR/index.html

    if [ -n "${TITLE}" ]; then
        sed "s/<title>Waldur | Cloud Service Management<\/title>/<title>${TITLE}<\/title>/" $TEMP_DIR/index.html > $TEMP_DIR/index.html.tmp
        mv $TEMP_DIR/index.html.tmp $TEMP_DIR/index.html
    fi

    if [ -n "${API_URL}" ]; then
        sed -E '/<link.*rel="shortcut icon".*href="[^"]*\/?favicon\.ico[^"]*".*>/s#href="[^"]*\/?favicon\.ico[^"]*"#href="'${API_URL}'api/icons/favicon"#' $TEMP_DIR/index.html > $TEMP_DIR/index.html.tmp
        mv $TEMP_DIR/index.html.tmp $TEMP_DIR/index.html

        sed "s|__API_URL__|${API_URL}|" $TEMP_DIR/index.html > $TEMP_DIR/index.html.tmp
        mv $TEMP_DIR/index.html.tmp $TEMP_DIR/index.html
    fi

    # Copy processed file back
    cp $TEMP_DIR/index.html "$DEST_DIR/index.html" || true
done

# Handle asset path
if [ -n "${ASSET_PATH}" ]; then
    mkdir -p /usr/share/nginx/html/${ASSET_PATH} || true
    # Ignore recursion error
    cp -r /usr/share/nginx/html/* /usr/share/nginx/html/${ASSET_PATH}/ 2>/dev/null || true
fi

# Cleanup
rm -rf $TEMP_DIR

# Start nginx
nginx -g 'daemon off;'