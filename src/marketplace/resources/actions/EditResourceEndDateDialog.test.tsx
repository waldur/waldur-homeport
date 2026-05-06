import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { EditResourceEndDateDialog } from './EditResourceEndDateDialog';

vi.mock('@/store/notify');
vi.mock('@/modal/actions');
vi.mock('@/i18n', () => ({
  translate: vi.fn((str, context) => {
    if (context) {
      return Object.entries(context).reduce(
        (acc, [key, value]) => acc.replace(`{${key}}`, String(value)),
        str,
      );
    }
    return str;
  }),
}));

// Mock DateField to avoid Flatpickr complexity in tests
vi.mock('@/form/DateField', () => ({
  DateField: ({ input, label }) => (
    <input
      aria-label={label}
      name={input.name}
      value={input.value || ''}
      onChange={(e) => input.onChange(e.target.value)}
      onBlur={input.onBlur}
    />
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('EditResourceEndDateDialog', () => {
  const mockShowSuccess = vi.fn();
  const mockShowErrorResponse = vi.fn();
  const mockCloseDialog = vi.fn();

  const resource = {
    uuid: 'res-uuid',
    name: 'Test Resource',
    end_date: '2026-10-01',
    project_end_date: '2026-12-01',
  };

  const resolve = {
    resource: resource as any,
    refetch: vi.fn(),
    updateEndDate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: mockShowSuccess,
      showErrorResponse: mockShowErrorResponse,
    } as any);
    vi.mocked(useModal).mockReturnValue({
      closeDialog: mockCloseDialog,
    } as any);
  });

  const renderComponent = () =>
    render(<EditResourceEndDateDialog resolve={resolve} />, {
      wrapper: createWrapper(),
    });

  it('renders correctly with initial values', () => {
    renderComponent();
    expect(screen.getByLabelText('Termination date')).toHaveValue('2026-10-01');
  });

  it('handles date conflicts and resolution', async () => {
    renderComponent();

    const input = screen.getByLabelText('Termination date');

    // 1. Trigger conflict
    fireEvent.change(input, { target: { value: '2027-01-01' } });
    await waitFor(() => {
      expect(screen.queryByText('Date conflict')).toBeInTheDocument();
    });

    // 2. Resolve conflict
    const useProjectDateBtn = screen.getByText('Use project date');
    fireEvent.click(useProjectDateBtn);
    await waitFor(() => {
      expect(input).toHaveValue('2026-12-01');
    });
    expect(screen.queryByText('Date conflict')).not.toBeInTheDocument();
  });

  it('submits the form successfully', async () => {
    resolve.updateEndDate.mockResolvedValue({ data: {} });
    renderComponent();

    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(resolve.updateEndDate).toHaveBeenCalledWith(
        'res-uuid',
        '2026-10-01',
      );
    });

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalled();
    });
    expect(mockCloseDialog).toHaveBeenCalled();
  });

  it('handles clearing the date', async () => {
    renderComponent();
    const input = screen.getByLabelText('Termination date');

    fireEvent.change(input, { target: { value: '' } });

    const saveBtn = screen.getByText('Save');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(resolve.updateEndDate).toHaveBeenCalledWith('res-uuid', null);
    });
  });

  it('does not show conflict warning if project has no end date', () => {
    const resourceNoProjectEnd = { ...resource, project_end_date: null };
    render(
      <EditResourceEndDateDialog
        resolve={{ ...resolve, resource: resourceNoProjectEnd as any }}
      />,
      {
        wrapper: createWrapper(),
      },
    );

    const input = screen.getByLabelText('Termination date');
    fireEvent.change(input, { target: { value: '2027-01-01' } });

    expect(screen.queryByText('Date conflict')).not.toBeInTheDocument();
  });

  it('does not show conflict if termination date equals project end date', () => {
    renderComponent();
    const input = screen.getByLabelText('Termination date');

    fireEvent.change(input, { target: { value: '2026-12-01' } });

    expect(screen.queryByText('Date conflict')).not.toBeInTheDocument();
  });

  it('handles API errors during submission', async () => {
    const error = new Error('API Error');
    resolve.updateEndDate.mockRejectedValue(error);
    renderComponent();

    const saveBtn = screen.getByText('Save');
    // We use fireEvent.click, which triggers onSubmit.
    // Since mutateAsync rejects, we might need to wait for the rejection to be handled.
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockShowErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to edit resource.',
      );
    });
  });
});
