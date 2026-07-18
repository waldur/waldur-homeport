import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { createTestWrapper } from '@/test/harness';

import { useManagedMutation } from './useManagedMutation';
const createWrapper = () => createTestWrapper().wrapper;

describe('useManagedMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    expect(useModal().closeDialog).toHaveBeenCalled();
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
    expect(useNotify().showSuccess).toHaveBeenCalledWith(successMessage);
    expect(useModal().closeDialog).toHaveBeenCalled();
  });

  it('shows success description under the title when provided', async () => {
    const mutationFn = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(
      () =>
        useManagedMutation({
          mutationFn,
          successMessage: 'Maintenance started',
          successDescription: 'The maintenance window Demo is now in progress.',
        }),
      { wrapper: createWrapper() },
    );

    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useNotify().showSuccess).toHaveBeenCalledWith(
      'Maintenance started',
      'The maintenance window Demo is now in progress.',
    );
  });

  it('does not close dialog when closeModal is false', async () => {
    const mutationFn = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(
      () => useManagedMutation({ mutationFn, closeModal: false }),
      { wrapper: createWrapper() },
    );

    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(useModal().closeDialog).not.toHaveBeenCalled();
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
    expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
      error,
      errorMessage,
    );
    expect(useModal().closeDialog).not.toHaveBeenCalled();
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
    expect(useNotify().showSuccess).toHaveBeenCalled();
    expect(useModal().closeDialog).toHaveBeenCalled();
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
    expect(useNotify().showErrorResponse).toHaveBeenCalled();
  });

  it('invalidates queries on success', async () => {
    const mutationFn = vi.fn().mockResolvedValue('success');
    const invalidateQueries = [{ queryKey: ['test-query'] }];

    const { wrapper, queryClient } = createTestWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useManagedMutation({ mutationFn, invalidateQueries }),
      { wrapper },
    );

    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith(invalidateQueries[0]);
  });

  it('handles multiple query invalidations', async () => {
    const mutationFn = vi.fn().mockResolvedValue('success');
    const invalidateQueries = [
      { queryKey: ['query-1'] },
      { queryKey: ['query-2'], exact: true },
    ];

    const { wrapper, queryClient } = createTestWrapper();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useManagedMutation({ mutationFn, invalidateQueries }),
      { wrapper },
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
      vi.mocked(useModal().confirm).mockResolvedValueOnce('confirmed-data');
      const { result } = renderHook(
        () => useManagedMutation({ mutationFn, confirmation }),
        { wrapper: createWrapper() },
      );

      result.current.mutate('original-variables');

      await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // When confirmation returns data, it's used as variables
      expect(mutationFn).toHaveBeenCalledWith(
        'confirmed-data',
        expect.anything(),
      );
    });

    it('does not execute mutation when cancelled', async () => {
      const mutationFn = vi.fn().mockResolvedValue('success');
      vi.mocked(useModal().confirm).mockRejectedValueOnce('cancelled');
      const { result } = renderHook(
        () => useManagedMutation({ mutationFn, confirmation }),
        { wrapper: createWrapper() },
      );

      result.current.mutate('test');

      await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
      expect(mutationFn).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);
    });

    it('passes confirmation options to confirm function', async () => {
      const mutationFn = vi.fn().mockResolvedValue('success');
      const options = { forDeletion: true, positiveButton: 'Destroy' };
      vi.mocked(useModal().confirm).mockResolvedValueOnce(undefined);
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
        expect(useModal().confirm).toHaveBeenCalledWith('T', 'B', options),
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
      expect(useModal().closeDialog).toHaveBeenCalled();
    });

    it('handles confirmation in mutateAsync', async () => {
      const mutationFn = vi.fn().mockResolvedValue('async-confirm-success');
      vi.mocked(useModal().confirm).mockResolvedValueOnce(undefined); // Confirmed but no extra data
      const { result } = renderHook(
        () =>
          useManagedMutation({
            mutationFn,
            confirmation: { title: 'T', body: 'B' },
          }),
        { wrapper: createWrapper() },
      );

      const data = await result.current.mutateAsync('async-vars');

      expect(useModal().confirm).toHaveBeenCalled();
      expect(data).toBe('async-confirm-success');
      expect(mutationFn).toHaveBeenCalledWith('async-vars', expect.anything());
    });

    it('returns undefined when confirmation is cancelled in mutateAsync', async () => {
      const mutationFn = vi.fn().mockResolvedValue('success');
      vi.mocked(useModal().confirm).mockRejectedValueOnce('cancelled');
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
