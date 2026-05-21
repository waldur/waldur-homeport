# Unit Test Template (Vitest + RTL)

Use this template as a starting point for testing React components, especially Dialogs and Forms.

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 1. Mock external dependencies
vi.mock('waldur-js-client');
vi.mock('@/i18n', () => ({
  translate: (message: string) => message,
}));

// 2. Define mock data and handlers
const mockData = { id: 1, name: 'Test Item' };
const mockHandler = vi.fn();

describe('MyComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<MyComponent data={mockData} onAction={mockHandler} />);
    
    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
  });

  it('triggers action on button click', async () => {
    render(<MyComponent data={mockData} onAction={mockHandler} />);
    
    const button = screen.getByRole('button', { name: /action/i });
    await userEvent.click(button);
    
    expect(mockHandler).toHaveBeenCalledWith(mockData);
  });

  it('handles loading state during form submission', async () => {
    // Mock a pending promise
    const slowAction = new Promise((resolve) => setTimeout(() => resolve({}), 100));
    const mockSubmit = vi.fn().mockReturnValue(slowAction);
    
    render(<MyForm onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);
    
    // Button should be disabled during submission
    expect(submitButton).toBeDisabled();
    
    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });
  });
});
```

## Key Best Practices

1.  **Use `userEvent`**: Prefer `userEvent.click()` over `fireEvent.click()` as it more accurately simulates user interaction.
2.  **Role-based Queries**: Use `getByRole`, `getByLabelText`, etc., to ensure components are accessible.
3.  **Wait for Changes**: Use `waitFor` or `findBy*` queries when dealing with async updates or state changes.
4.  **Clear Mocks**: Always call `vi.clearAllMocks()` in `beforeEach` to prevent test interference.
5.  **Mock Minimal**: Only mock the modules that are actually imported and used by the component under test.
