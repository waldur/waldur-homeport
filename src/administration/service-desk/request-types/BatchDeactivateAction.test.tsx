import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supportRequestTypesAdminDeactivate } from 'waldur-js-client';

import { useModal } from '@/modal/hooks';

import { BatchDeactivateAction } from './BatchDeactivateAction';

vi.mock('waldur-js-client');
const mockShowSuccess = vi.fn();
const mockShowErrorResponse = vi.fn();
vi.mock('@/store/notify', () => ({
  useNotify: () => ({
    showSuccess: mockShowSuccess,
    showErrorResponse: mockShowErrorResponse,
  }),
}));
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

describe('BatchDeactivateAction', () => {
  const mockRefetch = vi.fn();
  const mockConfirm = vi.fn();

  const rows = [
    { uuid: '1', name: 'Type 1', is_active: false },
    { uuid: '2', name: 'Type 2', is_active: true },
  ] as any;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModal).mockReturnValue({
      confirm: mockConfirm,
      closeDialog: vi.fn(),
    } as any);
  });

  it('performs batch deactivation for active rows', async () => {
    mockConfirm.mockResolvedValue(undefined);
    vi.mocked(supportRequestTypesAdminDeactivate).mockResolvedValue({} as any);

    render(<BatchDeactivateAction rows={rows} refetch={mockRefetch} />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByText('Deactivate'));

    await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
    await waitFor(() => {
      expect(supportRequestTypesAdminDeactivate).toHaveBeenCalledWith(
        expect.objectContaining({ path: { uuid: '2' } }),
      );
    });
    expect(supportRequestTypesAdminDeactivate).not.toHaveBeenCalledWith(
      expect.objectContaining({ path: { uuid: '1' } }),
    );
    await waitFor(() =>
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Request types have been deactivated successfully.',
      ),
    );
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('is disabled when no active rows are selected', () => {
    const inactiveRows = [{ uuid: '1', is_active: false }] as any;
    render(
      <BatchDeactivateAction rows={inactiveRows} refetch={mockRefetch} />,
      {
        wrapper: createWrapper(),
      },
    );

    const button = screen.getByText('Deactivate');
    expect(button).toBeDisabled();
  });

  it('handles partial success', async () => {
    const multiRows = [
      { uuid: '1', name: 'Type 1', is_active: true },
      { uuid: '2', name: 'Type 2', is_active: true },
    ] as any;
    mockConfirm.mockResolvedValue(undefined);
    vi.mocked(supportRequestTypesAdminDeactivate).mockImplementation(
      ({ path }) => {
        if (path.uuid === '1') return Promise.resolve({} as any);
        return Promise.reject(new Error('API Error'));
      },
    );

    render(<BatchDeactivateAction rows={multiRows} refetch={mockRefetch} />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByText('Deactivate'));

    await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
    await waitFor(() => expect(mockRefetch).toHaveBeenCalled());
  });
});
