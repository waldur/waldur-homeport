import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';

import { createLoadOptions } from './createLoadOptions';

describe('createLoadOptions', () => {
  const originalPageSize = ENV.pageSize;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    ENV.pageSize = 10;
  });

  afterEach(() => {
    ENV.pageSize = originalPageSize;
  });

  it('sends correct parameters to listMethod and calculates hasMore=true', async () => {
    const listMethod = vi.fn().mockResolvedValue({
      data: [{ uuid: '1' }, { uuid: '2' }],
      response: {
        headers: {
          get: (name: string) => (name === 'x-result-count' ? '15' : null),
        },
      },
    });

    const fetcher = createLoadOptions(
      listMethod as any,
      'name',
      { o: 'name' },
      { uuid: '123' },
    );

    const result = await fetcher('test-query', [], { page: 1 });

    expect(listMethod).toHaveBeenCalledWith({
      path: { uuid: '123' },
      query: {
        page: 1,
        page_size: 10,
        o: 'name',
        name: 'test-query',
      },
    });

    expect(result).toEqual({
      options: [{ uuid: '1' }, { uuid: '2' }],
      hasMore: true,
      additional: { page: 2 },
    });
  });

  it('calculates hasMore=false when all items are loaded', async () => {
    const listMethod = vi.fn().mockResolvedValue({
      data: [{ uuid: '1' }, { uuid: '2' }],
      response: {
        headers: {
          get: (name: string) => (name === 'x-result-count' ? '2' : null),
        },
      },
    });

    const fetcher = createLoadOptions(listMethod as any, 'query');
    const result = await fetcher('test-query', [], { page: 1 });

    expect(result.hasMore).toBe(false);
  });

  it('calculates hasMore=false when total items equal current items plus page size', async () => {
    const listMethod = vi.fn().mockResolvedValue({
      data: Array.from({ length: 10 }).map((_, i) => ({ uuid: String(i) })),
      response: {
        headers: {
          get: (name: string) => (name === 'x-result-count' ? '20' : null),
        },
      },
    });

    const fetcher = createLoadOptions(listMethod as any, 'query');
    const prevOptions = Array.from({ length: 10 }).map((_, i) => ({
      uuid: String(i),
    }));
    const result = await fetcher('test-query', prevOptions, { page: 2 });

    expect(result.hasMore).toBe(false);
  });

  it('strips the options key from response data items', async () => {
    const listMethod = vi.fn().mockResolvedValue({
      data: [
        { uuid: '1', name: 'Item 1', options: [{ a: 1 }] },
        { uuid: '2', name: 'Item 2', options: [] },
      ],
      response: {
        headers: {
          get: (name: string) => (name === 'x-result-count' ? '2' : null),
        },
      },
    });

    const fetcher = createLoadOptions(listMethod as any, 'query');
    const result = await fetcher('', [], { page: 1 });

    expect(result.options).toEqual([
      { uuid: '1', name: 'Item 1' },
      { uuid: '2', name: 'Item 2' },
    ]);
  });

  it('does not send search query when searchField is "none"', async () => {
    const listMethod = vi.fn().mockResolvedValue({
      data: [],
      response: {
        headers: {
          get: (name: string) => (name === 'x-result-count' ? '0' : null),
        },
      },
    });

    const fetcher = createLoadOptions(listMethod as any, 'none');
    await fetcher('test-query', [], { page: 1 });

    expect(listMethod).toHaveBeenCalledWith({
      path: {},
      query: {
        page: 1,
        page_size: 10,
      },
    });
  });

  it('handles missing total items by setting hasMore=false', async () => {
    const listMethod = vi.fn().mockResolvedValue({
      data: [{ uuid: '1' }],
      response: {
        headers: {
          get: () => null,
        },
      },
    });

    const fetcher = createLoadOptions(listMethod as any, 'query');
    const result = await fetcher('', [], { page: 1 });

    expect(result.hasMore).toBe(false);
  });

  it('handles network errors by returning prevOptions and stopping pagination', async () => {
    const listMethod = vi.fn().mockRejectedValue(new Error('Network error'));

    const fetcher = createLoadOptions(listMethod as any, 'query');
    const prevOptions = [{ uuid: 'old' }];

    const result = await fetcher('test-query', prevOptions, { page: 3 });

    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalled();
    expect(result).toEqual({
      options: prevOptions,
      hasMore: false,
      additional: { page: 3 },
    });
  });

  it('handles response objects with explicit error property', async () => {
    const listMethod = vi.fn().mockResolvedValue({
      error: new Error('API explicitly returned an error'),
    });

    const fetcher = createLoadOptions(listMethod as any, 'query');
    const result = await fetcher('test-query', [], { page: 1 });

    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalled();
    expect(result.hasMore).toBe(false);
    expect(result.options).toEqual([]);
  });
});
