import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useDispatch } from 'react-redux';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { broadcastMessageTemplatesCreate } from 'waldur-js-client';

import { BroadcastTemplateCreateDialog } from './BroadcastTemplateCreateDialog';

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock('waldur-js-client', async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    broadcastMessageTemplatesCreate: vi.fn(),
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('BroadcastTemplateCreateDialog', () => {
  const mockResolve = {
    refetch: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDispatch).mockReturnValue(vi.fn());
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BroadcastTemplateCreateDialog resolve={mockResolve} />
      </QueryClientProvider>,
    );
  };

  it('renders fields and handles submission', async () => {
    vi.mocked(broadcastMessageTemplatesCreate).mockResolvedValue({} as any);
    const { container } = renderComponent();

    expect(screen.getByText('Create a broadcast template')).toBeInTheDocument();

    fireEvent.change(container.querySelector('input[name="name"]')!, {
      target: { value: 'Test Template' },
    });
    fireEvent.change(container.querySelector('input[name="subject"]')!, {
      target: { value: 'Test Subject' },
    });
    fireEvent.change(container.querySelector('textarea[name="body"]')!, {
      target: { value: 'Test Body' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(broadcastMessageTemplatesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            name: 'Test Template',
            subject: 'Test Subject',
            body: 'Test Body',
          },
        }),
      );
    });

    await waitFor(() => {
      expect(mockResolve.refetch).toHaveBeenCalled();
    });
  });

  it('shows validation errors', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getAllByText('This field is required.')).toHaveLength(3);
    });

    expect(broadcastMessageTemplatesCreate).not.toHaveBeenCalled();
  });
});
