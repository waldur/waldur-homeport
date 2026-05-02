import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supportRequestTypesAdminDestroy } from 'waldur-js-client';

import { useModal } from '@/modal/hooks';
import { useNotify } from '@/store/notify';

import { BatchDeleteAction } from './BatchDeleteAction';

vi.mock('waldur-js-client');
vi.mock('@/store/notify');
vi.mock('@/modal/hooks');
vi.mock('@/i18n', () => ({
  translate: (key, context) => {
    if (!context) return key;
    let result = key;
    Object.keys(context).forEach((k) => {
      result = result.replace(`{${k}}`, context[k]);
    });
    return result;
  },
  formatJsxTemplate: (key) => key,
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
  const mockShowSuccess = vi.fn();
  const mockConfirm = vi.fn();

  const rows = [
    { uuid: '1', name: 'Type 1', is_synced: false },
    { uuid: '2', name: 'Type 2', is_synced: true },
  ] as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: mockShowSuccess,
    } as any);
    vi.mocked(useModal).mockReturnValue({
      confirm: mockConfirm,
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
