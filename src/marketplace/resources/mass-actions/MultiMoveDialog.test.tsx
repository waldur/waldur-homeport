import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Field } from 'react-final-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesMoveResource } from 'waldur-js-client';

import { MultiMoveDialog } from './MultiMoveDialog';

// Mock waldur-js-client
vi.mock('waldur-js-client');

// Mock MoveToProjectAutocomplete to avoid dealing with AsyncSelect complexity in unit tests
vi.mock('../actions/MoveToProjectAutocomplete', () => ({
  MoveToProjectAutocomplete: ({ isDisabled }) => (
    <Field name="project">
      {({ input }) => (
        <select
          name={input.name}
          value={input.value?.url || ''}
          onChange={(e) => input.onChange({ url: e.target.value })}
          disabled={isDisabled}
        >
          <option value="">Select project...</option>
          <option value="project-url-1">Project 1</option>
        </select>
      )}
    </Field>
  ),
}));

// Mock i18n

// Mock notify
vi.mock('@/store/notify', () => ({
  useNotify: vi.fn().mockReturnValue({
    showErrorResponse: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderComponent = (props) => {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MultiMoveDialog {...props} />
    </QueryClientProvider>,
  );
};

const mockRows = [
  { uuid: 'resource-1', name: 'Resource 1' },
  { uuid: 'resource-2', name: 'Resource 2' },
] as any;

describe('MultiMoveDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dialog correctly', () => {
    renderComponent({
      resolve: { rows: mockRows, refetch: vi.fn() },
    });

    expect(screen.getByText('Mass move resources')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('calls marketplaceResourcesMoveResource for each resource on submit', async () => {
    const refetch = vi.fn();
    vi.mocked(marketplaceResourcesMoveResource).mockResolvedValue({
      data: {},
    } as any);

    renderComponent({
      resolve: { rows: mockRows, refetch },
    });

    // Select project
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'project-url-1' },
    });

    // Click Save
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(marketplaceResourcesMoveResource).toHaveBeenCalledTimes(2);
      expect(marketplaceResourcesMoveResource).toHaveBeenCalledWith({
        path: { uuid: 'resource-1' },
        body: { project: { url: 'project-url-1' } },
      });
      expect(marketplaceResourcesMoveResource).toHaveBeenCalledWith({
        path: { uuid: 'resource-2' },
        body: { project: { url: 'project-url-1' } },
      });
    });

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
    });
  });
});
