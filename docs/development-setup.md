# Development Setup Guide

This guide covers development environment setup, build configuration, and essential commands for Waldur HomePort development.

## Essential Commands

### Development

- `yarn start` - Start development server (runs on port 8001)
- `yarn devcontainer` - Start dev server for containerized development (binds to 0.0.0.0:8001)
- `yarn build` - Create production build
- `yarn preview` - Preview production build

### Code Quality

- `yarn lint:check` - Run ESLint checks
- `yarn lint:fix` - Fix ESLint issues automatically
- `yarn format:check` - Check code formatting with Prettier
- `yarn format:fix` - Auto-format code with Prettier
- `yarn style:check` - Check SCSS/CSS styles with Stylelint
- `yarn deps:unused` - Check for unused dependencies with Knip
- `yarn tsc` - Typescript type check

### Testing

- `yarn test` - Run unit tests with Vitest
- `yarn ci:test` - Run full integration test suite with Cypress
- `yarn ci:run` - Run Cypress tests headless

### Dependency Management

- `yarn deps:unused` - Find unused dependencies and exports with Knip
- `yarn deps:circular` - Check for circular dependencies with Madge

#### Version Management

Check current dependency versions

`yarn list --depth=0`

Check for outdated packages

`yarn outdated`

Check specific package version

`yarn info <package-name> version`

After updating version in package.json, install dependencies

`yarn install`

Update all dependencies to latest versions (use with caution)

`yarn upgrade`

## Build System & Performance

### Modern Build Configuration

- **Vite** with ES modules support
- **Node.js** (latest LTS) compatibility
- Code splitting with lazy loading for all major features
- Optimized bundle sizes and asset processing
- Source maps for development and production debugging

#### Check Build Tool Versions

node --version
yarn --version
yarn info vite version

### Performance Optimizations

- Lazy component loading with `lazyComponent` utility
- Dynamic reducer injection for Redux store
- Automatic code splitting by route and feature
- Optimized asset loading (images, fonts, SVG)
- Bundle analysis and optimization tools

## Key Development Tools

### Code Quality & Analysis

- **Knip** for unused dependency detection
- **Madge** for circular dependency analysis
- **Lint-staged** for pre-commit code formatting
- **PostCSS** with autoprefixer and cssnano for CSS optimization

### Modern Development Practices

- **ESM (ES Modules)** throughout the codebase
- **TypeScript** with comprehensive typing
- **Flat ESLint config** format
- **Husky** git hooks for automated quality checks
- **Yarn** package management with lockfile integrity

### Check Development Tool Versions

`yarn info typescript eslint prettier husky version`

## Asset Management

- SVG files processed through SVGR plugin for React components
- Images and static assets in `src/images/`
- Font files managed through Vite's asset pipeline
- Markdown content processed through vite-plugin-markdown
- Monaco Editor for code editing capabilities
- Sass for SCSS preprocessing

### Check Asset Processing Tool Versions

#### Check current versions

`yarn info @svgr/rollup-plugin vite-plugin-markdown monaco-editor sass version`

## Environment Variables

- `VITE_API_URL` - Backend API endpoint (defaults to <http://localhost:8000>/)

## Backend Integration

Integrates with Waldur MasterMind REST API requiring CORS configuration on the backend for local development.

### API Client

- **Waldur JS Client** - Custom API client for Waldur MasterMind
- Auto-generated client with TypeScript support
- Request/response interceptors for authentication and error handling
- Token-based authentication with auto-refresh capabilities

#### Version Management

Check current version

grep "waldur-js-client" package.json

Check latest available version

yarn info waldur-js-client version

Update to latest version in package.json, then install

yarn install

## Development Environment Setup

### Prerequisites

- Node.js (latest LTS - check with `node --version`)
- Yarn package manager (check with `yarn --version`)
- Backend Waldur MasterMind API running (typically on port 8000)

#### Check Prerequisites

Verify Node.js version (should be latest LTS)

`node --version`

Verify Yarn installation

`yarn --version`

Check if backend API is running

`curl -I <http://localhost:8000/api/>`

### Initial Setup

1. Install dependencies: `yarn install`
2. Configure environment variables in `.env` file
3. Start development server: `yarn start`
4. Access application at `<http://localhost:8001`>

### Docker Development

For containerized development:

1. Use `yarn devcontainer` to start server bound to `1.1.1.0:8001`
2. Ensure proper network configuration for container access

### IDE Configuration

- TypeScript support with path mapping for `@waldur/*` imports
- ESLint and Prettier integration for code formatting
- Vitest integration for test running and debugging
