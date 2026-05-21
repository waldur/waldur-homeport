# Code Quality Standards

This guide covers code quality standards, testing practices, and technical requirements for Waldur HomePort.

## Technical Standards

### Architecture Principles

- **Composition over inheritance** - Use dependency injection
- **Interfaces over singletons** - Enable testing and flexibility
- **Explicit over implicit** - Clear data flow and dependencies
- **Test-driven when possible** - Never disable tests, fix them

### Code Quality Requirements

- **Every commit must**:
  - Compile successfully
  - Pass all existing tests
  - Include tests for new functionality
  - Follow project formatting/linting

- **Before committing**:
  - Run formatters/linters
  - Self-review changes
  - Ensure commit message explains "why"

### Error Handling

- Fail fast with descriptive messages
- Include context for debugging
- Handle errors at appropriate level
- Never silently swallow exceptions

## Development Guidelines

### TypeScript Configuration

- Uses `@/*` path mapping for internal imports
- Strict TypeScript checking disabled for legacy compatibility
- Module resolution set to "Bundler" for Vite compatibility

### Code Style

- ESLint with flat config format enforced with TypeScript, React, and accessibility rules
- Prettier for code formatting (2 spaces, semicolons, single quotes)
- Import ordering enforced with `@waldur` imports grouped separately
- SCSS/CSS linting with Stylelint
- Husky for git hooks and pre-commit checks

#### Check Code Style Tool Versions

```bash
Check current versions

yarn info eslint prettier stylelint husky version
```

### TypeScript and SDK Types

- **Always prefer SDK types over custom types** from `waldur-js-client` package
- Import types using `type` keyword: `import { type ComponentUsageCreateRequest } from 'waldur-js-client'`
- Common SDK types to use instead of custom interfaces:
  - `ResourcePlanPeriod` - for plan periods with components
  - `BaseComponentUsage` - for component usage data in periods
  - `ComponentUsageCreateRequest` - for usage submission request bodies
  - `ComponentUserUsageCreateRequest` - for user usage submission request bodies
  - `ComponentUsage` - for general component usage data
  - All marketplace API request/response types are available in the SDK
- When using React Final Form, use standard pattern: `<Field component={NumberField as any} />`
- Convert between SDK string types and numbers when necessary (e.g., `parseFloat(component.usage)`)
- Handle nullable SDK types properly with optional chaining (`period.value?.components`)

## Tooling

### Essential Commands

#### Code Quality

- `yarn lint:check` - Run ESLint checks
- `yarn lint:fix` - Fix ESLint issues automatically
- `yarn format:check` - Check code formatting with Prettier
- `yarn format:fix` - Auto-format code with Prettier
- `yarn style:check` - Check SCSS/CSS styles with Stylelint
- `yarn deps:unused` - Check for unused dependencies with Knip
- `yarn tsc` - Typescript type check

#### Dependency Management

- `yarn deps:unused` - Find unused dependencies and exports with Knip
- `yarn deps:circular` - Check for circular dependencies with Madge

### Tooling Standards

- Use project's existing build system
- Use project's test framework
- Use project's formatter/linter settings
- Don't introduce new tools without strong justification

## Quality Assurance

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
