import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNotify } from '@/store/notify';

import { useModal } from './hooks';
import { useManagedMutation } from './useManagedMutation';

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

describe('useManagedMutation', () => {
  const mockShowSuccess = vi.fn();
  const mockShowErrorResponse = vi.fn();
  const mockCloseDialog = vi.fn();
  const mockConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNotify).mockReturnValue({
      showSuccess: mockShowSuccess,
      showErrorResponse: mockShowErrorResponse,
    } as any);
    vi.mocked(useModal).mockReturnValue({
      closeDialog: mockCloseDialog,
      confirm: mockConfirm,
      openDialog: vi.fn(),
    } as any);
  });

  it('handles basic mutation success', async () => {
    const mutationFn = vi.fn().mockResolvedValue('success-data');
    const { result } = renderHook(() => useManagedMutation({ mutationFn }), {
      wrapper: createWrapper(),
    });

    result.current.mutate('test-variables');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mutationFn).toHaveBeenCalledWith(
      'test-variables',
      expect.anything(),
    );
    expect(mockCloseDialog).toHaveBeenCalled();
  });

  it('shows success message and closes dialog on success', async () => {
    const mutationFn = vi.fn().mockResolvedValue('success');
    const successMessage = 'All good!';
    const { result } = renderHook(
      () => useManagedMutation({ mutationFn, successMessage }),
      { wrapper: createWrapper() },
    );

    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockShowSuccess).toHaveBeenCalledWith(successMessage);
    expect(mockCloseDialog).toHaveBeenCalled();
  });

  it('does not close dialog when closeModal is false', async () => {
    const mutationFn = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(
      () => useManagedMutation({ mutationFn, closeModal: false }),
      { wrapper: createWrapper() },
    );

    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCloseDialog).not.toHaveBeenCalled();
  });

  it('shows error message on failure', async () => {
    const error = new Error('Failed');
    const mutationFn = vi.fn().mockRejectedValue(error);
    const errorMessage = 'Something went wrong';
    const { result } = renderHook(
      () => useManagedMutation({ mutationFn, errorMessage }),
      { wrapper: createWrapper() },
    );

    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockShowErrorResponse).toHaveBeenCalledWith(error, errorMessage);
    expect(mockCloseDialog).not.toHaveBeenCalled();
  });

  it('calls refetch on success', async () => {
    const mutationFn = vi.fn().mockResolvedValue('success');
    const refetch = vi.fn();
    const { result } = renderHook(
      () => useManagedMutation({ mutationFn, refetch }),
      {
        wrapper: createWrapper(),
      },
    );

    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(refetch).toHaveBeenCalled();
  });

  it('waits for async refetch on success', async () => {
    const mutationFn = vi.fn().mockResolvedValue('success');
    let refetchResolved = false;
    const refetch = vi.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      refetchResolved = true;
    });
    const { result } = renderHook(
      () => useManagedMutation({ mutationFn, refetch }),
      {
        wrapper: createWrapper(),
      },
    );

    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(refetchResolved).toBe(true);
  });

  it('calls onSuccess callback after default actions', async () => {
    const mutationFn = vi.fn().mockResolvedValue('success-data');
    const onSuccess = vi.fn();
    const { result } = renderHook(
      () =>
        useManagedMutation({ mutationFn, successMessage: 'Done', onSuccess }),
      { wrapper: createWrapper() },
    );

    result.current.mutate('vars');

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(onSuccess).toHaveBeenCalledWith(
      'success-data',
      'vars',
      undefined,
      expect.anything(),
    );
    expect(mockShowSuccess).toHaveBeenCalled();
    expect(mockCloseDialog).toHaveBeenCalled();
  });

  it('calls onError callback after default actions', async () => {
    const error = new Error('Failed');
    const mutationFn = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();
    const { result } = renderHook(
      () => useManagedMutation({ mutationFn, errorMessage: 'Oops', onError }),
      { wrapper: createWrapper() },
    );

    result.current.mutate('vars');

    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError).toHaveBeenCalledWith(
      error,
      'vars',
      undefined,
      expect.anything(),
    );
    expect(mockShowErrorResponse).toHaveBeenCalled();
  });

  it('invalidates queries on success', async () => {
    const mutationFn = vi.fn().mockResolvedValue('success');
    const invalidateQueries = [{ queryKey: ['test-query'] }];
    const wrapper = createWrapper();
    // @ts-ignore
    const queryClient = (wrapper({ children: null }) as any).props
      .client as QueryClient;
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderHook(() => useManagedMutation({ mutationFn, invalidateQueries }), {
      wrapper: () => (
        <QueryClientProvider client={queryClient}>{null}</QueryClientProvider>
      ),
    });

    // Manual hook rendering because createWrapper returns a component, not the client
    const { result: hookResult } = renderHook(
      () => useManagedMutation({ mutationFn, invalidateQueries }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      },
    );

    hookResult.current.mutate(undefined);

    await waitFor(() => expect(hookResult.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith(invalidateQueries[0]);
  });

  it('handles multiple query invalidations', async () => {
    const mutationFn = vi.fn().mockResolvedValue('success');
    const invalidateQueries = [
      { queryKey: ['query-1'] },
      { queryKey: ['query-2'], exact: true },
    ];
    const wrapper = createWrapper();
    // @ts-ignore
    const queryClient = (wrapper({ children: null }) as any).props
      .client as QueryClient;
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useManagedMutation({ mutationFn, invalidateQueries }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      },
    );

    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledTimes(2);
    expect(invalidateSpy).toHaveBeenCalledWith(invalidateQueries[0]);
    expect(invalidateSpy).toHaveBeenCalledWith(invalidateQueries[1]);
  });

  describe('confirmation', () => {
    const confirmation = {
      title: 'Confirm',
      body: 'Are you sure?',
    };

    it('executes mutation when confirmed', async () => {
      const mutationFn = vi.fn().mockResolvedValue('success');
      mockConfirm.mockResolvedValue('confirmed-data');
      const { result } = renderHook(
        () => useManagedMutation({ mutationFn, confirmation }),
        { wrapper: createWrapper() },
      );

      result.current.mutate('original-variables');

      await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // When confirmation returns data, it's used as variables
      expect(mutationFn).toHaveBeenCalledWith(
        'confirmed-data',
        expect.anything(),
      );
    });

    it('does not execute mutation when cancelled', async () => {
      const mutationFn = vi.fn().mockResolvedValue('success');
      mockConfirm.mockRejectedValue('cancelled');
      const { result } = renderHook(
        () => useManagedMutation({ mutationFn, confirmation }),
        { wrapper: createWrapper() },
      );

      result.current.mutate('test');

      await waitFor(() => expect(mockConfirm).toHaveBeenCalled());
      expect(mutationFn).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);
    });

    it('passes confirmation options to confirm function', async () => {
      const mutationFn = vi.fn().mockResolvedValue('success');
      const options = { forDeletion: true, positiveButton: 'Destroy' };
      mockConfirm.mockResolvedValue(undefined);
      const { result } = renderHook(
        () =>
          useManagedMutation({
            mutationFn,
            confirmation: { title: 'T', body: 'B', options },
          }),
        { wrapper: createWrapper() },
      );

      result.current.mutate('vars');

      await waitFor(() =>
        expect(mockConfirm).toHaveBeenCalledWith('T', 'B', options),
      );
    });
  });

  describe('mutateAsync', () => {
    it('returns promise and handles success', async () => {
      const mutationFn = vi.fn().mockResolvedValue('async-success');
      const { result } = renderHook(() => useManagedMutation({ mutationFn }), {
        wrapper: createWrapper(),
      });

      const data = await result.current.mutateAsync('async-test');

      expect(data).toBe('async-success');
      expect(mutationFn).toHaveBeenCalledWith('async-test', expect.anything());
      expect(mockCloseDialog).toHaveBeenCalled();
    });

    it('handles confirmation in mutateAsync', async () => {
      const mutationFn = vi.fn().mockResolvedValue('async-confirm-success');
      mockConfirm.mockResolvedValue(undefined); // Confirmed but no extra data
      const { result } = renderHook(
        () =>
          useManagedMutation({
            mutationFn,
            confirmation: { title: 'T', body: 'B' },
          }),
        { wrapper: createWrapper() },
      );

      const data = await result.current.mutateAsync('async-vars');

      expect(mockConfirm).toHaveBeenCalled();
      expect(data).toBe('async-confirm-success');
      expect(mutationFn).toHaveBeenCalledWith('async-vars', expect.anything());
    });

    it('returns undefined when confirmation is cancelled in mutateAsync', async () => {
      const mutationFn = vi.fn().mockResolvedValue('success');
      mockConfirm.mockRejectedValue('cancelled');
      const { result } = renderHook(
        () =>
          useManagedMutation({
            mutationFn,
            confirmation: { title: 'T', body: 'B' },
          }),
        { wrapper: createWrapper() },
      );

      const data = await result.current.mutateAsync('vars');

      expect(data).toBeUndefined();
      expect(mutationFn).not.toHaveBeenCalled();
    });
  });
});
