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

## Testing Strategy

### Testing Frameworks

- **Unit Tests**: Vitest with React Testing Library for component testing
- **Integration Tests**: Cypress for end-to-end workflows

#### Check Testing Framework Versions

Check current versions

yarn info vitest @testing-library/react cypress version```

- Test files use `.test.ts/.test.tsx` extensions
- Setup files in `test/setupTests.js`
- Integrated coverage reporting

### Test Guidelines

- Test behavior, not implementation
- One assertion per test when possible
- Clear test names describing scenario
- Use existing test utilities/helpers
- Tests should be deterministic

### Test Code Sharing & Mocking

**Extracting Common Test Code**:

- Extract shared test data into separate files (e.g., `test-utils.ts`)
- Only mock what's actually imported by the component under test
- Don't mock exports that aren't used - it adds unnecessary complexity
- Verify import paths match actual usage (e.g., `./constants` vs `@waldur/marketplace/common/constants`)

**Vitest Mocking Constraints**:

- `vi.mock()` calls must be at the top level, not inside functions
- Vitest hoists mocks, so they can't reference variables defined later
- Share test data as exported constants, not function calls
- Mock the exact module path used in the component's imports

**Example Pattern**:

```js
// test-utils.ts
export const mockOffering = { uuid: '123', name: 'Test' };
export const mockPlan = { uuid: '456', name: 'Plan' };

// component.test.tsx
import { mockOffering, mockPlan } from './test-utils';

vi.mock('./constants', () => ({
  getBillingPeriods: () => [...], // Only mock what's actually used
  // Don't include ADD_PLAN_FORM_ID if component doesn't import it
}));
```

**Code Duplication Detection**:

- CI/CD uses `jscpd` with strict thresholds (typically 250 tokens)
- Extract common patterns properly - don't game the detector with formatting
- Shared test utilities reduce duplication and improve maintainability

## Development Guidelines

### TypeScript Configuration

- Uses `@waldur/*` path mapping for internal imports
- Strict TypeScript checking disabled for legacy compatibility
- Module resolution set to "Bundler" for Vite compatibility

### Code Style

- ESLint with flat config format enforced with TypeScript, React, and accessibility rules
- Prettier for code formatting (2 spaces, semicolons, single quotes)
- Import ordering enforced with `@waldur` imports grouped separately
- SCSS/CSS linting with Stylelint
- Husky for git hooks and pre-commit checks

#### Check Code Style Tool Versions

```
Check current versions

yarn info eslint prettier stylelint husky version```

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

#### Testing

- `yarn test` - Run unit tests with Vitest
- `yarn ci:test` - Run full integration test suite with Cypress
- `yarn ci:run` - Run Cypress tests headless

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
