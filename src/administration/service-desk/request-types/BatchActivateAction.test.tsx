import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supportRequestTypesAdminActivate } from 'waldur-js-client';

import { useModal } from '@/modal/actions';

import { BatchActivateAction } from './BatchActivateAction';

vi.mock('waldur-js-client');
const mockShowSuccess = vi.fn();
const mockShowErrorResponse = vi.fn();
vi.mock('@/store/notify', () => ({
  useNotify: () => ({
    showSuccess: mockShowSuccess,
    showErrorResponse: mockShowErrorResponse,
  }),
}));
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

describe('BatchActivateAction', () => {
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

  it('performs batch activation for inactive rows', async () => {
    mockConfirm.mockResolvedValue(undefined);
    vi.mocked(supportRequestTypesAdminActivate).mockResolvedValue({} as any);

    render(<BatchActivateAction rows={rows} refetch={mockRefetch} />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByText('Activate'));

    await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
    await waitFor(() => {
      expect(supportRequestTypesAdminActivate).toHaveBeenCalledWith(
        expect.objectContaining({ path: { uuid: '1' } }),
      );
    });
    expect(supportRequestTypesAdminActivate).not.toHaveBeenCalledWith(
      expect.objectContaining({ path: { uuid: '2' } }),
    );
    await waitFor(() =>
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Request types have been activated successfully.',
      ),
    );
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('is disabled when no inactive rows are selected', () => {
    const activeRows = [{ uuid: '1', is_active: true }] as any;
    render(<BatchActivateAction rows={activeRows} refetch={mockRefetch} />, {
      wrapper: createWrapper(),
    });

    const button = screen.getByText('Activate');
    expect(button).toBeDisabled();
  });

  it('handles partial success', async () => {
    const multiRows = [
      { uuid: '1', name: 'Type 1', is_active: false },
      { uuid: '2', name: 'Type 2', is_active: false },
    ] as any;
    mockConfirm.mockResolvedValue(undefined);
    vi.mocked(supportRequestTypesAdminActivate).mockImplementation(
      ({ path }) => {
        if (path.uuid === '1') return Promise.resolve({} as any);
        return Promise.reject(new Error('API Error'));
      },
    );

    render(<BatchActivateAction rows={multiRows} refetch={mockRefetch} />, {
      wrapper: createWrapper(),
    });

    fireEvent.click(screen.getByText('Activate'));

    await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
    await waitFor(() => expect(mockRefetch).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockShowSuccess).toHaveBeenCalledWith(
        '1 request types have been activated successfully.',
      ),
    );
  });
});
