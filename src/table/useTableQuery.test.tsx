import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { retryServerErrors } from '@/core/queryRetry';
import { createTestQueryClient, renderHookWithProviders } from '@/test/harness';

import { useTableQuery } from './useTableQuery';

// The app's default rule, with no delay between attempts.
const createRetryClient = () =>
  createTestQueryClient({
    defaultOptions: {
      queries: { retry: retryServerErrors(), retryDelay: 0 },
    },
  });

const options = (fetchData, retry?) => ({
  table: 'retry-test',
  fetchData,
  retry,
  currentPage: 1,
  pageSize: 10,
  query: '',
  sorting: { field: null, mode: undefined },
  activeColumns: {},
});

const failingWith = (status: number) =>
  vi.fn(() => Promise.reject({ response: { status }, status }));

const runUntilError = async (fetchData, retry?) => {
  const { result } = renderHookWithProviders(
    () => useTableQuery(options(fetchData, retry) as any),
    { queryClient: createRetryClient() },
  );
  await waitFor(() => expect(result.current.error).toBeTruthy());
};

describe('useTableQuery retry', () => {
  it('retries a server error as often as the table says', async () => {
    const fetchData = failingWith(500);
    await runUntilError(fetchData, retryServerErrors(1));
    expect(fetchData).toHaveBeenCalledTimes(2);
  });

  it('keeps the client default without a table setting', async () => {
    const fetchData = failingWith(500);
    await runUntilError(fetchData);
    expect(fetchData).toHaveBeenCalledTimes(4);
  });

  it('never retries a 4xx, with or without a table setting', async () => {
    const own = failingWith(404);
    await runUntilError(own, retryServerErrors(1));
    expect(own).toHaveBeenCalledTimes(1);

    const fallback = failingWith(403);
    await runUntilError(fallback);
    expect(fallback).toHaveBeenCalledTimes(1);
  });
});

describe('useTableQuery while the next page loads', () => {
  const pending = () => new Promise<never>(() => undefined);
  const page = (name: string) => ({ rows: [{ uuid: name }], resultCount: 2 });

  it("keeps the table's last rows until the next page arrives", async () => {
    let next: (value) => void;
    const fetchData = vi
      .fn()
      .mockResolvedValueOnce(page('first'))
      .mockReturnValueOnce(new Promise((resolve) => (next = resolve)));
    let currentPage = 1;
    const { result, rerender } = renderHookWithProviders(() =>
      useTableQuery({ ...options(fetchData), currentPage } as any),
    );
    await waitFor(() =>
      expect(result.current.data?.rows).toEqual([{ uuid: 'first' }]),
    );

    currentPage = 2;
    rerender();
    await waitFor(() => expect(result.current.isFetching).toBe(true));
    expect(result.current.data?.rows).toEqual([{ uuid: 'first' }]);

    next(page('second'));
    await waitFor(() =>
      expect(result.current.data?.rows).toEqual([{ uuid: 'second' }]),
    );
  });

  it("does not show another table's rows", async () => {
    const fetchData = vi
      .fn()
      .mockResolvedValueOnce(page('first'))
      .mockReturnValueOnce(pending());
    let table = 'one';
    const { result, rerender } = renderHookWithProviders(() =>
      useTableQuery({ ...options(fetchData), table } as any),
    );
    await waitFor(() => expect(result.current.data?.rows).toHaveLength(1));

    table = 'two';
    rerender();
    await waitFor(() => expect(result.current.isFetching).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
