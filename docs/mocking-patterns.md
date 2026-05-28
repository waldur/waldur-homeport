# Mocking Patterns in Waldur HomePort

This document outlines the standard practices, patterns, and anti-patterns for mocking in the Waldur HomePort project. Adhering to these guidelines ensures test consistency, maintainability, and clarity.

## Rationale

Mocking is essential for isolating the component under test by replacing complex dependencies (like API clients, global state, or third-party libraries) with controlled substitutes. In Waldur HomePort, we aim to:

- **Reduce Boilerplate**: Centralize common mocks to avoid repetitive setup in every test file.
- **Improve Type Safety**: Use `vi.mocked()` for better TypeScript support when interacting with mocks.
- **Ensure Isolation**: Reset mocks between tests to prevent state leakage.
- **Simulate Real Scenarios**: Provide realistic mock responses that mimic the behavior of the actual dependencies.

## Centralized Mocks

Most common service dependencies are mocked globally in `test/setupTests.js`. This ensures they are consistently available and pre-configured.

### Key Global Mocks

- **`@/core/config`**: Provides a default `ENV` object with common nested structures (`plugins.WALDUR_CORE`, `FEATURES`).
- **`@/i18n`**: Mocks `translate` and JSX formatters to return literal strings or simple fragments.
- **`waldur-js-client`**: Automatically mocked to prevent actual API calls.
- **`@/modal/actions`**: Provides `useModal` with a default `confirm` that resolves successfully.
- **`@/store/notify`**: Provides `useNotify` for toast notifications.
- **`@/workspace/hooks`**: Mocks hooks like `useUser`, `useCustomer`, and `useProject`.
- **`@/router` & `@uirouter/react`**: Globally mocked. Provides a standard `router` object and common hooks (`useRouter`, `useCurrentStateAndParams`, `useTransition`).
- **`@phosphor-icons/react`**: Globally mocked using a Proxy. Icons are replaced with `<span>` elements containing `data-testid="icon-IconName"`.
- **`@/i18n`**: Mocks `translate` and JSX formatters to return literal strings or simple fragments.

## Test Harness and Providers

Avoid manual `QueryClient` setup. Use the `renderWithProviders` utility from `@/test/harness` to wrap components in necessary providers (like `QueryClientProvider`).

### Example: Using `renderWithProviders`

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

## Recommended Patterns

### 1. Using `vi.mocked()` for Type Safety

Always wrap mocked functions in `vi.mocked()` to get proper autocompletion and type checking for Vitest mock methods.

```tsx
import { usersPartialUpdate } from 'waldur-js-client';
import { vi } from 'vitest';

vi.mocked(usersPartialUpdate).mockResolvedValue({
  data: { uuid: '123' },
} as any);
```

### 2. Overriding Global Mocks for Specific Tests

If a global mock needs a specific behavior for one test case, use `.mockResolvedValueOnce()` or similar.

```tsx
import { useModal } from '@/modal/actions';

it('handles cancellation', async () => {
  vi.mocked(useModal().confirm).mockRejectedValueOnce(null);
  // ...
});
```

### 3. Clearing Mocks in `beforeEach`

Ensure `vi.clearAllMocks()` is called in `beforeEach` to start every test with a clean slate.

```tsx
beforeEach(() => {
  vi.clearAllMocks();
});
```

## Global Mock Examples

### API Client (`waldur-js-client`)

The entire client is mocked by default in `test/setupTests.js`. Use `vi.mocked()` to provide specific responses.

```tsx
import { customersList } from 'waldur-js-client';

it('displays customers', async () => {
  vi.mocked(customersList).mockResolvedValue({
    data: [{ uuid: '1', name: 'Customer 1' }],
    headers: { 'x-result-count': '1' },
  } as any);

  renderComponent();
  expect(await screen.findByText('Customer 1')).toBeInTheDocument();
});
```

### Modals (`useModal`)

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

### Notifications (`useNotify`)

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

### Workspace Hooks (`@/workspace/hooks`)

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

### Routing (`@uirouter/react`)

Routing is globally mocked. You rarely need to define `vi.mock('@uirouter/react')` locally.

#### Asserting on Navigation

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

#### Mocking State or Parameters

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

#### Using a Real Router

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

### Application Configuration (`@/core/config`)

The `ENV` object is globally mocked. Since Vitest isolates test files, you can safely modify `ENV` at the top level of your test file without affecting other files.

```tsx
import { ENV } from '@/core/config';

// Global configuration for all tests in this file
ENV.plugins.WALDUR_CORE.BRAND_COLOR = '#12B76A';
ENV.FEATURES.project.show_description = true;

describe('MyComponent', () => {
  it('uses configured brand color', () => {
    // ...
  });
});
```

### Icons (`@phosphor-icons/react`)

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

### ❌ Manual `@tanstack/react-query` Mocking

**Avoid**: Manually mocking `useQueryClient` or creating a `new QueryClient()` inside individual tests.
**Better**: Use `renderWithProviders`.

### ❌ Inline Mock Definitions in Components

**Avoid**: Defining mock data or functions directly in the test file's top level if they can be reused or belong in a fixture.
**Better**: Use `src/user/support/fixtures.ts` or similar shared fixture files.

### ❌ Deep Mocking of Internal Implementation

**Avoid**: Mocking internal component state or private methods.
**Better**: Mock the _external dependencies_ and assert on the _observable behavior_ (DOM changes, service calls).

### ❌ Hardcoded Wait Times

**Avoid**: Using `setTimeout` or fixed delays in tests.
**Better**: Use `waitFor()` from `@testing-library/react`.

## Summary Table

| Dependency        | How to Mock / Use                                                                                       |
| :---------------- | :------------------------------------------------------------------------------------------------------ |
| **API Calls**     | `vi.mocked(apiFunction).mockResolvedValue(...)`                                                         |
| **Notifications** | `expect(useNotify().showSuccess).toHaveBeenCalled()`                                                    |
| **Modals**        | `vi.mocked(useModal().confirm).mockResolvedValue(true)`                                                 |
| **React Query**   | Use `renderWithProviders`                                                                               |
| **Translations**  | Handled globally; just use `translate` as normal                                                        |
| **Routing**       | Handled globally; import `router` from `@/router` or hooks from `@uirouter/react` and use `vi.mocked()` |
