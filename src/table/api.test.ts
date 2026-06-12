import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/core/queryClient', () => ({
  queryClient: {
    fetchQuery: vi.fn(),
  },
}));

vi.mock('@/core/api', () => ({
  fetchResultCount: vi.fn(),
  parseNextPage: vi.fn(),
}));

import { fetchResultCount, parseNextPage } from '@/core/api';
import { queryClient } from '@/core/queryClient';

import {
  processApiResponse,
  createFetcher,
  createClientPaginatedFetcher,
  fetchAll,
} from './api';

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processApiResponse', () => {
    const createMockResult = (
      data: any[],
      contentType = 'application/json',
    ) => ({
      response: {
        headers: {
          get: vi.fn(() => contentType),
        },
      },
      data,
    });

    it('processes JSON response correctly', () => {
      const mockData = [{ uuid: '1', name: 'Test' }];
      const result = createMockResult(mockData);

      vi.mocked(fetchResultCount).mockReturnValue(1);
      vi.mocked(parseNextPage).mockReturnValue(null);

      const processed = processApiResponse(result as any);

      expect(processed.rows).toEqual(mockData);
      expect(processed.resultCount).toBe(1);
      expect(processed.nextPage).toBeNull();
    });

    it('applies custom parser when provided', () => {
      const mockData = [{ id: '1', title: 'Test' }];
      const result = createMockResult(mockData);
      const parser = vi.fn((data) =>
        data.map((item) => ({ ...item, parsed: true })),
      );

      vi.mocked(fetchResultCount).mockReturnValue(1);
      vi.mocked(parseNextPage).mockReturnValue(null);

      const processed = processApiResponse(result as any, parser);

      expect(parser).toHaveBeenCalledWith(mockData, undefined);
      expect(processed.rows).toEqual([
        { id: '1', title: 'Test', parsed: true },
      ]);
    });

    it('passes query to parser', () => {
      const mockData = [{ uuid: '1' }];
      const result = createMockResult(mockData);
      const parser = vi.fn((data) => data);
      const query = { status: 'active' };

      vi.mocked(fetchResultCount).mockReturnValue(1);
      vi.mocked(parseNextPage).mockReturnValue(null);

      processApiResponse(result as any, parser, query);

      expect(parser).toHaveBeenCalledWith(mockData, query);
    });

    it('throws error for non-JSON content type', () => {
      const result = createMockResult([], 'text/html');

      expect(() => processApiResponse(result as any)).toThrow(
        'Unexpected response content type',
      );
    });

    it('handles content-type with charset', () => {
      const mockData = [{ uuid: '1' }];
      const result = createMockResult(
        mockData,
        'application/json; charset=utf-8',
      );

      vi.mocked(fetchResultCount).mockReturnValue(1);
      vi.mocked(parseNextPage).mockReturnValue(null);

      const processed = processApiResponse(result as any);

      expect(processed.rows).toEqual(mockData);
    });

    it('returns nextPage from parseNextPage', () => {
      const mockData = [{ uuid: '1' }];
      const result = createMockResult(mockData);

      vi.mocked(fetchResultCount).mockReturnValue(100);
      vi.mocked(parseNextPage).mockReturnValue(2);

      const processed = processApiResponse(result as any);

      expect(processed.nextPage).toBe(2);
    });
  });

  describe('createFetcher', () => {
    const mockSdkFunction = vi.fn();

    beforeEach(() => {
      mockSdkFunction.mockReset();
      vi.mocked(queryClient.fetchQuery).mockReset();
    });

    it('creates a fetcher function', () => {
      const fetcher = createFetcher(mockSdkFunction);

      expect(typeof fetcher).toBe('function');
    });

    it('calls queryClient.fetchQuery with correct queryKey', async () => {
      vi.mocked(queryClient.fetchQuery).mockResolvedValue({
        rows: [],
        resultCount: 0,
        nextPage: null,
      });

      const fetcher = createFetcher(mockSdkFunction);

      await fetcher({
        tableKey: 'TestTable',
        currentPage: 1,
        pageSize: 10,
        filter: {},
      });

      expect(queryClient.fetchQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: [
            'table',
            'TestTable',
            undefined,
            { page: 1, page_size: 10 },
          ],
        }),
      );
    });

    it('merges filter params into query', async () => {
      vi.mocked(queryClient.fetchQuery).mockResolvedValue({
        rows: [],
        resultCount: 0,
        nextPage: null,
      });

      const fetcher = createFetcher(mockSdkFunction);

      await fetcher({
        tableKey: 'TestTable',
        currentPage: 1,
        pageSize: 10,
        filter: { status: 'active', type: 'user' },
      });

      expect(queryClient.fetchQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: [
            'table',
            'TestTable',
            undefined,
            { page: 1, page_size: 10, status: 'active', type: 'user' },
          ],
        }),
      );
    });

    it('includes path params in queryKey', async () => {
      vi.mocked(queryClient.fetchQuery).mockResolvedValue({
        rows: [],
        resultCount: 0,
        nextPage: null,
      });

      const fetcher = createFetcher(mockSdkFunction, {
        path: { organization_uuid: 'org-123' },
      });

      await fetcher({
        tableKey: 'TestTable',
        currentPage: 1,
        pageSize: 10,
        filter: {},
      });

      expect(queryClient.fetchQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: [
            'table',
            'TestTable',
            { organization_uuid: 'org-123' },
            { page: 1, page_size: 10 },
          ],
        }),
      );
    });

    it('merges options query params', async () => {
      vi.mocked(queryClient.fetchQuery).mockResolvedValue({
        rows: [],
        resultCount: 0,
        nextPage: null,
      });

      const fetcher = createFetcher(mockSdkFunction, {
        query: { is_active: true },
      });

      await fetcher({
        tableKey: 'TestTable',
        currentPage: 1,
        pageSize: 10,
        filter: { status: 'pending' },
      });

      expect(queryClient.fetchQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: [
            'table',
            'TestTable',
            undefined,
            { page: 1, page_size: 10, status: 'pending', is_active: true },
          ],
        }),
      );
    });

    it('request params override options params', async () => {
      vi.mocked(queryClient.fetchQuery).mockResolvedValue({
        rows: [],
        resultCount: 0,
        nextPage: null,
      });

      const fetcher = createFetcher(mockSdkFunction, {
        query: { status: 'default' },
      });

      await fetcher({
        tableKey: 'TestTable',
        currentPage: 1,
        pageSize: 10,
        filter: {},
        options: { params: { status: 'override' } },
      });

      expect(queryClient.fetchQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: [
            'table',
            'TestTable',
            undefined,
            { page: 1, page_size: 10, status: 'override' },
          ],
        }),
      );
    });

    it('passes staleTime to queryClient', async () => {
      vi.mocked(queryClient.fetchQuery).mockResolvedValue({
        rows: [],
        resultCount: 0,
        nextPage: null,
      });

      const fetcher = createFetcher(mockSdkFunction);

      await fetcher({
        tableKey: 'TestTable',
        currentPage: 1,
        pageSize: 10,
        filter: {},
        options: { staleTime: 5000 },
      });

      expect(queryClient.fetchQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          staleTime: 5000,
        }),
      );
    });
  });

  describe('fetchAll', () => {
    it('fetches single page when no nextPage', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        rows: [{ uuid: '1' }, { uuid: '2' }],
        nextPage: null,
      });

      const result = await fetchAll(mockFetch, {
        tableKey: 'TestTable',
        currentPage: 1,
        pageSize: 10,
        filter: {},
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual([{ uuid: '1' }, { uuid: '2' }]);
    });

    it('fetches multiple pages until no nextPage', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          rows: [{ uuid: '1' }],
          nextPage: 2,
        })
        .mockResolvedValueOnce({
          rows: [{ uuid: '2' }],
          nextPage: 3,
        })
        .mockResolvedValueOnce({
          rows: [{ uuid: '3' }],
          nextPage: null,
        });

      const request = {
        tableKey: 'TestTable',
        currentPage: 1,
        pageSize: 10,
        filter: {},
      };

      const result = await fetchAll(mockFetch, request);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result).toEqual([{ uuid: '1' }, { uuid: '2' }, { uuid: '3' }]);
    });

    it('updates currentPage for subsequent fetches', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          rows: [{ uuid: '1' }],
          nextPage: 2,
        })
        .mockResolvedValueOnce({
          rows: [{ uuid: '2' }],
          nextPage: null,
        });

      const request = {
        tableKey: 'TestTable',
        currentPage: 1,
        pageSize: 10,
        filter: {},
      };

      await fetchAll(mockFetch, request);

      // After fetchAll, request.currentPage should be updated to the last page
      expect(request.currentPage).toBe(2);
    });

    it('handles empty rows', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        rows: [],
        nextPage: null,
      });

      const result = await fetchAll(mockFetch, {
        tableKey: 'TestTable',
        currentPage: 1,
        pageSize: 10,
        filter: {},
      });

      expect(result).toEqual([]);
    });

    it('concatenates rows from all pages', async () => {
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce({
          rows: [{ uuid: '1' }, { uuid: '2' }],
          nextPage: 2,
        })
        .mockResolvedValueOnce({
          rows: [{ uuid: '3' }, { uuid: '4' }, { uuid: '5' }],
          nextPage: null,
        });

      const result = await fetchAll(mockFetch, {
        tableKey: 'TestTable',
        currentPage: 1,
        pageSize: 2,
        filter: {},
      });

      expect(result).toHaveLength(5);
      expect(result.map((r) => r.uuid)).toEqual(['1', '2', '3', '4', '5']);
    });
  });

  describe('createClientPaginatedFetcher', () => {
    const items = Array.from({ length: 25 }, (_, i) => ({
      uuid: `${i + 1}`,
      name: `item-${String(i + 1).padStart(2, '0')}`,
      size: i + 1,
    }));

    const makeRequest = (overrides = {}) => ({
      tableKey: 'TestTable',
      currentPage: 1,
      pageSize: 10,
      filter: {},
      ...overrides,
    });

    it('returns the requested page slice with full result count', async () => {
      const fetcher = createClientPaginatedFetcher(items);

      const page1 = await fetcher(makeRequest());
      expect(page1.rows).toHaveLength(10);
      expect(page1.rows[0].uuid).toBe('1');
      expect(page1.resultCount).toBe(25);
      expect(page1.nextPage).toBe(2);

      const page3 = await fetcher(makeRequest({ currentPage: 3 }));
      expect(page3.rows).toHaveLength(5);
      expect(page3.rows[0].uuid).toBe('21');
      expect(page3.nextPage).toBeNull();
    });

    it('defaults to page 1 and page size 10', async () => {
      const fetcher = createClientPaginatedFetcher(items);

      const result = await fetcher(
        makeRequest({ currentPage: undefined, pageSize: undefined }),
      );

      expect(result.rows).toHaveLength(10);
      expect(result.rows[0].uuid).toBe('1');
    });

    it('resolves an empty first page for empty data', async () => {
      const fetcher = createClientPaginatedFetcher([]);

      const result = await fetcher(makeRequest());

      expect(result.rows).toEqual([]);
      expect(result.resultCount).toBe(0);
      expect(result.nextPage).toBeNull();
    });

    it('rejects with "Invalid page." when the page is out of range', async () => {
      // Pagination state persists in Redux per table key, so a shrunken
      // dataset can request a page past the end. The rejection shape must
      // match the DRF error so useTableQuery resets pagination.
      const fetcher = createClientPaginatedFetcher(items.slice(0, 4));

      await expect(fetcher(makeRequest({ currentPage: 3 }))).rejects.toThrow(
        'Invalid page.',
      );
      await expect(
        fetcher(makeRequest({ currentPage: 3 })),
      ).rejects.toMatchObject({ detail: 'Invalid page.' });
    });

    it('rejects when the page is out of range for empty data', async () => {
      const fetcher = createClientPaginatedFetcher([]);

      await expect(
        fetcher(makeRequest({ currentPage: 2 })),
      ).rejects.toMatchObject({ detail: 'Invalid page.' });
    });

    it('sorts by the ordering filter before slicing', async () => {
      const fetcher = createClientPaginatedFetcher(items);

      const desc = await fetcher(makeRequest({ filter: { o: '-size' } }));
      expect(desc.rows[0].uuid).toBe('25');
      expect(desc.rows).toHaveLength(10);

      const asc = await fetcher(
        makeRequest({ currentPage: 3, filter: { o: 'size' } }),
      );
      expect(asc.rows.map((r) => r.uuid)).toEqual([
        '21',
        '22',
        '23',
        '24',
        '25',
      ]);
    });

    it('sorts null and undefined values last', async () => {
      const fetcher = createClientPaginatedFetcher([
        { name: 'b' },
        { name: null },
        { name: 'a' },
      ]);

      const result = await fetcher(makeRequest({ filter: { o: 'name' } }));

      expect(result.rows.map((r) => r.name)).toEqual(['a', 'b', null]);
    });

    it('does not mutate the source array when sorting', async () => {
      const data = [{ size: 2 }, { size: 1 }];
      const fetcher = createClientPaginatedFetcher(data);

      await fetcher(makeRequest({ filter: { o: 'size' } }));

      expect(data.map((r) => r.size)).toEqual([2, 1]);
    });

    it('filters by the configured query field', async () => {
      const fetcher = createClientPaginatedFetcher(items, {
        queryField: 'name',
      });

      const result = await fetcher(makeRequest({ filter: { name: 'ITEM-2' } }));

      // item-20 through item-25 (case-insensitive substring match)
      expect(result.rows).toHaveLength(6);
      expect(result.resultCount).toBe(6);
      expect(result.rows[0].name).toBe('item-20');
    });

    it('ignores the query when no queryField option is set', async () => {
      const fetcher = createClientPaginatedFetcher(items);

      const result = await fetcher(makeRequest({ filter: { name: 'item-2' } }));

      expect(result.resultCount).toBe(25);
    });

    it('combines search, sorting and pagination', async () => {
      const fetcher = createClientPaginatedFetcher(items, {
        queryField: 'name',
      });

      const result = await fetcher(
        makeRequest({ filter: { name: 'item-1', o: '-size' } }),
      );

      // item-10..item-19 = 10 matches, sorted desc by size
      expect(result.resultCount).toBe(10);
      expect(result.rows).toHaveLength(10);
      expect(result.rows[0].name).toBe('item-19');
      expect(result.nextPage).toBeNull();
    });
  });
});
