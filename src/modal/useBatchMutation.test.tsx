import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotify } from '@/store/notify';

import { useModal } from './hooks';
import { useBatchMutation } from './useBatchMutation';

vi.mock('./hooks');
vi.mock('@/store/notify');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useBatchMutation', () => {
  const mockShowSuccess = vi.fn();
  const mockShowErrorResponse = vi.fn();
  const mockConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: mockShowSuccess,
      showErrorResponse: mockShowErrorResponse,
    } as any);
    vi.mocked(useModal).mockReturnValue({
      confirm: mockConfirm,
      closeDialog: vi.fn(),
    } as any);
  });

  const rows = [{ uuid: '1' }, { uuid: '2' }];
  const successMessage = 'Success';
  const renderPartialSuccessMessage = (n) => `${n} succeeded`;
  const errorMessage = 'Error';
  const confirmation = { title: 'T', body: 'B' };

  it('handles successful batch execution', async () => {
    const mutationFn = vi.fn().mockResolvedValue('ok');
    const { result } = renderHook(
      () =>
        useBatchMutation({
          rows,
          mutationFn,
          successMessage,
          renderPartialSuccessMessage,
          errorMessage,
          confirmation,
        }),
      { wrapper: createWrapper() },
    );

    mockConfirm.mockResolvedValue(undefined);
    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mutationFn).toHaveBeenCalledTimes(2);
    expect(mockShowSuccess).toHaveBeenCalledWith(successMessage);
  });

  it('handles partial success with static error message', async () => {
    const error = new Error('Fail');
    const mutationFn = vi
      .fn()
      .mockResolvedValueOnce('ok')
      .mockRejectedValueOnce(error);
    const { result } = renderHook(
      () =>
        useBatchMutation({
          rows,
          mutationFn,
          successMessage,
          renderPartialSuccessMessage,
          errorMessage,
          confirmation,
        }),
      { wrapper: createWrapper() },
    );

    mockConfirm.mockResolvedValue(undefined);
    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockShowSuccess).toHaveBeenCalledWith('1 succeeded');
    expect(mockShowErrorResponse).toHaveBeenCalledWith(error, errorMessage);
  });

  it('handles partial success with dynamic error message', async () => {
    const error = new Error('Fail');
    const mutationFn = vi
      .fn()
      .mockResolvedValueOnce('ok')
      .mockRejectedValueOnce(error);
    const renderErrorMessage = (n) => `${n} failed`;
    const { result } = renderHook(
      () =>
        useBatchMutation({
          rows,
          mutationFn,
          successMessage,
          renderPartialSuccessMessage,
          renderErrorMessage,
          confirmation,
        }),
      { wrapper: createWrapper() },
    );

    mockConfirm.mockResolvedValue(undefined);
    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockShowSuccess).toHaveBeenCalledWith('1 succeeded');
    expect(mockShowErrorResponse).toHaveBeenCalledWith(error, '1 failed');
  });

  it('handles full failure with dynamic error message', async () => {
    const error = new Error('Fail');
    const mutationFn = vi.fn().mockRejectedValue(error);
    const renderErrorMessage = (n) => `${n} failed`;
    const { result } = renderHook(
      () =>
        useBatchMutation({
          rows,
          mutationFn,
          successMessage,
          renderPartialSuccessMessage,
          renderErrorMessage,
          confirmation,
        }),
      { wrapper: createWrapper() },
    );

    mockConfirm.mockResolvedValue(undefined);
    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockShowSuccess).not.toHaveBeenCalled();
    expect(mockShowErrorResponse).toHaveBeenCalledWith(error, '2 failed');
  });

  it('calls refetch on partial success', async () => {
    const mutationFn = vi
      .fn()
      .mockResolvedValueOnce('ok')
      .mockRejectedValueOnce(new Error('Fail'));
    const refetch = vi.fn();
    const { result } = renderHook(
      () =>
        useBatchMutation({
          rows,
          mutationFn,
          refetch,
          successMessage,
          renderPartialSuccessMessage,
          errorMessage,
          confirmation,
        }),
      { wrapper: createWrapper() },
    );

    mockConfirm.mockResolvedValue(undefined);
    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(refetch).toHaveBeenCalled();
  });

  it('does nothing when confirmation is cancelled', async () => {
    const mutationFn = vi.fn();
    const { result } = renderHook(
      () =>
        useBatchMutation({
          rows,
          mutationFn,
          successMessage,
          renderPartialSuccessMessage,
          errorMessage,
          confirmation,
        }),
      { wrapper: createWrapper() },
    );

    mockConfirm.mockRejectedValue('cancelled');
    result.current.mutate(undefined);

    await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
    expect(mutationFn).not.toHaveBeenCalled();
  });

  it('passes variables to mutationFn and dynamic messages', async () => {
    const mutationFn = vi.fn().mockResolvedValue('ok');
    const dynamicSuccessMessage = (vars) => `Moved to ${vars.target}`;
    const dynamicPartialMessage = (n, vars) => `${n} moved to ${vars.target}`;
    const dynamicErrorMessage = (n, vars) =>
      `${n} failed moving to ${vars.target}`;

    const { result } = renderHook(
      () =>
        useBatchMutation({
          rows,
          mutationFn,
          successMessage: dynamicSuccessMessage,
          renderPartialSuccessMessage: dynamicPartialMessage,
          renderErrorMessage: dynamicErrorMessage,
          confirmation,
        }),
      { wrapper: createWrapper() },
    );

    mockConfirm.mockResolvedValue(undefined);
    result.current.mutate({ target: 'Org X' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mutationFn).toHaveBeenCalledWith(rows[0], { target: 'Org X' });
    expect(mockShowSuccess).toHaveBeenCalledWith('Moved to Org X');
  });

  it('handles partial success with dynamic messages and variables', async () => {
    const error = new Error('Fail');
    const mutationFn = vi
      .fn()
      .mockResolvedValueOnce('ok')
      .mockRejectedValueOnce(error);
    const dynamicPartialMessage = (n, vars) => `${n} moved to ${vars.target}`;

    const { result } = renderHook(
      () =>
        useBatchMutation({
          rows,
          mutationFn,
          renderPartialSuccessMessage: dynamicPartialMessage,
          renderErrorMessage: (n, vars) => `${n} failed to ${vars.target}`,
          confirmation,
        }),
      { wrapper: createWrapper() },
    );

    mockConfirm.mockResolvedValue(undefined);
    result.current.mutate({ target: 'Org Y' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockShowSuccess).toHaveBeenCalledWith('1 moved to Org Y');
    expect(mockShowErrorResponse).toHaveBeenCalledWith(
      error,
      '1 failed to Org Y',
    );
  });
});
