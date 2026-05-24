# Testing Standards & Strategy

This guide covers the testing strategy, frameworks, and best practices for Waldur HomePort.

## 1. The Testing Pyramid

We follow the testing pyramid model to balance speed, cost, and confidence:

- **Unit & Component Tests (Base)**: ~70% of tests. Fast, isolated, and focused on individual functions, hooks, and components.
- **Integration Tests (Middle)**: ~20% of tests. Focused on interactions between multiple components or complex state management (e.g., full forms, complex tables).
- **E2E & Visual Tests (Top)**: ~10% of tests. Critical user journeys and visual consistency across browsers and themes.

---

## 2. Unit & Component Testing (Vitest + RTL)

Unit tests are used for testing React components and utilities. They are written in `.test.ts` or `.test.tsx` files located next to the code they test.

### Standards

- **Runner**: [Vitest](https://vitest.dev/)
- **Utilities**:
    - [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/)
    - [@testing-library/user-event](https://testing-library.com/docs/user-event/intro/)
- **Goal**: Verify behavior, not implementation. Use `screen.getByRole` or `screen.getByText` over test IDs when possible.
- **Accessibility**: Integrate automated accessibility checks using `axe-core` within RTL tests where appropriate.

### Mocking HTTP Requests

When testing components that fetch data, use `nock` to intercept outgoing HTTP requests and provide custom responses.

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { afterEach, beforeEach, describe, it } from 'vitest';

const API_URL = 'http://example.com';

describe('MyComponent', () => {
  beforeEach(() => {
    nock(API_URL)
      .get('/api/my-data/')
      .reply(200, { id: 1, name: 'Test Data' });
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should fetch and display data', async () => {
    render(<MyComponent />);
    // Verify mocked data appears
    expect(await screen.findByText('Test Data')).toBeInTheDocument();
  });

  it('should handle API errors', async () => {
    nock(API_URL)
      .get('/api/my-data/')
      .reply(400, { error: 'Invalid request' });

    render(<MyComponent />);
    // Verify error message appears
    expect(await screen.findByText('Unable to load data.')).toBeInTheDocument();
  });
});
```

### Mocking Constraints & Best Practices

- **Manual Mocks**: Use `vi.mock()` for external modules. Calls must be at the top level (hoisted).
- **Mock Minimal**: Only mock what's actually imported by the component under test.
- **Test Code Sharing**:
    - Extract shared test data into separate files (e.g., `test-utils.ts`).
    - Share test data as exported constants, not function calls.
- **Managed Mutations**: When testing components using `useManagedMutation`, verify that notifications and callbacks (e.g., `refetch`, `onSuccess`) are called correctly.

---

## 3. E2E & Visual Testing (Playwright)

E2E and visual regression tests are implemented using [Playwright](https://playwright.dev/).

### E2E Workflows

- **Location**: `e2e/`
- **Focus**: "Happy paths" for critical business logic (Login, Resource Ordering, Organization Management).
- **API Mocking**: Use `page.route()` to isolate frontend tests from backend availability.

### Visual Regression

- **Location**: `e2e-visual/`
- **Focus**: Dashboard charts, complex wizards, and theme consistency across dark/light modes.
- **Thresholds**: `maxDiffPixelRatio: 0.01` to allow for minor anti-aliasing differences.

---

## 4. Quality Gates & Tools

### Static Analysis

- **ESLint**: Enforces code style and project-specific patterns (e.g., button variants, table imports).
- **Stylelint**: Validates SCSS/CSS against design tokens.
- **Knip**: Identifies unused files, dependencies, and exports.
- **Madge**: Prevents circular dependencies.

### Continuous Integration (CI)

- All tests must pass on every PR.
- Coverage reports are generated for every build (stored in `./coverage`).
- Playwright traces and reports are archived for failure analysis.

### Pre-commit Hooks

- Husky and lint-staged enforce linting and formatting before commit.

---

## 5. Essential Commands

| Command | Description |
| :--- | :--- |
| `yarn test` | Run unit tests with Vitest |
| `yarn test:e2e` | Run E2E tests with Playwright |
| `yarn test:visual` | Run visual regression tests |
| `yarn test:visual:update` | Update visual snapshots |

---

## 6. Resources

- [Unit Test Template](test-templates/unit-test.md)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
