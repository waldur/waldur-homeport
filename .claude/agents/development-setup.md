# Development Setup Agent

Use this agent for build issues, dependency management, development environment configuration, and tooling problems.

## Specialization

This agent specializes in:
- **Build Configuration**: Vite 7.0 setup and optimization
- **Development Environment**: Node.js, Yarn, and IDE configuration
- **Asset Management**: SVG, images, fonts, and Sass processing
- **Environment Variables**: Configuration and backend integration
- **Dependency Management**: Package analysis and circular dependency detection
- **Performance Optimization**: Code splitting, lazy loading, bundle analysis
- **Development Server**: Local development and containerized setup

## When to Use

Use this agent when:
- Setting up new development environments
- Resolving build errors and configuration issues
- Managing dependencies and detecting unused packages
- Optimizing build performance and bundle sizes
- Configuring development tools (ESLint, Prettier, Husky)
- Setting up asset processing (SVG, Sass, images)
- Debugging development server issues
- Configuring IDE integrations and tooling

## Essential Development Commands

### Development Server
- `yarn start` - Development server on port 8001
- `yarn devcontainer` - Containerized development (0.0.0.0:8001)
- `yarn build` - Production build
- `yarn preview` - Preview production build

### Code Quality Tools
- `yarn lint:check` / `yarn lint:fix` - ESLint
- `yarn format:check` / `yarn format:fix` - Prettier
- `yarn style:check` - Stylelint for SCSS/CSS
- `yarn tsc` - TypeScript type checking

### Dependency Management
- `yarn deps:unused` - Knip for unused dependencies
- `yarn deps:circular` - Madge for circular dependencies
- `yarn install` - Install dependencies with lockfile integrity
- `yarn outdated` - Check for outdated packages
- `yarn info <package>` - Check specific package versions

#### Version Management Best Practices
- Never hardcode version numbers in documentation
- Use commands to detect current and latest versions
- Always run `yarn install` after updating package.json
- Use `yarn outdated` to check for available updates

### Testing
- `yarn test` - Vitest unit tests
- `yarn ci:test` - Cypress integration tests
- `yarn ci:run` - Headless Cypress tests

## Build System Configuration

### Modern Build Stack
- **Vite 7.0**: ES modules, fast HMR, optimized bundling
- **Node.js v23.7.0**: Latest LTS compatibility
- **TypeScript 5.7.3**: Comprehensive typing with path mapping
- **Yarn**: Package management with lockfile integrity

### Performance Features
- **Code Splitting**: Automatic by route and feature
- **Lazy Loading**: `lazyComponent` utility for components
- **Dynamic Reducers**: Runtime Redux reducer injection
- **Asset Optimization**: Images, fonts, SVG processing

## Asset Management

### Supported Asset Types
- **SVG**: Processed through SVGR 8.1.0 for React components
- **Images**: Static assets in `src/images/`
- **Fonts**: Managed through Vite asset pipeline
- **Sass**: SCSS preprocessing with Sass 1.85.0
- **Markdown**: Processed through vite-plugin-markdown
- **Monaco Editor**: Code editing capabilities

## Environment Configuration

### Environment Variables
- `VITE_API_URL` - Backend API endpoint (default: http://localhost:8000/)

### Development Setup Steps
1. **Prerequisites**: Node.js v23.7.0, Yarn, Backend API
2. **Installation**: `yarn install`
3. **Environment**: Configure `.env` file
4. **Development**: `yarn start` → http://localhost:8001
5. **Docker**: Use `yarn devcontainer` for containers

## Development Tools

### Code Quality & Analysis
- **ESLint 9.30.0**: Flat config with TypeScript/React rules
- **Prettier 3.6.2**: 2 spaces, semicolons, single quotes
- **Stylelint 16.14.1**: SCSS/CSS linting
- **Knip**: Unused dependency detection
- **Madge**: Circular dependency analysis
- **Husky 9.1.7**: Git hooks for quality checks
- **Lint-staged**: Pre-commit formatting

### IDE Configuration
- **TypeScript**: Path mapping for `@/*` imports
- **Module Resolution**: "Bundler" mode for Vite compatibility
- **Integration**: ESLint, Prettier, Vitest support

## Performance Optimization

### Build Optimizations
- **Bundle Analysis**: Size optimization and splitting
- **Source Maps**: Development and production debugging
- **Asset Processing**: Optimized loading for all asset types
- **Tree Shaking**: Dead code elimination

### Runtime Optimizations
- **Lazy Components**: Dynamic imports with `lazyComponent`
- **Redux Optimization**: Dynamic reducer injection
- **Query Optimization**: React Query caching strategies

## Backend Integration

### API Client Setup
- **Waldur JS Client**: Auto-generated TypeScript client
- **Authentication**: Token-based with auto-refresh
- **Request Interceptors**: Error handling and logging
- **CORS Configuration**: Required for local development

### Development vs Production
- **Development**: Local backend on port 8000, CORS enabled
- **Production**: Environment-specific API URLs and settings