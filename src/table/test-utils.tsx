import { render } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { vi } from 'vitest';

import { TableContext, TableContextValue } from './context/TableContext';

/**
 * Creates a mock TableContextValue for testing.
 * Override specific values by passing them in the overrides parameter.
 */
export const createMockTableContext = (
  overrides: Partial<TableContextValue> = {},
): TableContextValue => ({
  rows: [],
  columns: [],
  visibleColumns: [],
  loading: false,
  error: null,
  pagination: { resultCount: 0, currentPage: 1, pageSize: 10 },
  sorting: { field: '', mode: undefined },
  mode: 'table',
  query: '',
  firstFetch: true,
  applyFilters: false,
  selectedRows: [],
  toggled: {},
  activeColumns: {},
  columnPositions: [],
  pinnedColumns: {},
  filterPosition: 'menu',
  filtersStorage: [],
  showFilterMenuToggle: false,
  hasRows: false,
  showTitle: true,
  showActionsColumn: false,
  actions: {
    fetch: vi.fn(),
    gotoPage: vi.fn(),
    updatePageSize: vi.fn(),
    resetPagination: vi.fn(),
    sortList: vi.fn(),
    setQuery: vi.fn(),
    setFilter: vi.fn(),
    setFilterPosition: vi.fn(),
    applyFiltersFn: vi.fn(),
    setDisplayMode: vi.fn(),
    toggleRow: vi.fn(),
    selectRow: vi.fn(),
    selectAllRows: vi.fn(),
    resetSelection: vi.fn(),
    toggleColumn: vi.fn(),
    initColumnPositions: vi.fn(),
    swapColumns: vi.fn(),
    toggleFilterMenu: vi.fn(),
    openFiltersDrawer: vi.fn(),
    renderFiltersDrawer: vi.fn(),
  },
  config: {
    table: 'test-table',
    rowKey: 'uuid',
    hasQuery: false,
    hasPagination: true,
    hasActionBar: true,
    hasHeaders: true,
    hasOptionalColumns: false,
    enableMultiSelect: false,
    enableExport: false,
    showExportInDropdown: false,
    showPageSizeSelector: false,
    hoverable: false,
    hoverShadow: true,
    cardBordered: true,
    fullWidth: false,
    minHeight: 300,
    equalColWidth: false,
    standalone: false,
    standaloneActionsInTable: false,
    hideClearFilters: false,
    hideRefresh: false,
    hideTitle: false,
    hideIfEmpty: false,
    placeholderHasRetry: true,
    hideExpandAllHeader: false,
  },
  slots: {},
  display: {},
  tableResponsiveRef: { current: null },
  ...overrides,
});

const testStore = createStore(() => ({}));

/**
 * Renders a component within TableContext.Provider and Redux Provider.
 * Use this to test components that consume TableContext.
 */
export function renderWithTableContext(
  ui: ReactNode,
  contextOverrides: Partial<TableContextValue> = {},
) {
  const contextValue = createMockTableContext(contextOverrides);
  return render(
    <Provider store={testStore}>
      <TableContext.Provider value={contextValue}>{ui}</TableContext.Provider>
    </Provider>,
  );
}

export { TableContext };
