import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { retryServerErrors } from '@/core/queryRetry';

import { useTableQuery } from './useTableQuery';

// The app's default rule, with no delay between attempts.
const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: retryServerErrors(), retryDelay: 0 },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

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
  const { result } = renderHook(
    () => useTableQuery(options(fetchData, retry) as any),
    { wrapper: createWrapper() },
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
