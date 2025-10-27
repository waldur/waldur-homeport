# Local pipeline for developers: OpenAPI -> TypeScript SDK -> Homeport

This document describes the process of generating and linking the Waldur TypeScript SDK for local development. Although the SDK code is published to GitHub and npm repositories, a local pipeline is essential for developers who need to make changes to the SDK without using GitLab CI or work with the very latest OpenAPI definitions from Waldur MasterMind before they are officially released.

## Prerequisites

Before proceeding, ensure you have the following installed and configured:

* **poetry**: For managing Python dependencies in Waldur MasterMind.
* **npx**: Comes with Node.js, used for executing Node.js package binaries.
* **yarn**: For managing JavaScript dependencies in Waldur HomePort and Waldur TypeScript SDK.
* **Waldur MasterMind**: Cloned and set up in a directory named `waldur-mastermind`.
* **Waldur HomePort**: Cloned and set up in a directory named `waldur-homeport`.
* **Waldur TypeScript SDK**: Cloned and set up in a directory named `js-client`.

## Steps to generate and link the SDK

These steps outline the process of generating the TypeScript SDK from the Waldur MasterMind OpenAPI schema and linking it to Waldur HomePort for local development.

1. **Generate the OpenAPI schema.**
   This command uses `waldur spectacular` to generate the `waldur-openapi-schema.yaml` file. In `waldur-mastermind` directory, run:

   ```bash
   uv run waldur spectacular --file waldur-openapi-schema.yaml --fail-on-warn
   ```

2. **Generate TypeScript code from the OpenAPI schema.**
   This step uses `@hey-api/openapi-ts` to convert the OpenAPI schema into TypeScript client code. In `waldur-mastermind` directory, run:

   ```bash
   # generation
   npx --yes @hey-api/openapi-ts@0.77.0

   # post-processing
   sed -i.bak '/querySerializer: {/,/},/d' waldur-typescript-sdk/sdk.gen.ts && rm waldur-typescript-sdk/sdk.gen.ts.bak
   sed -i.bak $'1i\\\nexport { formDataBodySerializer, RequestResult } from "./client";' waldur-typescript-sdk/index.ts && rm waldur-typescript-sdk/index.ts.bak


   # copying
   cp -rvf waldur-typescript-sdk/* ../js-client/src
   ```

3. **Building a local version of the Waldur SDK with Yarn.**
   In the `js-client` directory, run:

   ```bash
   yarn build
   ```

4. **Linking a local version of the Waldur SDK with Yarn.**
   In the `js-client` directory, run:

   ```bash
   yarn link
   ```

5. **Enable locally installed Waldur SDK in Waldur HomePort.**
   This command will symlink your local Waldur SDK into Waldur HomePort for development and testing. In `waldur-homeport` directory, run:

   ```bash
   yarn link waldur-js-client
   ```
