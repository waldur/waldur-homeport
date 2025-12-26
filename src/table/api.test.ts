import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@waldur/Application', () => ({
  queryClient: {
    fetchQuery: vi.fn(),
  },
}));

vi.mock('@waldur/core/api', () => ({
  fetchResultCount: vi.fn(),
  parseNextPage: vi.fn(),
}));

import { queryClient } from '@waldur/Application';
import { fetchResultCount, parseNextPage } from '@waldur/core/api';

import { processApiResponse, createFetcher, fetchAll } from './api';

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
});
