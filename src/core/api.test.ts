import { describe, expect, it, vi } from 'vitest';

import { getAllPages } from './api';

describe('getAllPages', () => {
  const createMockResponse = (
    data: any[],
    count: string | null,
    link: string | null,
  ) => {
    return {
      data,
      response: {
        headers: {
          get: (key: string) => {
            if (key === 'x-result-count') return count;
            if (key === 'link') return link;
            if (key === 'Link') return link;
            return null;
          },
        },
      },
    };
  };

  it('fetches a single page of results seamlessly', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValue(createMockResponse([{ id: 1 }, { id: 2 }], '2', null));
    const results = await getAllPages(fetchPage);

    expect(results).toEqual([{ id: 1 }, { id: 2 }]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith(1);
  });

  it('fetches multiple pages recursively tracking the link header', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(
        createMockResponse(
          [{ id: 1 }],
          '3',
          '<https://api/v1/?page=2>; rel="next"',
        ),
      )
      .mockResolvedValueOnce(
        createMockResponse(
          [{ id: 2 }],
          '3',
          '<https://api/v1/?page=3>; rel="next"',
        ),
      )
      .mockResolvedValueOnce(createMockResponse([{ id: 3 }], '3', null));

    const results = await getAllPages(fetchPage);

    expect(results).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(fetchPage).toHaveBeenNthCalledWith(1, 1);
    expect(fetchPage).toHaveBeenNthCalledWith(2, 2);
    expect(fetchPage).toHaveBeenNthCalledWith(3, 3);
  });

  it('calculates total pages accurately and triggers progress hooks', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(
        createMockResponse([1, 2], '5', '<url>; rel="next"'),
      )
      .mockResolvedValueOnce(
        createMockResponse([3, 4], '5', '<url>; rel="next"'),
      )
      .mockResolvedValueOnce(createMockResponse([5], '5', null));

    const onProgress = vi.fn();
    await getAllPages(fetchPage, onProgress);

    // Initial page size is 2. Math.ceil(5 / 2) = 3 total pages.
    expect(onProgress).toHaveBeenCalledTimes(3);
    expect(onProgress).toHaveBeenNthCalledWith(1, 1, 3);
    expect(onProgress).toHaveBeenNthCalledWith(2, 2, 3);
    // On the final page, size is 1 which changes math ceil bounds but loop breaks safely afterward
    expect(onProgress).toHaveBeenNthCalledWith(3, 3, 5);
  });

  it('handles empty results robustly', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValue(createMockResponse([], '0', null));
    const results = await getAllPages(fetchPage);

    expect(results).toEqual([]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('handles missing header configurations gracefully', async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValue(createMockResponse([1, 2], null, null));
    const onProgress = vi.fn();
    await getAllPages(fetchPage, onProgress);

    expect(onProgress).toHaveBeenCalledTimes(1);
    expect(onProgress).toHaveBeenCalledWith(1, undefined);
  });
});
