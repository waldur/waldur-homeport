import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockListResponse } from '@/test/utils';

import { createLoadOptions } from './createLoadOptions';

describe('createLoadOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('sends correct parameters to listMethod and calculates hasMore=true', async () => {
    const listMethod = vi
      .fn()
      .mockResolvedValue(mockListResponse([{ uuid: '1' }, { uuid: '2' }], 15));

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
    const listMethod = vi
      .fn()
      .mockResolvedValue(mockListResponse([{ uuid: '1' }, { uuid: '2' }]));

    const fetcher = createLoadOptions(listMethod as any, 'query');
    const result = await fetcher('test-query', [], { page: 1 });

    expect(result.hasMore).toBe(false);
  });

  it('calculates hasMore=false when total items equal current items plus page size', async () => {
    const listMethod = vi.fn().mockResolvedValue(
      mockListResponse(
        Array.from({ length: 10 }).map((_, i) => ({ uuid: String(i) })),
        20,
      ),
    );

    const fetcher = createLoadOptions(listMethod as any, 'query');
    const prevOptions = Array.from({ length: 10 }).map((_, i) => ({
      uuid: String(i),
    }));
    const result = await fetcher('test-query', prevOptions, { page: 2 });

    expect(result.hasMore).toBe(false);
  });

  it('handles network errors', async () => {
    const listMethod = vi.fn().mockRejectedValue('Network Error');
    const fetcher = createLoadOptions(listMethod as any, 'query');

    const result = await fetcher('test-query', [{ uuid: '1' }], { page: 1 });

    expect(result).toEqual({
      options: [{ uuid: '1' }],
      hasMore: false,
      additional: { page: 1 },
    });
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledWith('Network Error');
  });

  it('handles response errors', async () => {
    const listMethod = vi.fn().mockResolvedValue({ error: 'API Error' });
    const fetcher = createLoadOptions(listMethod as any, 'query');

    const result = await fetcher('test-query', [{ uuid: '1' }], { page: 1 });

    expect(result).toEqual({
      options: [{ uuid: '1' }],
      hasMore: false,
      additional: { page: 1 },
    });
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledWith('API Error');
  });

  it('supports "none" search field for local filtering', async () => {
    const listMethod = vi
      .fn()
      .mockResolvedValue(mockListResponse([{ uuid: '1' }]));
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

  it('strips "options" field from items', async () => {
    const listMethod = vi
      .fn()
      .mockResolvedValue(
        mockListResponse([{ uuid: '1', name: 'Item 1', options: ['A', 'B'] }]),
      );
    const fetcher = createLoadOptions(listMethod as any, 'name');

    const result = await fetcher('', [], { page: 1 });

    expect(result.options[0]).toEqual({ uuid: '1', name: 'Item 1' });
    expect(result.options[0]).not.toHaveProperty('options');
  });

  it('handles missing x-result-count header', async () => {
    const listMethod = vi.fn().mockResolvedValue({
      data: [{ uuid: '1' }],
      response: { headers: { get: () => null } },
    });
    const fetcher = createLoadOptions(listMethod as any, 'name');

    const result = await fetcher('', [], { page: 1 });

    expect(result.hasMore).toBe(false);
  });
});
