import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TableProvider } from './TableProvider';
import { useTableContext } from './useTableContext';

// Test component that consumes context
function ContextConsumer() {
  const context = useTableContext();
  return (
    <div>
      <span data-testid="rows-count">{context.rows.length}</span>
      <span data-testid="has-rows">{String(context.hasRows)}</span>
      <span data-testid="show-title">{String(context.showTitle)}</span>
      <span data-testid="show-actions">
        {String(context.showActionsColumn)}
      </span>
      <span data-testid="table-name">{context.config.table}</span>
      <span data-testid="mode">{context.mode}</span>
      <span data-testid="loading">{String(context.loading)}</span>
    </div>
  );
}

const defaultProps = {
  rows: [],
  columns: [],
  fetch: vi.fn(),
  filterPosition: 'menu' as const,
  toggleFilterMenu: vi.fn(),
  showFilterMenuToggle: false,
  pinnedColumns: {},
  activeColumns: {},
  columnPositions: [],
  loading: false,
  error: null,
  pagination: { resultCount: 0, currentPage: 1, pageSize: 10 },
  sorting: { field: '', mode: undefined as undefined },
  mode: 'table' as const,
  query: '',
  firstFetch: true,
  applyFilters: false,
  selectedRows: [],
  toggled: {},
  filtersStorage: [],
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
  renderFiltersDrawer: vi.fn(),
  openFiltersDrawer: vi.fn(),
};

describe('TableProvider', () => {
  describe('context value computation', () => {
    it('provides rows and columns to children', () => {
      const rows = [{ uuid: '1', name: 'Test' }];
      const columns = [{ title: 'Name', render: ({ row }) => row.name }];

      render(
        <TableProvider {...defaultProps} rows={rows} columns={columns}>
          <ContextConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('rows-count')).toHaveTextContent('1');
    });

    it('computes hasRows correctly when rows exist', () => {
      render(
        <TableProvider {...defaultProps} rows={[{ uuid: '1' }]}>
          <ContextConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('has-rows')).toHaveTextContent('true');
    });

    it('computes hasRows correctly when rows are empty', () => {
      render(
        <TableProvider {...defaultProps} rows={[]}>
          <ContextConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('has-rows')).toHaveTextContent('false');
    });

    it('computes showTitle correctly based on standalone and hideTitle', () => {
      render(
        <TableProvider {...defaultProps} standalone={false} hideTitle={false}>
          <ContextConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('show-title')).toHaveTextContent('true');
    });

    it('hides title when standalone is true', () => {
      render(
        <TableProvider {...defaultProps} standalone={true}>
          <ContextConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('show-title')).toHaveTextContent('false');
    });

    it('computes showActionsColumn when tableActions is provided', () => {
      render(
        <TableProvider {...defaultProps} tableActions={<button>Create</button>}>
          <ContextConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('show-actions')).toHaveTextContent('true');
    });

    it('computes showActionsColumn when enableExport is true', () => {
      render(
        <TableProvider {...defaultProps} enableExport={true}>
          <ContextConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('show-actions')).toHaveTextContent('true');
    });

    it('computes showActionsColumn when filters are provided', () => {
      render(
        <TableProvider {...defaultProps} filters={<div>Filters</div>}>
          <ContextConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('show-actions')).toHaveTextContent('true');
    });

    it('sets showActionsColumn to false when no actions are configured', () => {
      render(
        <TableProvider {...defaultProps}>
          <ContextConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('show-actions')).toHaveTextContent('false');
    });
  });

  describe('config defaults', () => {
    it('provides default config values', () => {
      render(
        <TableProvider {...defaultProps} table="my-table">
          <ContextConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('table-name')).toHaveTextContent('my-table');
    });

    it('passes mode from props', () => {
      render(
        <TableProvider {...defaultProps} mode="grid">
          <ContextConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('mode')).toHaveTextContent('grid');
    });

    it('passes loading state from props', () => {
      render(
        <TableProvider {...defaultProps} loading={true}>
          <ContextConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('true');
    });
  });

  describe('visible columns computation', () => {
    it('returns all columns when hasOptionalColumns is false', () => {
      const columns = [
        { id: 'col1', title: 'Column 1', render: () => null },
        { id: 'col2', title: 'Column 2', render: () => null, keys: ['field1'] },
      ];

      function ColumnsConsumer() {
        const { visibleColumns } = useTableContext();
        return <span data-testid="visible-count">{visibleColumns.length}</span>;
      }

      render(
        <TableProvider
          {...defaultProps}
          columns={columns}
          hasOptionalColumns={false}
        >
          <ColumnsConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('visible-count')).toHaveTextContent('2');
    });

    it('filters columns based on activeColumns when hasOptionalColumns is true', () => {
      const columns = [
        { id: 'col1', title: 'Column 1', render: () => null },
        { id: 'col2', title: 'Column 2', render: () => null, keys: ['field1'] },
        { id: 'col3', title: 'Column 3', render: () => null, keys: ['field2'] },
      ];

      function ColumnsConsumer() {
        const { visibleColumns } = useTableContext();
        return <span data-testid="visible-count">{visibleColumns.length}</span>;
      }

      render(
        <TableProvider
          {...defaultProps}
          columns={columns}
          hasOptionalColumns={true}
          activeColumns={{ col1: false, col2: ['field1'], col3: false }}
        >
          <ColumnsConsumer />
        </TableProvider>,
      );

      // col1 has no keys so always visible, col2 is active, col3 is inactive
      expect(screen.getByTestId('visible-count')).toHaveTextContent('2');
    });
  });

  describe('actions passthrough', () => {
    it('provides fetch action from props', () => {
      const fetch = vi.fn();

      function ActionsConsumer() {
        const { actions } = useTableContext();
        return (
          <button onClick={() => actions.fetch(true)} data-testid="fetch-btn">
            Fetch
          </button>
        );
      }

      render(
        <TableProvider {...defaultProps} fetch={fetch}>
          <ActionsConsumer />
        </TableProvider>,
      );

      screen.getByTestId('fetch-btn').click();
      expect(fetch).toHaveBeenCalledWith(true);
    });

    it('provides setQuery action from props', () => {
      const setQuery = vi.fn();

      function ActionsConsumer() {
        const { actions } = useTableContext();
        return (
          <button
            onClick={() => actions.setQuery('test')}
            data-testid="query-btn"
          >
            Set Query
          </button>
        );
      }

      render(
        <TableProvider {...defaultProps} setQuery={setQuery}>
          <ActionsConsumer />
        </TableProvider>,
      );

      screen.getByTestId('query-btn').click();
      expect(setQuery).toHaveBeenCalledWith('test');
    });
  });

  describe('filter passthrough', () => {
    it('provides filter from props for export functionality', () => {
      const testFilter = { customer_uuid: 'test-uuid', status: 'active' };

      function FilterConsumer() {
        const { filter } = useTableContext();
        return <span data-testid="filter">{JSON.stringify(filter)}</span>;
      }

      render(
        <TableProvider {...defaultProps} filter={testFilter}>
          <FilterConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('filter')).toHaveTextContent(
        JSON.stringify(testFilter),
      );
    });

    it('provides undefined filter when not specified', () => {
      function FilterConsumer() {
        const { filter } = useTableContext();
        return (
          <span data-testid="filter">
            {filter === undefined ? 'undefined' : JSON.stringify(filter)}
          </span>
        );
      }

      render(
        <TableProvider {...defaultProps}>
          <FilterConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('filter')).toHaveTextContent('undefined');
    });
  });

  describe('slots', () => {
    it('provides gridItem slot when specified', () => {
      const GridItem = ({ row }) => <div>{row.name}</div>;

      function SlotsConsumer() {
        const { slots } = useTableContext();
        return (
          <span data-testid="has-grid-item">
            {String(Boolean(slots.gridItem))}
          </span>
        );
      }

      render(
        <TableProvider {...defaultProps} gridItem={GridItem}>
          <SlotsConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('has-grid-item')).toHaveTextContent('true');
    });

    it('provides rowActions slot when active and specified', () => {
      const RowActions = ({ row }) => <button>Action for {row.name}</button>;

      function SlotsConsumer() {
        const { slots } = useTableContext();
        return (
          <span data-testid="has-row-actions">
            {String(Boolean(slots.rowActions))}
          </span>
        );
      }

      render(
        <TableProvider
          {...defaultProps}
          rowActions={RowActions}
          hasOptionalColumns={false}
        >
          <SlotsConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('has-row-actions')).toHaveTextContent('true');
    });
  });

  describe('mobile filter regression - openFiltersDrawer in context', () => {
    it('exposes openFiltersDrawer as a distinct action from renderFiltersDrawer', () => {
      const openFiltersDrawer = vi.fn();
      const renderFiltersDrawer = vi.fn();

      function DrawerActionsConsumer() {
        const { actions } = useTableContext();
        return (
          <div>
            <button
              onClick={() => actions.openFiltersDrawer(<div>filters</div>)}
              data-testid="open-btn"
            >
              Open
            </button>
            <button
              onClick={() => actions.renderFiltersDrawer(<div>filters</div>)}
              data-testid="render-btn"
            >
              Render
            </button>
          </div>
        );
      }

      render(
        <TableProvider
          {...defaultProps}
          openFiltersDrawer={openFiltersDrawer}
          renderFiltersDrawer={renderFiltersDrawer}
        >
          <DrawerActionsConsumer />
        </TableProvider>,
      );

      screen.getByTestId('open-btn').click();
      expect(openFiltersDrawer).toHaveBeenCalledTimes(1);
      expect(renderFiltersDrawer).not.toHaveBeenCalled();

      screen.getByTestId('render-btn').click();
      expect(renderFiltersDrawer).toHaveBeenCalledTimes(1);
    });

    it('passes filterPosition from props to context', () => {
      function FilterPosConsumer() {
        const { filterPosition } = useTableContext();
        return <span data-testid="filter-pos">{filterPosition}</span>;
      }

      render(
        <TableProvider {...defaultProps} filterPosition="sidebar">
          <FilterPosConsumer />
        </TableProvider>,
      );

      expect(screen.getByTestId('filter-pos')).toHaveTextContent('sidebar');
    });
  });
});
