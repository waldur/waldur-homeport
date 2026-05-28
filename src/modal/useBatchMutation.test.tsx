import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { createTestWrapper } from '@/test/harness';

import { useBatchMutation } from './useBatchMutation';
const createWrapper = () => createTestWrapper().wrapper;

describe('useBatchMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    vi.mocked(useModal().confirm).mockResolvedValueOnce(undefined);
    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mutationFn).toHaveBeenCalledTimes(2);
    expect(useNotify().showSuccess).toHaveBeenCalledWith(successMessage);
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

    vi.mocked(useModal().confirm).mockResolvedValueOnce(undefined);
    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useNotify().showSuccess).toHaveBeenCalledWith('1 succeeded');
    expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
      error,
      errorMessage,
    );
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

    vi.mocked(useModal().confirm).mockResolvedValueOnce(undefined);
    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useNotify().showSuccess).toHaveBeenCalledWith('1 succeeded');
    expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
      error,
      '1 failed',
    );
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

    vi.mocked(useModal().confirm).mockResolvedValueOnce(undefined);
    result.current.mutate(undefined);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useNotify().showSuccess).not.toHaveBeenCalled();
    expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
      error,
      '2 failed',
    );
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

    vi.mocked(useModal().confirm).mockResolvedValueOnce(undefined);
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

    vi.mocked(useModal().confirm).mockRejectedValueOnce('cancelled');
    result.current.mutate(undefined);

    await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
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

    vi.mocked(useModal().confirm).mockResolvedValueOnce(undefined);
    result.current.mutate({ target: 'Org X' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mutationFn).toHaveBeenCalledWith(rows[0], { target: 'Org X' });
    expect(useNotify().showSuccess).toHaveBeenCalledWith('Moved to Org X');
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

    vi.mocked(useModal().confirm).mockResolvedValueOnce(undefined);
    result.current.mutate({ target: 'Org Y' });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useNotify().showSuccess).toHaveBeenCalledWith('1 moved to Org Y');
    expect(useNotify().showErrorResponse).toHaveBeenCalledWith(
      error,
      '1 failed to Org Y',
    );
  });
});
