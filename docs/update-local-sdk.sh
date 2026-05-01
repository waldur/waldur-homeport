#!/bin/bash
#
# Script to regenerate Waldur TypeScript SDK and enums from OpenAPI schema
# Usage: ./docs/update-local-sdk.sh [mastermind_path] [js_client_path]
#
# Arguments:
#   mastermind_path - Path to waldur-mastermind repo (default: ../wm2)
#   js_client_path  - Path to js-client repo (default: ../js-client)
#
# Example:
#   ./docs/update-local-sdk.sh ../waldur-mastermind ../js-client
#

set -e

# Default paths (relative to current homeport base folder)
MASTERMIND_PATH="${1:-../waldur-mastermind}"
JS_CLIENT_PATH="${2:-../js-client}"

# Resolve to absolute paths
MASTERMIND_PATH="$(cd "$(dirname "$0")/.." && cd "$MASTERMIND_PATH" && pwd)"
JS_CLIENT_PATH="$(cd "$(dirname "$0")/.." && cd "$JS_CLIENT_PATH" && pwd)"
WH2_PATH="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Waldur SDK Regeneration ==="
echo "Mastermind: $MASTERMIND_PATH"
echo "JS Client:  $JS_CLIENT_PATH"
echo "HomePort:   $WH2_PATH"
echo ""

# Step 1: Generate OpenAPI schema
echo "[1/9] Generating OpenAPI schema..."
cd "$MASTERMIND_PATH"
uv run waldur spectacular --file waldur-openapi-schema.yaml --fail-on-warn
echo "      Schema generated: waldur-openapi-schema.yaml"

# Step 2: Generate TypeScript code
echo "[2/9] Generating TypeScript from schema..."
npx --yes @hey-api/openapi-ts@0.77.0

# Step 3: Post-processing
echo "[3/9] Post-processing generated code..."
sed -i.bak '/querySerializer: {/,/},/d' waldur-typescript-sdk/sdk.gen.ts && rm waldur-typescript-sdk/sdk.gen.ts.bak
sed -i.bak $'1i\\\nexport { formDataBodySerializer, RequestResult } from "./client";' waldur-typescript-sdk/index.ts && rm waldur-typescript-sdk/index.ts.bak

# Step 4: Generate SDK reference catalog
echo "[4/9] Generating SDK reference catalog..."
uv run python "$WH2_PATH/docs/generate-sdk-catalog.py" waldur-openapi-schema.yaml "$JS_CLIENT_PATH/SDK-REFERENCE.md"
# Ensure SDK-REFERENCE.md is included in npm package
python3 -c "
import json, pathlib
p = pathlib.Path('$JS_CLIENT_PATH/package.json')
pkg = json.loads(p.read_text())
if 'SDK-REFERENCE.md' not in pkg.get('files', []):
    pkg.setdefault('files', []).append('SDK-REFERENCE.md')
    p.write_text(json.dumps(pkg, indent=2) + '\n')
    print('      Added SDK-REFERENCE.md to package.json files')
"

# Step 5: Generate CLAUDE.md for js-client
echo "[5/9] Generating CLAUDE.md for js-client..."
uv run python "$WH2_PATH/docs/generate-sdk-claude-md.py" waldur-openapi-schema.yaml "$JS_CLIENT_PATH/CLAUDE.md"
# Ensure CLAUDE.md is included in npm package
python3 -c "
import json, pathlib
p = pathlib.Path('$JS_CLIENT_PATH/package.json')
pkg = json.loads(p.read_text())
if 'CLAUDE.md' not in pkg.get('files', []):
    pkg.setdefault('files', []).append('CLAUDE.md')
    p.write_text(json.dumps(pkg, indent=2) + '\n')
    print('      Added CLAUDE.md to package.json files')
"

# Step 6: Copy to js-client and build
echo "[6/9] Copying to js-client and building..."
cp -rf waldur-typescript-sdk/* "$JS_CLIENT_PATH/src/"
cd "$JS_CLIENT_PATH"
yarn build

# Step 7: Link in HomePort
echo "[7/9] Linking in HomePort..."
yarn link 2>/dev/null || true
cd "$WH2_PATH"
yarn link waldur-js-client

# Step 8: Generate enums and descriptions from Mastermind
echo "[8/9] Generating enums and descriptions..."
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

# Step 9: Copy generated files to HomePort
echo "[9/9] Copying enums to HomePort..."
mv /tmp/permission_enums.ts "$WH2_PATH/src/permissions/enums.ts"
mv /tmp/EventsEnums.ts "$WH2_PATH/src/EventsEnums.ts"
mv /tmp/FeaturesEnums.ts "$WH2_PATH/src/FeaturesEnums.ts"
mv /tmp/FeaturesDescription.ts "$WH2_PATH/src/features/FeaturesDescription.ts"
mv /tmp/SettingsDescription.ts "$WH2_PATH/src/SettingsDescription.ts"
mv /tmp/PermissionOptions.tsx "$WH2_PATH/src/administration/roles/PermissionOptions.tsx"

echo ""
echo "=== Done! ==="
echo "SDK and enums have been regenerated and linked to HomePort."
echo "Run 'yarn tsc --noEmit' to verify TypeScript compilation."
