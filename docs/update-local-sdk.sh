#!/bin/bash
#
# Script to regenerate Waldur TypeScript SDK from OpenAPI schema
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
echo "[1/5] Generating OpenAPI schema..."
cd "$MASTERMIND_PATH"
uv run waldur spectacular --file waldur-openapi-schema.yaml --fail-on-warn
echo "      Schema generated: waldur-openapi-schema.yaml"

# Step 2: Generate TypeScript code
echo "[2/5] Generating TypeScript from schema..."
npx --yes @hey-api/openapi-ts@0.77.0

# Step 3: Post-processing
echo "[3/5] Post-processing generated code..."
sed -i.bak '/querySerializer: {/,/},/d' waldur-typescript-sdk/sdk.gen.ts && rm waldur-typescript-sdk/sdk.gen.ts.bak
sed -i.bak $'1i\\\nexport { formDataBodySerializer, RequestResult } from "./client";' waldur-typescript-sdk/index.ts && rm waldur-typescript-sdk/index.ts.bak

# Step 4: Copy to js-client and build
echo "[4/5] Copying to js-client and building..."
cp -rf waldur-typescript-sdk/* "$JS_CLIENT_PATH/src/"
cd "$JS_CLIENT_PATH"
yarn build

# Step 5: Link in HomePort
echo "[5/5] Linking in HomePort..."
yarn link 2>/dev/null || true
cd "$WH2_PATH"
yarn link waldur-js-client

echo ""
echo "=== Done! ==="
echo "SDK has been regenerated and linked to HomePort."
echo "Run 'yarn tsc --noEmit' to verify TypeScript compilation."
