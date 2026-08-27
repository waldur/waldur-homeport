#!/bin/bash
#
# Script to regenerate the Waldur TypeScript SDK and enums from the OpenAPI schema.
# Usage: ./docs/update-local-sdk.sh [mastermind_path] [js_client_path]
#
# Arguments:
#   mastermind_path - Path to waldur-mastermind repo (default: ../waldur-mastermind)
#   js_client_path  - Path to js-client repo (default: ../js-client)
#
# Example:
#   ./docs/update-local-sdk.sh ../waldur-mastermind ../js-client
#
# NOTE: SDK generation lives in the js-client repo (openapi-ts.config.mjs +
# scripts/generate-ts-sdk.sh + scripts/patch-sdk.mjs). Mastermind no longer
# carries an openapi-ts config, so this script only produces the schema and
# delegates the actual codegen/patch/build to js-client's own script.

set -e

# Default paths (relative to current homeport base folder)
MASTERMIND_PATH="${1:-../waldur-mastermind}"
JS_CLIENT_PATH="${2:-../js-client}"

# Resolve to absolute paths
MASTERMIND_PATH="$(cd "$(dirname "$0")/.." && cd "$MASTERMIND_PATH" && pwd)"
JS_CLIENT_PATH="$(cd "$(dirname "$0")/.." && cd "$JS_CLIENT_PATH" && pwd)"
WH2_PATH="$(cd "$(dirname "$0")/.." && pwd)"

# The js-client generator reads its input from this fixed filename (see
# js-client/openapi-ts.config.mjs: input: 'waldur-typescript-schema.yaml').
SCHEMA_FILE="$JS_CLIENT_PATH/waldur-typescript-schema.yaml"

echo "=== Waldur SDK Regeneration ==="
echo "Mastermind: $MASTERMIND_PATH"
echo "JS Client:  $JS_CLIENT_PATH"
echo "HomePort:   $WH2_PATH"
echo ""

# Step 1: Generate OpenAPI schema from Mastermind into js-client
#
# Both the environment and the settings module must match how CI generates the
# TypeScript schema (waldur-mastermind/.gitlab-ci.yml, "Generate OpenAPI schema"
# job) — keep this command in step with that line.
#
# SKIP_MAKE_FIELDS_OPTIONAL decides which of two mutually exclusive
# post-processing hooks runs. Unset, make_fields_optional empties required[] for
# the response of every endpoint taking a `field` query parameter — most of the
# API — and every property generates as optional. Set, make_readonly_fields_required
# runs instead and read-only fields stay required, which is what the published
# waldur-js-client reflects. Generating without it yields an SDK that type-checks
# code the published one rejects.
echo "[1/6] Generating OpenAPI schema..."
cd "$MASTERMIND_PATH"
SKIP_MAKE_FIELDS_OPTIONAL=true \
  DJANGO_SETTINGS_MODULE=waldur_core.server.doc_settings \
  uv run waldur spectacular --file "$SCHEMA_FILE" --fail-on-warn
echo "      Schema generated: $SCHEMA_FILE"

# Step 2: Generate + patch + build the SDK via js-client's own generator.
# RELEASE_VERSION pins a local version so the script does not depend on
# CI_PIPELINE_IID (only set in GitLab CI).
echo "[2/6] Generating and building SDK in js-client..."
cd "$JS_CLIENT_PATH"
RELEASE_VERSION="${RELEASE_VERSION:-0.0.0-local}" bash scripts/generate-ts-sdk.sh

# Step 3: Generate SDK reference catalog + js-client CLAUDE.md from the schema
echo "[3/6] Generating SDK reference catalog and CLAUDE.md..."
cd "$MASTERMIND_PATH"
uv run python "$WH2_PATH/docs/generate-sdk-catalog.py" "$SCHEMA_FILE" "$JS_CLIENT_PATH/SDK-REFERENCE.md"
uv run python "$WH2_PATH/docs/generate-sdk-claude-md.py" "$SCHEMA_FILE" "$JS_CLIENT_PATH/CLAUDE.md"
# Ensure the generated docs are included in the npm package's files list.
python3 -c "
import json, pathlib
p = pathlib.Path('$JS_CLIENT_PATH/package.json')
pkg = json.loads(p.read_text())
changed = False
for f in ('SDK-REFERENCE.md', 'CLAUDE.md'):
    if f not in pkg.get('files', []):
        pkg.setdefault('files', []).append(f)
        changed = True
if changed:
    p.write_text(json.dumps(pkg, indent=2) + '\n')
    print('      Updated package.json files list')
"

# Step 4: Link js-client into HomePort
echo "[4/6] Linking js-client in HomePort..."
# HomePort is a Yarn 4 (Berry) project. Yarn 4 dropped the Yarn 1 global link
# registry (~/.config/yarn/link) and its --link-folder isolation flag — the old
# `yarn link waldur-js-client --link-folder <dir>` is a syntax error there, so
# it failed without linking anything and the frontend silently kept using the
# published SDK version.
#
# `yarn link -r <path>` instead records a relative `portal:` entry under
# "resolutions" in package.json and symlinks node_modules/waldur-js-client at
# the local build. Because the resolution lives in this checkout's package.json,
# several workspaces on one machine can no longer clobber each other's link —
# which is what YARN_LINK_FOLDER used to work around.
cd "$WH2_PATH"
if [ -n "${YARN_LINK_FOLDER:-}" ]; then
  echo "      Note: YARN_LINK_FOLDER is a Yarn 1 setting and is now ignored."
fi
yarn link -r "$JS_CLIENT_PATH"
echo "      Linked: $(readlink node_modules/waldur-js-client)"

# Step 5: Generate enums and descriptions from Mastermind
echo "[5/6] Generating enums and descriptions..."
cd "$MASTERMIND_PATH"
export DJANGO_SETTINGS_MODULE=waldur_core.server.doc_settings

uv run python src/waldur_core/permissions/print_permission_enums.py > /tmp/permission_enums.ts
uv run waldur print_events_enums > /tmp/EventsEnums.ts
uv run waldur print_features_enums > /tmp/FeaturesEnums.ts
uv run waldur print_features_description > /tmp/FeaturesDescription.ts
uv run waldur print_settings_description > /tmp/SettingsDescription.ts
uv run waldur print_permissions_description > /tmp/PermissionOptions.tsx

echo "      Generated: permission_enums.ts, EventsEnums.ts, FeaturesEnums.ts,"
echo "                 FeaturesDescription.ts, SettingsDescription.ts, PermissionOptions.tsx"

# Step 6: Copy generated enums to HomePort
echo "[6/6] Copying enums to HomePort..."
mv /tmp/permission_enums.ts "$WH2_PATH/src/permissions/enums.ts"
mv /tmp/EventsEnums.ts "$WH2_PATH/src/EventsEnums.ts"
mv /tmp/FeaturesEnums.ts "$WH2_PATH/src/FeaturesEnums.ts"
mv /tmp/FeaturesDescription.ts "$WH2_PATH/src/features/FeaturesDescription.ts"
mv /tmp/SettingsDescription.ts "$WH2_PATH/src/SettingsDescription.ts"
mv /tmp/PermissionOptions.tsx "$WH2_PATH/src/administration/roles/PermissionOptions.tsx"

# Prettier-format the generated files. The Django generators do not emit
# prettier-clean output, so without this the repo's `format:check`
# (prettier --check) fails in CI on every MR built after a regeneration.
echo "      Formatting generated files with Prettier..."
cd "$WH2_PATH"
./node_modules/.bin/prettier --write \
  src/permissions/enums.ts \
  src/EventsEnums.ts \
  src/FeaturesEnums.ts \
  src/features/FeaturesDescription.ts \
  src/SettingsDescription.ts \
  src/administration/roles/PermissionOptions.tsx

echo ""
echo "=== Done! ==="
echo "SDK and enums have been regenerated and linked to HomePort."
echo "Run 'yarn tsgo --noEmit' to verify TypeScript compilation."
echo ""
echo "The link added a local 'waldur-js-client: portal:...' resolution to"
echo "package.json — do not commit it. Once the SDK is published, bump the"
echo "waldur-js-client version in package.json and drop the link with:"
echo "  yarn unlink $JS_CLIENT_PATH && git checkout package.json yarn.lock"
