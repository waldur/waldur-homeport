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

# Content-Security-Policy and the other security headers, sent on every
# response the image serves: index.html, assets, micro-apps and nginx's own
# error pages. The policy follows what the SPA loads, so it ships with the
# image and holds behind any proxy, or none. A proxy can only add a second,
# stricter policy (browsers enforce every policy a response carries), so the
# deployment changes this one through the variables below.
#
#   API_URL                  its origin goes to connect-src and img-src, and
#                            the matching ws/wss origin to connect-src (the
#                            realtime UI's web-STOMP socket on the API host)
#   CSP_SENTRY_URL           connect-src (the SDK is bundled; it only posts)
#   CSP_MATOMO_URL           script-src, connect-src, img-src
#   CSP_MATRIX_URL           connect-src, img-src, media-src
#   CSP_MATRIX_CALL_URL      connect-src (LiveKit signalling, wss)
#   CSP_INFERENCE_URL        connect-src
#   CSP_FORM_ACTION          form-action (identity providers the SAML
#                            HTTP-POST binding submits to, or https:)
#   CSP_<DIRECTIVE>_EXTRA    more sources for one directive, e.g.
#                            CSP_CONNECT_SRC_EXTRA
#   CSP_POLICY               replaces the whole policy. It must state
#                            object-src, base-uri and frame-ancestors, and
#                            its directives are separated by ";": a newline
#                            does not end one, so a YAML block with one
#                            directive per line needs ";" on each line. A
#                            report-uri or report-to in it goes there or in
#                            the variables below, not both.
#   CSP_REPORT_ONLY=true     sends the policy as
#                            Content-Security-Policy-Report-Only, beside an
#                            enforced object-src, base-uri and
#                            frame-ancestors baseline
#   CSP_REPORT_URI           adds report-uri
#   CSP_REPORT_TO=true       also adds report-to and Reporting-Endpoints for
#                            CSP_REPORT_URI. Off by default: Chromium then
#                            reports only through the Reporting API and
#                            ignores report-uri.
#
# Sources are used as written: an origin (https://sentry.example.com), a bare
# host (sentry.example.com) and a scheme (https:) are all valid CSP sources.
# Each value lands in a double-quoted nginx string. A value holding a
# character that could end that string, expand an nginx variable or start
# another CSP directive or policy (" \ $ ; , or a control character) is
# refused and the container exits: a typo then stops the start-up loudly
# instead of leaving the portal with a policy nobody wrote. CSP_POLICY may
# hold ";" between its directives.

# Prints the variable named $1 with whitespace (a YAML block's newlines, tabs)
# folded into single spaces and trimmed.
csp_read() {
    eval "printf '%s' \"\${$1-}\"" | tr '[:space:]' ' ' | tr -s ' ' | sed 's/^ //; s/ $//'
}

# Sets CSP_VALUE to the variable named $1, or exits when it holds a character
# that is not allowed. $2 is "sources" (a source list), "policy" (a whole
# policy, ";" allowed) or "uri" (one URL: no whitespace or quotes either).
# $3, when given, names the variable the value came from.
csp_value() {
    CSP_VALUE=$(csp_read "$1")
    case "$2" in
        sources) csp_refused='" \ $ , ;' ;;
        policy) csp_refused='" \ $ ,' ;;
        uri) csp_refused="whitespace, ' \" \\ \$ , ;" ;;
    esac
    csp_bad=""
    case "$CSP_VALUE" in
        *\"*|*\\*|*\$*|*,*) csp_bad=yes ;;
    esac
    case "$2" in
        sources|uri) case "$CSP_VALUE" in *\;*) csp_bad=yes ;; esac ;;
    esac
    case "$2" in
        uri) case "$CSP_VALUE" in *\ *|*\'*) csp_bad=yes ;; esac ;;
    esac
    if [ "$CSP_VALUE" != "$(printf '%s' "$CSP_VALUE" | tr -d '[:cntrl:]')" ]; then
        csp_bad=yes
    fi
    if [ -n "$csp_bad" ]; then
        printf 'entrypoint: refusing %s=%s: the Content-Security-Policy may not take %s or a control character from it\n' \
            "${3:-$1}" "$CSP_VALUE" "$csp_refused" >&2
        exit 1
    fi
}

# True when the variable named $1 is true, 1 or yes, in any case.
csp_true() {
    case "$(csp_read "$1" | tr '[:upper:]' '[:lower:]')" in
        true|1|yes) return 0 ;;
    esac
    return 1
}

# Exits, saying why CSP_POLICY is refused.
csp_refuse_policy() {
    printf 'entrypoint: refusing CSP_POLICY=%s: %s\n' "$csp_policy_given" "$1" >&2
    exit 1
}

# scheme://host[:port] of API_URL, lower-cased (the browser lower-cases the
# scheme and host it requests, so HTTPS://API.example.org works for the app);
# empty for a relative URL, which 'self' covers.
API_ORIGIN=$(printf '%s' "${API_URL-}" | sed -n -E 's#^([A-Za-z][A-Za-z0-9+.-]*)://([^/?#@]*@)?([^/?#]+).*$#\1://\3#p' | tr '[:upper:]' '[:lower:]')
# API_WS_ORIGIN is read by name, in csp_value.
# shellcheck disable=SC2034
case "$API_ORIGIN" in
    https://*) API_WS_ORIGIN="wss://${API_ORIGIN#https://}" ;;
    http://*) API_WS_ORIGIN="ws://${API_ORIGIN#http://}" ;;
    *) API_ORIGIN="" API_WS_ORIGIN="" ;;
esac
# An API on another host whose origin could not be taken from API_URL (a
# protocol-relative //host/, a scheme other than http or https) is left out of
# the policy, which then blocks every API call. Say so rather than guess.
if [ -z "$API_ORIGIN" ]; then
    case "${API_URL-}" in
        //*|[A-Za-z]*://*)
            printf 'entrypoint: API_URL=%s gives no http(s) origin for the Content-Security-Policy; add the API origin to CSP_CONNECT_SRC_EXTRA and CSP_IMG_SRC_EXTRA\n' "$API_URL" >&2
            ;;
    esac
fi
csp_value API_ORIGIN sources API_URL; csp_api="$CSP_VALUE"
csp_value API_WS_ORIGIN sources API_URL; csp_api_ws="$CSP_VALUE"
csp_value CSP_SENTRY_URL sources; csp_sentry="$CSP_VALUE"
csp_value CSP_MATOMO_URL sources; csp_matomo="$CSP_VALUE"
csp_value CSP_MATRIX_URL sources; csp_matrix="$CSP_VALUE"
csp_value CSP_MATRIX_CALL_URL sources; csp_matrix_call="$CSP_VALUE"
csp_value CSP_INFERENCE_URL sources; csp_inference="$CSP_VALUE"
csp_value CSP_FORM_ACTION sources; csp_form_action="$CSP_VALUE"
csp_value CSP_DEFAULT_SRC_EXTRA sources; csp_default_extra="$CSP_VALUE"
csp_value CSP_SCRIPT_SRC_EXTRA sources; csp_script_extra="$CSP_VALUE"
csp_value CSP_STYLE_SRC_EXTRA sources; csp_style_extra="$CSP_VALUE"
csp_value CSP_IMG_SRC_EXTRA sources; csp_img_extra="$CSP_VALUE"
csp_value CSP_CONNECT_SRC_EXTRA sources; csp_connect_extra="$CSP_VALUE"
csp_value CSP_FONT_SRC_EXTRA sources; csp_font_extra="$CSP_VALUE"
csp_value CSP_MEDIA_SRC_EXTRA sources; csp_media_extra="$CSP_VALUE"
csp_value CSP_WORKER_SRC_EXTRA sources; csp_worker_extra="$CSP_VALUE"
csp_value CSP_FRAME_SRC_EXTRA sources; csp_frame_extra="$CSP_VALUE"
csp_value CSP_FORM_ACTION_EXTRA sources; csp_form_action_extra="$CSP_VALUE"
csp_value CSP_POLICY policy; csp_policy="$CSP_VALUE"
csp_value CSP_REPORT_URI uri; csp_report_uri="$CSP_VALUE"

# CSP_POLICY replaces everything, so it is checked for what a slip would
# silently lose: the whole policy (";" alone would render an empty header,
# which nginx does not send at all), the three directives every policy needs,
# and two directives run together because a line ended without ";" (a newline
# does not end a directive, so "default-src 'self'" and "object-src 'none'" on
# two lines make one default-src with a source named object-src).
if [ -n "$csp_policy" ]; then
    csp_policy_given=$csp_policy
    csp_policy=$(printf '%s' "$csp_policy" | sed 's/ *; */; /g; s/^[; ]*//; s/[; ]*$//')
    if [ -z "$csp_policy" ]; then
        csp_refuse_policy "it holds no directive"
    fi
    # One "directive <name>" line per directive, and a "merged <directive>
    # <name>" line for each source that is really a directive's name.
    csp_parsed=$(printf '%s' "$csp_policy" | tr '[:upper:]' '[:lower:]' | tr ';' '\n' | awk '
        NF {
            print "directive", $1
            for (i = 2; i <= NF; i++)
                if ($i ~ /^[a-z]+(-[a-z]+)*$/ && ($i ~ /-src(-elem|-attr)?$/ || $i ~ /^(base-uri|form-action|frame-ancestors|report-uri|report-to|sandbox|upgrade-insecure-requests)$/))
                    print "merged", $1, $i
        }')
    csp_merged=$(printf '%s\n' "$csp_parsed" | awk '$1 == "merged" { print $3 " sits inside " $2; exit }')
    if [ -n "$csp_merged" ]; then
        csp_refuse_policy "$csp_merged; end every directive with \";\", a newline does not"
    fi
    csp_missing=""
    for csp_directive in object-src base-uri frame-ancestors; do
        if ! printf '%s\n' "$csp_parsed" | grep -qx "directive $csp_directive"; then
            csp_missing="$csp_missing $csp_directive"
        fi
    done
    if [ -n "$csp_missing" ]; then
        csp_refuse_policy "it lacks${csp_missing}; every policy must state object-src, base-uri and frame-ancestors"
    fi
    # A browser keeps the first of two directives with one name and ignores
    # the second, so a report-uri (or report-to) appended to a policy that
    # already states one would never be used.
    if [ -n "$csp_report_uri" ]; then
        if printf '%s\n' "$csp_parsed" | grep -qx "directive report-uri"; then
            csp_refuse_policy "it states report-uri and CSP_REPORT_URI is set too; give the endpoint in one of them"
        fi
        if csp_true CSP_REPORT_TO && printf '%s\n' "$csp_parsed" | grep -qx "directive report-to"; then
            csp_refuse_policy "it states report-to and CSP_REPORT_TO is set too; give it in one of them"
        fi
    fi
fi

# 'none' cannot share a directive with other sources, so extra frame sources
# replace it rather than join it. worker-src takes blob: because the usage
# import's spreadsheet reader (fflate) inflates large files in a worker built
# from a blob; only script already running on the page can make one.
csp_frame_src=${csp_frame_extra:-"'none'"}
if [ -n "$csp_policy" ]; then
    CSP="$csp_policy"
else
    CSP="default-src 'self' $csp_default_extra;
        script-src 'self' 'wasm-unsafe-eval' $csp_matomo $csp_script_extra;
        style-src 'self' 'unsafe-inline' $csp_style_extra;
        img-src 'self' $csp_api $csp_matomo $csp_matrix *.tile.openstreetmap.org blob: data: $csp_img_extra;
        connect-src 'self' $csp_api $csp_api_ws $csp_sentry $csp_matomo $csp_matrix $csp_matrix_call $csp_inference nominatim.openstreetmap.org $csp_connect_extra;
        font-src 'self' data: $csp_font_extra;
        media-src 'self' $csp_matrix blob: $csp_media_extra;
        worker-src 'self' blob: $csp_worker_extra;
        frame-src $csp_frame_src;
        form-action 'self' $csp_form_action $csp_form_action_extra;
        object-src 'none';
        base-uri 'none';
        frame-ancestors 'none'"
fi
# One line, single spaces, no space before a ";", no trailing ";".
CSP=$(printf '%s' "$CSP" | tr '[:space:]' ' ' | tr -s ' ' | sed 's/ ;/;/g; s/^ //; s/[; ]*$//')
# report-uri is what every browser sends to. report-to is opt-in: when both
# are present Chromium reports only through the Reporting API, so a deployment
# turns it on once it has seen those reports arrive.
csp_report_to=""
if [ -n "$csp_report_uri" ]; then
    CSP="$CSP; report-uri $csp_report_uri"
    if csp_true CSP_REPORT_TO; then
        CSP="$CSP; report-to csp-endpoint"
        csp_report_to=yes
    fi
elif csp_true CSP_REPORT_TO; then
    echo 'entrypoint: CSP_REPORT_TO is ignored without CSP_REPORT_URI' >&2
fi

# Report-Only enforces nothing, so while a deployment tries the policy out,
# object-src, base-uri and frame-ancestors stay enforced in a policy of their
# own: without it the portal would be weaker than before it had a policy.
if csp_true CSP_REPORT_ONLY; then
    CSP_HEADER=Content-Security-Policy-Report-Only
    CSP_ENFORCED="object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
else
    CSP_HEADER=Content-Security-Policy
    CSP_ENFORCED=""
fi

# Included at server level and again in every location that adds a header of
# its own: nginx's add_header is inherited only by locations that have none.
SECURITY_HEADERS_CONF=/etc/nginx/conf.d/security-headers.conf
{
    echo 'add_header X-Content-Type-Options "nosniff" always;'
    echo 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;'
    echo 'add_header X-Frame-Options "DENY" always;'
    printf 'add_header %s "%s" always;\n' "$CSP_HEADER" "$CSP"
    if [ -n "$CSP_ENFORCED" ]; then
        printf 'add_header Content-Security-Policy "%s" always;\n' "$CSP_ENFORCED"
    fi
    if [ -n "$csp_report_to" ]; then
        printf "add_header Reporting-Endpoints 'csp-endpoint=\"%s\"' always;\n" "$csp_report_uri"
    fi
} > "$SECURITY_HEADERS_CONF" || {
    # The shell has already said why (read-only /etc/nginx, wrong owner). Stop
    # here rather than log a policy that was never written.
    echo "entrypoint: cannot write $SECURITY_HEADERS_CONF, so nginx would not send the security headers" >&2
    exit 1
}
printf 'entrypoint: %s: %s\n' "$CSP_HEADER" "$CSP"
if [ -n "$CSP_ENFORCED" ]; then
    printf 'entrypoint: Content-Security-Policy: %s\n' "$CSP_ENFORCED"
fi

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