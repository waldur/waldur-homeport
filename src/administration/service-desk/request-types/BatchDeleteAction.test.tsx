import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supportRequestTypesAdminDestroy } from 'waldur-js-client';

import { useModal } from '@/modal/actions';

import { BatchDeleteAction } from './BatchDeleteAction';

vi.mock('waldur-js-client');
const mockShowSuccess = vi.fn();
const mockShowErrorResponse = vi.fn();
vi.mock('@/store/notify', () => ({
  useNotify: () => ({
    showSuccess: mockShowSuccess,
    showErrorResponse: mockShowErrorResponse,
  }),
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

describe('BatchDeleteAction', () => {
  const mockRefetch = vi.fn();
  const mockConfirm = vi.fn();

  const rows = [
    { uuid: '1', name: 'Type 1', is_synced: false },
    { uuid: '2', name: 'Type 2', is_synced: true },
  ] as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModal).mockReturnValue({
      confirm: mockConfirm,
      closeDialog: vi.fn(),
    } as any);
  });

  it('performs batch deletion for all selected rows', async () => {
    mockConfirm.mockResolvedValue(undefined);
    vi.mocked(supportRequestTypesAdminDestroy).mockResolvedValue({} as any);

    render(<BatchDeleteAction rows={rows} refetch={mockRefetch} />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
    await waitFor(() => {
      expect(supportRequestTypesAdminDestroy).toHaveBeenCalledTimes(2);
    });
    await waitFor(() =>
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Request types have been deleted successfully.',
      ),
    );
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('is disabled when no rows are selected', () => {
    render(<BatchDeleteAction rows={[]} refetch={mockRefetch} />, {
      wrapper: createWrapper(),
    });

    const button = screen.getByText('Delete');
    expect(button).toBeDisabled();
  });

  it('handles partial success', async () => {
    const multiRows = [
      { uuid: '1', name: 'Type 1', is_synced: false },
      { uuid: '2', name: 'Type 2', is_synced: false },
    ] as any;
    mockConfirm.mockResolvedValue(undefined);
    vi.mocked(supportRequestTypesAdminDestroy).mockImplementation(
      ({ path }) => {
        if (path.uuid === '1') return Promise.resolve({} as any);
        return Promise.reject(new Error('API Error'));
      },
    );

    render(<BatchDeleteAction rows={multiRows} refetch={mockRefetch} />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
    await waitFor(() => expect(mockRefetch).toHaveBeenCalled());
  });
});
