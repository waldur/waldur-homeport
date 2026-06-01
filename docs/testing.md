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
- **Goal**: Verify behavior, not implementation. Use semantic queries like `screen.getByRole` or `screen.getByLabelText` over test IDs or DOM-based queries (`querySelector`) whenever possible.
- **Accessibility**: Integrate automated accessibility checks using `axe-core` within RTL tests where appropriate.
- **Isolation**: Reset mocks between tests to prevent state leakage.

### Test Harness and Providers

Avoid manual `QueryClient` setup. Use the `renderWithProviders` utility from `@/test/harness` to wrap components in necessary providers (like `QueryClientProvider`).

```tsx
import { renderWithProviders } from '@/test/harness';
import { MyComponent } from './MyComponent';

it('renders correctly', () => {
  renderWithProviders(<MyComponent />);
  // ... expectations
});
```

If you need to inspect or spy on the `queryClient` (e.g., for invalidations):

```tsx
it('invalidates queries on success', async () => {
  const { queryClient } = renderWithProviders(<MyComponent />);
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

  // ... trigger action

  await waitFor(() => {
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['MyKey'] });
  });
});
```

### Quick Start Template

Use this template as a starting point for testing React components, especially Dialogs and Forms.

```tsx
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';
import { MyComponent } from './MyComponent';

const mockData = { id: 1, name: 'Test Item' };
const mockHandler = vi.fn();

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    renderWithProviders(<MyComponent data={mockData} onAction={mockHandler} />);

    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
  });

  it('triggers action on button click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyComponent data={mockData} onAction={mockHandler} />);

    const button = screen.getByRole('button', { name: /action/i });
    await user.click(button);

    expect(mockHandler).toHaveBeenCalledWith(mockData);
  });

  it('handles loading state during form submission', async () => {
    const user = userEvent.setup();
    // Mock a pending promise
    const slowAction = new Promise((resolve) =>
      setTimeout(() => resolve({}), 100),
    );
    const mockSubmit = vi.fn().mockReturnValue(slowAction);

    renderWithProviders(<MyForm onSubmit={mockSubmit} />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Button should be disabled during submission
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });
  });
});
```

### Key Best Practices

1. **Use `userEvent`**: Prefer `userEvent.click()` over `fireEvent.click()` as it more accurately simulates user interaction.
2. **Role-based Queries**: Use `getByRole`, `getByLabelText`, etc., to ensure components are accessible and tests are robust.
3. **Wait for Changes**: Use `waitFor` or `findBy*` queries when dealing with async updates or state changes.
4. **Clear Mocks**: Always call `vi.clearAllMocks()` in `beforeEach` to prevent test interference.
5. **Mock Minimal**: Only mock the modules that are actually imported and used by the component under test.

---

## 3. Mocking Patterns

Mocking is essential for isolating the component under test by replacing complex dependencies (like API clients, global state, or third-party libraries) with controlled substitutes.

### Rationale

In Waldur HomePort, we aim to:

- **Reduce Boilerplate**: Centralize common mocks to avoid repetitive setup in every test file.
- **Improve Type Safety**: Use `vi.mocked()` for better TypeScript support when interacting with mocks.
- **Ensure Isolation**: Reset mocks between tests to prevent state leakage.
- **Simulate Real Scenarios**: Provide realistic mock responses that mimic the behavior of the actual dependencies.

### Centralized Mocks

Most common service dependencies are mocked globally in `test/setupTests.js`. This ensures they are consistently available and pre-configured.

- **`waldur-js-client`**: Automatically mocked to prevent actual API calls.
- **`@/core/config`**: Provides a default `ENV` object.
- **`@/store/notify`**: Provides `useNotify` for toast notifications.
- **`@/modal/actions`**: Provides `useModal` with a default `confirm` that resolves successfully.
- **`@/workspace/hooks`**: Mocks hooks like `useUser`, `useCustomer`, and `useProject`.
- **`@/router` & `@uirouter/react`**: Globally mocked. Provides common hooks (`useRouter`, `useCurrentStateAndParams`).
- **`@phosphor-icons/react`**: Globally mocked using a Proxy. Icons are replaced with `<span>` elements containing `data-testid="icon-IconName"`.
- **`@/i18n`**: Mocks `translate` and JSX formatters to return literal strings or simple fragments.

### Recommended Patterns

#### 1. Using `vi.mocked()` for Type Safety

Always wrap mocked functions in `vi.mocked()` to get proper autocompletion and type checking for Vitest mock methods.

```tsx
import { usersPartialUpdate } from 'waldur-js-client';
import { vi } from 'vitest';

vi.mocked(usersPartialUpdate).mockResolvedValue({
  data: { uuid: '123' },
} as any);
```

#### 2. Mocking List Responses

When mocking SDK list methods, use the `mockListResponse` utility from `@/test/utils`. This helper ensures the `x-result-count` header is correctly set, which is required by many internal utilities like `fetchResultCount`.

```tsx
import { mockListResponse } from '@/test/utils';
import { customersList } from 'waldur-js-client';

it('displays customers', async () => {
  vi.mocked(customersList).mockResolvedValue(
    mockListResponse([{ uuid: '1', name: 'Customer 1' }]),
  );
});
```

#### 3. Overriding Global Mocks for Specific Tests

If a global mock needs a specific behavior for one test case, use `.mockResolvedValueOnce()` or similar.

```tsx
import { useModal } from '@/modal/actions';

it('handles cancellation', async () => {
  vi.mocked(useModal().confirm).mockRejectedValueOnce(null);
  // ...
});
```

#### 4. Clearing Mocks

Ensure `vi.clearAllMocks()` is called in `beforeEach` to start every test with a clean slate.

```tsx
beforeEach(() => {
  vi.clearAllMocks();
});
```

### Global Mock Examples

#### API Client (`waldur-js-client`)

The entire client is mocked by default. Use `vi.mocked()` to provide specific responses.

```tsx
import { customersList } from 'waldur-js-client';

it('displays customers', async () => {
  vi.mocked(customersList).mockResolvedValue(
    mockListResponse([{ uuid: '1', name: 'Customer 1' }]),
  );

  renderComponent();
  expect(await screen.findByText('Customer 1')).toBeInTheDocument();
});
```

#### Modals (`useModal`)

The `confirm` method resolves successfully by default.

```tsx
import { useModal } from '@/modal/actions';

it('opens a dialog', async () => {
  renderComponent();
  await userEvent.click(screen.getByText('Open'));
  expect(vi.mocked(useModal().openDialog)).toHaveBeenCalled();
});

it('handles confirmation rejection', async () => {
  vi.mocked(useModal().confirm).mockRejectedValueOnce(null);
  renderComponent();
  await userEvent.click(screen.getByText('Delete'));
  // Assert that deletion logic was NOT called
});
```

#### Notifications (`useNotify`)

Assertions on toast notifications are common. Use `vi.mocked()` on the methods of `useNotify()`.

```tsx
import { useNotify } from '@/store/notify';

it('shows success message on save', async () => {
  renderComponent();
  await userEvent.click(screen.getByText('Save'));
  expect(vi.mocked(useNotify().showSuccess)).toHaveBeenCalledWith(
    'Saved successfully',
  );
});
```

#### Workspace Hooks (`@/workspace/hooks`)

These are pre-configured to return empty objects by default.

```tsx
import { useUser, useCustomer } from '@/workspace/hooks';

beforeEach(() => {
  vi.mocked(useUser).mockReturnValue({
    uuid: 'user-1',
    full_name: 'John Doe',
    is_staff: true,
  } as any);

  vi.mocked(useCustomer).mockReturnValue({
    uuid: 'cust-1',
    name: 'Standard Customer',
  } as any);
});
```

#### Routing (`@uirouter/react`)

Routing is globally mocked.

##### Asserting on Navigation

Import `router` from `@/router` to assert on navigation calls:

```tsx
import { router } from '@/router';

it('navigates to details on success', async () => {
  // ... trigger action
  expect(vi.mocked(router.stateService.go)).toHaveBeenCalledWith('details', {
    uuid: '123',
  });
});
```

##### Mocking State or Parameters

Use `vi.mocked()` on hooks from `@uirouter/react` to simulate being on a specific page or having specific URL params:

```tsx
import { useCurrentStateAndParams } from '@uirouter/react';

beforeEach(() => {
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: 'profile.details' } as any,
    params: { uuid: 'user-uuid' },
  });
});
```

##### Using a Real Router

If your test requires a real router instance (e.g. for complex state transition logic), use `createTestRouter` from `@/test/router`:

```tsx
import { createTestRouter } from '@/test/router';
import { UIRouter } from '@uirouter/react';

const testRouter = createTestRouter();
render(
  <UIRouter router={testRouter}>
    <MyComponent />
  </UIRouter>,
);
```

#### Application Configuration (`@/core/config`)

The `ENV` object is globally mocked. You can safely modify `ENV` at the top level of your test file without affecting other files.

```tsx
import { ENV } from '@/core/config';

// Global configuration for all tests in this file
ENV.FEATURES.project.show_description = true;
```

#### Icons (`@phosphor-icons/react`)

Icons are mocked globally using a Proxy. This keeps `screen.debug()` clean and allows for easy assertions on icons.

```tsx
it('renders a plus icon', () => {
  renderComponent();
  // If component uses <PlusCircle weight="bold" />
  const icon = screen.getByTestId('icon-PlusCircle');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveAttribute('weight', 'bold');
});
```

### ❌ Antipatterns

- **❌ Manual `@tanstack/react-query` Mocking**: Avoid manually mocking `useQueryClient` or creating a `new QueryClient()` inside individual tests. Use `renderWithProviders`.
- **❌ Inline Mock Definitions**: Avoid defining mock data or functions directly in the test file's top level if they belong in a fixture.
- **❌ Deep Mocking of Internal Implementation**: Avoid mocking internal component state or private methods. Mock external dependencies and assert on observable behavior.
- **❌ Hardcoded Wait Times**: Avoid using `setTimeout` or fixed delays. Use `waitFor()` from RTL.

### Summary Table

| Dependency        | How to Mock / Use                                                                                       |
| :---------------- | :------------------------------------------------------------------------------------------------------ |
| **API Calls**     | `vi.mocked(apiFunction).mockResolvedValue(...)`                                                         |
| **Notifications** | `expect(useNotify().showSuccess).toHaveBeenCalled()`                                                    |
| **Modals**        | `vi.mocked(useModal().confirm).mockResolvedValue(true)`                                                 |
| **React Query**   | Use `renderWithProviders`                                                                               |
| **Routing**       | Handled globally; import `router` from `@/router` or hooks from `@uirouter/react` and use `vi.mocked()` |

---

## 4. Testing Form Controls

### Semantic Queries

Prefer `screen.getByLabelText()` for form fields. Our `withFormGroup` HOC ensures that labels are correctly associated with their respective inputs.

### React-Select Controls

Standard RTL queries often fail with `react-select` due to its complex internal DOM structure. Use the helpers from `@/test/select` to interact with these components.

#### Common Helpers

- `openAndSelectOption(user, labelText, optionText)`: Opens a dropdown by its label and picks an option.
- `typeAndSelectOption(user, labelText, searchText, optionText)`: Useful for async selects.
- `clearSelect(user, labelText)`: Clears the current selection.

```tsx
import { openAndSelectOption } from '@/test/select';

it('allows selecting a country', async () => {
  const user = userEvent.setup();
  renderWithProviders(<MyForm />);

  await openAndSelectOption(user, 'Country', 'Estonia');
  // ...
});
```

---

## 5. E2E & Visual Testing (Playwright)

E2E and visual regression tests are implemented using [Playwright](https://playwright.dev/).

- **Location**: `e2e/` (Workflows) and `e2e-visual/` (Visual Regression).
- **Focus**: Critical user journeys and visual consistency across themes.

---

## 6. Essential Commands

| Command            | Description                   |
| :----------------- | :---------------------------- |
| `yarn test`        | Run unit tests with Vitest    |
| `yarn test:e2e`    | Run E2E tests with Playwright |
| `yarn test:visual` | Run visual regression tests   |

---

## 7. Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
