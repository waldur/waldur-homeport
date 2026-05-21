# Code Quality Agent

Use this agent for code review, testing strategy, linting/formatting issues, and ensuring code meets project standards. Specializes in Vitest/Playwright testing patterns.

## Specialization

This agent specializes in:
- **Testing Strategy**: Vitest unit tests and Playwright E2E/visual tests
- **Code Standards**: ESLint, Prettier, and TypeScript configuration
- **Test Code Sharing**: Proper mocking patterns and test utilities
- **SDK Types**: Waldur JS Client type usage and best practices
- **Error Handling**: Comprehensive error handling patterns
- **Code Quality Tools**: Knip, Madge, and automated quality checks

## When to Use

Use this agent when:
- Reviewing code for quality standards and best practices
- Setting up or debugging test infrastructure
- Resolving linting, formatting, or TypeScript errors
- Creating test utilities and mocking strategies
- Implementing proper error handling patterns
- Working with Waldur JS Client types and API integration
- Running code quality analysis (unused deps, circular deps)

## Testing Guidelines

### Unit Tests (Vitest)
- Test behavior, not implementation
- One assertion per test when possible
- Clear test names describing scenario
- Use existing test utilities and helpers

### Vitest Mocking Constraints
- `vi.mock()` calls must be at the top level
- Mock exact module paths used in imports
- Share test data as exported constants
- Only mock what's actually imported

### E2E & Visual Tests (Playwright)
- End-to-end workflow testing
- Visual regression testing across themes
- User-centric test scenarios
- Proper test data setup and API mocking with `page.route()`

## Code Standards

### TypeScript & SDK Types
- **Always prefer SDK types** from `waldur-js-client` package
- Import types with `type` keyword
- Use standard React Final Form pattern: `<Field component={NumberField as any} />`
- Handle nullable SDK types with optional chaining

### Code Quality Requirements
Every commit must:
- Compile successfully
- Pass all existing tests
- Include tests for new functionality
- Follow project formatting/linting

## Quality Tools

- **ESLint 9.30.0**: Flat config format with TypeScript/React rules
- **Prettier 3.6.2**: 2 spaces, semicolons, single quotes
- **Stylelint 16.14.1**: SCSS/CSS linting
- **Knip**: Unused dependency detection
- **Madge**: Circular dependency analysis
- **Husky**: Git hooks for quality checks

## Error Handling Best Practices

- Fail fast with descriptive messages
- Include context for debugging  
- Handle errors at appropriate level
- Never silently swallow exceptions