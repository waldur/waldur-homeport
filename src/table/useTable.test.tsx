import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { combineReducers, legacy_createStore as createStore } from 'redux';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { reducer as tableReducer } from './store';
import { useTable } from './useTable';
import { useTableQuery } from './useTableQuery';

// Mock the drawer actions
vi.mock('@waldur/drawer/actions', () => ({
  openDrawerDialog: vi.fn(() => ({ type: 'OPEN_DRAWER' })),
  renderDrawerDialog: vi.fn(() => ({ type: 'RENDER_DRAWER' })),
}));

// Mock router
vi.mock('@waldur/router', () => ({
  router: {
    globals: {
      $current: {
        path: [],
        parent: null,
      },
    },
  },
}));

// Mock navigation title
vi.mock('@waldur/navigation/title', () => ({
  getTitle: () => 'Test Page',
  effects: function* () {},
}));

// Mock queryClient
vi.mock('@waldur/core/queryClient', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

// Mock useTableQuery
vi.mock('./useTableQuery', () => ({
  useTableQuery: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  })),
}));

const createTestStore = (initialState = {}) => {
  const rootReducer = combineReducers({
    tables: tableReducer,
  });
  return createStore(rootReducer, initialState);
};

const createWrapper = (store: ReturnType<typeof createTestStore>) => {
  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useTable', () => {
  const mockFetchData = vi.fn(() =>
    Promise.resolve({ rows: [], resultCount: 0 }),
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('returns table state with default values', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      expect(result.current.table).toBe('TestTable');
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.rows).toEqual([]);
      expect(result.current.pagination).toEqual({
        pageSize: 10,
        resultCount: 0,
        currentPage: 1,
      });
      expect(result.current.sorting).toEqual({
        mode: undefined,
        field: null,
        loading: false,
      });
    });

    it('returns all required functions', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      expect(typeof result.current.fetch).toBe('function');
      expect(typeof result.current.gotoPage).toBe('function');
      expect(typeof result.current.updatePageSize).toBe('function');
      expect(typeof result.current.resetPagination).toBe('function');
      expect(typeof result.current.sortList).toBe('function');
      expect(typeof result.current.setQuery).toBe('function');
      expect(typeof result.current.setFilter).toBe('function');
      expect(typeof result.current.setFilterPosition).toBe('function');
      expect(typeof result.current.applyFiltersFn).toBe('function');
      expect(typeof result.current.setDisplayMode).toBe('function');
      expect(typeof result.current.toggleRow).toBe('function');
      expect(typeof result.current.selectRow).toBe('function');
      expect(typeof result.current.selectAllRows).toBe('function');
      expect(typeof result.current.resetSelection).toBe('function');
      expect(typeof result.current.toggleColumn).toBe('function');
      expect(typeof result.current.initColumnPositions).toBe('function');
      expect(typeof result.current.swapColumns).toBe('function');
      expect(typeof result.current.openFiltersDrawer).toBe('function');
      expect(typeof result.current.renderFiltersDrawer).toBe('function');
    });
  });

  describe('pagination actions', () => {
    it('gotoPage updates current page', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      act(() => {
        result.current.gotoPage(3);
      });

      expect(result.current.pagination.currentPage).toBe(3);
    });

    it('updatePageSize updates page size', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      act(() => {
        result.current.updatePageSize(25);
      });

      expect(result.current.pagination.pageSize).toBe(25);
    });

    it('resetPagination resets to page 1', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      act(() => {
        result.current.gotoPage(5);
      });
      expect(result.current.pagination.currentPage).toBe(5);

      act(() => {
        result.current.resetPagination();
      });
      expect(result.current.pagination.currentPage).toBe(1);
    });
  });

  describe('sorting actions', () => {
    it('sortList updates sorting state', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      act(() => {
        result.current.sortList({ field: 'name', mode: 'asc' });
      });

      expect(result.current.sorting.field).toBe('name');
      expect(result.current.sorting.mode).toBe('asc');
      expect(result.current.sorting.loading).toBe(true);
    });
  });

  describe('query actions', () => {
    it('setQuery updates query state', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      act(() => {
        result.current.setQuery('search term');
      });

      expect(result.current.query).toBe('search term');
    });
  });

  describe('display mode actions', () => {
    it('setDisplayMode updates mode state', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      expect(result.current.mode).toBe('table');

      act(() => {
        result.current.setDisplayMode('grid');
      });

      expect(result.current.mode).toBe('grid');
    });
  });

  describe('row selection actions', () => {
    it('selectRow adds row to selected rows', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      const row = { uuid: '123', name: 'Test' };

      act(() => {
        result.current.selectRow(row);
      });

      expect(result.current.selectedRows).toContainEqual(row);
    });

    it('selectAllRows sets all rows as selected', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      const rows = [
        { uuid: '1', name: 'Row 1' },
        { uuid: '2', name: 'Row 2' },
      ];

      act(() => {
        result.current.selectAllRows(rows);
      });

      expect(result.current.selectedRows).toEqual(rows);
    });

    it('resetSelection clears selected rows', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      act(() => {
        result.current.selectRow({ uuid: '123', name: 'Test' });
      });
      expect(result.current.selectedRows.length).toBeGreaterThan(0);

      act(() => {
        result.current.resetSelection();
      });
      expect(result.current.selectedRows).toEqual([]);
    });
  });

  describe('row toggle actions', () => {
    it('toggleRow expands/collapses row', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      act(() => {
        result.current.toggleRow('row-1');
      });

      expect(result.current.toggled['row-1']).toBe(true);

      act(() => {
        result.current.toggleRow('row-1');
      });

      expect(result.current.toggled['row-1']).toBe(false);
    });
  });

  describe('column actions', () => {
    it('toggleColumn updates active columns', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      act(() => {
        result.current.toggleColumn('email', { keys: ['email'] }, true);
      });

      // Check that keys are stored (activeColumns stores column keys arrays)
      expect(result.current.activeColumns['email']).toEqual(['email']);
    });

    it('initColumnPositions sets column order', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      act(() => {
        result.current.initColumnPositions(['name', 'email', 'role']);
      });

      expect(result.current.columnPositions).toEqual(['name', 'email', 'role']);
    });

    it('swapColumns reorders columns', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      act(() => {
        result.current.initColumnPositions(['name', 'email', 'role']);
      });

      // Swap adjacent columns
      act(() => {
        result.current.swapColumns('name', 'email');
      });

      expect(result.current.columnPositions).toEqual(['email', 'name', 'role']);
    });
  });

  describe('filter actions', () => {
    it('setFilter adds filter to storage', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      act(() => {
        result.current.setFilter({
          name: 'status',
          label: 'Status',
          value: { value: 'active', label: 'Active' },
          component: () => null,
        });
      });

      expect(result.current.filtersStorage).toContainEqual(
        expect.objectContaining({
          name: 'status',
          value: { value: 'active', label: 'Active' },
        }),
      );
    });

    it('setFilterPosition updates filter position', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      expect(result.current.filterPosition).toBe('menu');

      act(() => {
        result.current.setFilterPosition('header');
      });

      expect(result.current.filterPosition).toBe('header');
    });

    it('applyFiltersFn sets apply filters flag', () => {
      const store = createTestStore();
      const { result } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper: createWrapper(store) },
      );

      expect(result.current.applyFilters).toBe(false);

      act(() => {
        result.current.applyFiltersFn(true);
      });

      expect(result.current.applyFilters).toBe(true);
    });
  });

  describe('multiple tables', () => {
    it('maintains separate state for different tables', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result: result1 } = renderHook(
        () =>
          useTable({
            table: 'Table1',
            fetchData: mockFetchData,
          }),
        { wrapper },
      );

      const { result: result2 } = renderHook(
        () =>
          useTable({
            table: 'Table2',
            fetchData: mockFetchData,
          }),
        { wrapper },
      );

      act(() => {
        result1.current.gotoPage(5);
        result2.current.gotoPage(10);
      });

      expect(result1.current.pagination.currentPage).toBe(5);
      expect(result2.current.pagination.currentPage).toBe(10);
    });
  });

  describe('error handling', () => {
    it('resets pagination to page 1 when "Invalid page" response is received', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Start with no data
      vi.mocked(useTableQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result, rerender } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper },
      );

      // Go to page 5
      act(() => {
        result.current.gotoPage(5);
      });
      expect(result.current.pagination.currentPage).toBe(5);

      // Simulate "Invalid page" response (handled in useTableQuery, returns invalidPage flag)
      vi.mocked(useTableQuery).mockReturnValue({
        data: {
          entities: {},
          order: [],
          resultCount: 0,
          rows: [],
          invalidPage: true,
        },
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
      });

      // Rerender to trigger the data handling effect
      rerender();

      // Pagination should be reset to page 1
      expect(result.current.pagination.currentPage).toBe(1);
    });

    it('does not reset pagination for normal data responses', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      // Start with no data
      vi.mocked(useTableQuery).mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
      });

      const { result, rerender } = renderHook(
        () =>
          useTable({
            table: 'TestTable',
            fetchData: mockFetchData,
          }),
        { wrapper },
      );

      // Go to page 5
      act(() => {
        result.current.gotoPage(5);
      });
      expect(result.current.pagination.currentPage).toBe(5);

      // Simulate normal data response (no invalidPage flag)
      vi.mocked(useTableQuery).mockReturnValue({
        data: {
          entities: { '1': { uuid: '1' } },
          order: ['1'],
          resultCount: 1,
          rows: [{ uuid: '1' }],
        },
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: vi.fn(),
      });

      // Rerender to trigger the data handling effect
      rerender();

      // Pagination should NOT be reset for normal responses
      expect(result.current.pagination.currentPage).toBe(5);
    });
  });
});
