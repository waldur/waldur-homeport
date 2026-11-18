import Table from '@/table/Table';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, useCallback } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';

import * as tableActions from './actions';
import BaseTable from './BaseTable';
import { getTableState } from './selectors';
import { createTablesStore } from './store';

const TableWrapper = (component) => {
  const store = createStore(() => ({}));

  return <Provider store={store}>{component}</Provider>;
};

describe('Table', () => {
  const fetch = vi.fn();
  const props = {
    loading: false,
    error: null,
    fetch,
    resetSelection: vi.fn(),
    setFilterPosition: vi.fn(),
    initColumnPositions: vi.fn(),
    rows: [],
    sorting: {
      mode: undefined,
      field: null,
      loading: false,
    },
    activeColumns: {},
    columnPositions: [],
  };

  describe('tabs', () => {
    it('shows the tab bar passed as nav, with no router', () => {
      render(
        TableWrapper(
          <BaseTable {...props} nav={<nav aria-label="Views">Views</nav>} />,
        ),
      );
      expect(screen.getByRole('navigation', { name: 'Views' })).toBeVisible();
    });

    it('renders tabs as links in the homeport table', () => {
      render(
        TableWrapper(
          <Table
            {...props}
            tabs={[
              { key: 'all', title: 'All', state: 'projects', default: true },
              { key: 'mine', title: 'Mine', state: 'projects.mine' },
            ]}
          />,
        ),
      );
      expect(screen.getByRole('link', { name: 'All' })).toBeVisible();
      expect(screen.getByRole('link', { name: 'Mine' })).toBeVisible();
    });
  });

  describe('special states', () => {
    it('renders message if list is empty', () => {
      render(TableWrapper(<Table {...props} />));
      expect(screen.getByText('There are no items yet.')).toBeInTheDocument();
    });

    it('renders custom message if list is empty and verboseName is set', () => {
      render(TableWrapper(<Table {...props} verboseName="projects" />));
      expect(screen.getByText('No projects found')).toBeInTheDocument();
    });

    it('renders custom message if list is empty and verboseName is set and query is set', () => {
      render(
        TableWrapper(
          <Table {...props} verboseName="projects" query="my projects" />,
        ),
      );
      expect(
        screen.getByText(
          'Your search "my projects" did not match any projects.',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('data rendering', () => {
    const renderComponent = () =>
      render(
        TableWrapper(
          <Table
            fetch={fetch}
            resetSelection={vi.fn()}
            setFilterPosition={vi.fn()}
            initColumnPositions={vi.fn()}
            loading={false}
            error={null}
            pagination={{
              resultCount: 1,
              currentPage: 1,
              pageSize: 10,
            }}
            columns={[
              {
                title: 'Resource type',
                render: ({ row }) => row.type,
              },
              {
                title: 'Resource name',
                render: ({ row }) => row.name,
              },
            ]}
            rows={[
              {
                type: 'OpenStack Instance',
                name: 'Web server',
              },
            ]}
            activeColumns={{}}
            columnPositions={[]}
          />,
        ),
      );

    it('renders column headers', () => {
      renderComponent();
      expect(screen.getByText('Resource type')).toBeInTheDocument();
      expect(screen.getByText('Resource name')).toBeInTheDocument();
    });

    it('renders row values', () => {
      renderComponent();
      expect(screen.getByText('OpenStack Instance')).toBeInTheDocument();
      expect(screen.getByText('Web server')).toBeInTheDocument();
    });
  });

  describe('falsy column guard', () => {
    // Feature-gated columns are declared inline as `condition && { ... }`,
    // which yields a falsy entry when the condition is off. Such entries must
    // be dropped from both header and body, otherwise the header renders an
    // extra <th> the body has no <td> for and every later column shifts.
    const renderWithColumns = (columns) =>
      render(
        TableWrapper(
          <Table
            fetch={fetch}
            resetSelection={vi.fn()}
            setFilterPosition={vi.fn()}
            initColumnPositions={vi.fn()}
            loading={false}
            error={null}
            pagination={{ resultCount: 1, currentPage: 1, pageSize: 10 }}
            columns={columns}
            rows={[{ type: 'OpenStack Instance', state: 'OK' }]}
            activeColumns={{}}
            columnPositions={[]}
          />,
        ),
      );

    it('drops a falsy column so header and body stay aligned', () => {
      renderWithColumns([
        { title: 'Type', render: ({ row }) => row.type },
        // feature flag off
        false,
        { title: 'State', render: ({ row }) => row.state },
      ]);

      // The falsy entry must not produce a third header.
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(2);
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('State')).toBeInTheDocument();

      // Header count must match body cell count (no shift).
      const cells = screen.getAllByRole('cell');
      expect(cells).toHaveLength(headers.length);
      expect(cells[0]).toHaveTextContent('OpenStack Instance');
      expect(cells[1]).toHaveTextContent('OK');
    });

    it('drops null and undefined column entries too', () => {
      renderWithColumns([
        { title: 'Type', render: ({ row }) => row.type },
        null,
        undefined,
        { title: 'State', render: ({ row }) => row.state },
      ]);

      expect(screen.getAllByRole('columnheader')).toHaveLength(2);
      expect(screen.getAllByRole('cell')).toHaveLength(2);
    });
  });

  describe('columns that change after mount', () => {
    // The column state lives in a real tables store, so the effects that
    // initialise visibility and order act on what the user actually sees.
    const TABLE = 'late-columns';
    const row = { a: 'cell-a', b: 'cell-b', c: 'cell-c', d: 'cell-d' };
    const column = (id: string, optional = false) => ({
      id,
      title: `Title ${id}`,
      keys: [id],
      optional,
      render: ({ row }) => row[id],
    });

    const ColumnsTable = ({ columns }) => {
      const dispatch = useDispatch();
      const state = useSelector(getTableState(TABLE));
      const toggleColumn = useCallback(
        (id, col, value?) =>
          dispatch(tableActions.toggleColumn(TABLE, id, col, value)),
        [dispatch],
      );
      const initColumnPositions = useCallback(
        (ids: string[]) =>
          dispatch(tableActions.initColumnPositions(TABLE, ids)),
        [dispatch],
      );
      const swapColumns = useCallback(
        (a: string, b: string) =>
          dispatch(tableActions.swapColumns(TABLE, a, b)),
        [dispatch],
      );
      const resetColumns = useCallback(
        () => dispatch(tableActions.resetColumns(TABLE)),
        [dispatch],
      );
      return (
        <BaseTable
          {...props}
          table={TABLE}
          mode="table"
          hasOptionalColumns
          columns={columns}
          rows={[row]}
          pagination={{ resultCount: 1, currentPage: 1, pageSize: 10 }}
          activeColumns={state.activeColumns}
          columnPositions={state.columnPositions}
          toggleColumn={toggleColumn}
          initColumnPositions={initColumnPositions}
          swapColumns={swapColumns}
          resetColumns={resetColumns}
        />
      );
    };

    const renderColumns = (columns) => {
      const store = createTablesStore();
      const view = render(
        <Provider store={store}>
          <ColumnsTable columns={columns} />
        </Provider>,
      );
      const rerenderColumns = (next) =>
        view.rerender(
          <Provider store={store}>
            <ColumnsTable columns={next} />
          </Provider>,
        );
      return { store, rerenderColumns };
    };

    const headerTitles = () =>
      screen
        .getAllByRole('columnheader')
        .map((th) => th.textContent)
        .filter((text) => text.startsWith('Title '));

    const cellTexts = () =>
      screen.getAllByRole('cell').map((td) => td.textContent);

    const positions = (store) =>
      getTableState(TABLE)(store.getState()).columnPositions;

    const openPicker = async () => {
      const user = userEvent.setup();
      await user.click(
        screen.getByRole('button', { name: 'Toggle visible columns' }),
      );
      const list = await screen.findByRole('list', { name: 'Columns' });
      return { user, list };
    };

    it('still starts from the columns order on mount, under StrictMode too', () => {
      // An order left in the store by an earlier visit to the page.
      const store = createTablesStore({
        [TABLE]: {
          ...getTableState(TABLE)({ tables: {} }),
          columnPositions: ['b', 'gone', 'a'],
        },
      });
      render(
        <StrictMode>
          <Provider store={store}>
            <ColumnsTable columns={[column('a'), column('b')]} />
          </Provider>
        </StrictMode>,
      );

      expect(positions(store)).toEqual(['a', 'b']);
      expect(headerTitles()).toEqual(['Title a', 'Title b']);
    });

    it('shows a column added after mount in the header and the rows', () => {
      const { store, rerenderColumns } = renderColumns([
        column('a'),
        column('b'),
      ]);
      expect(headerTitles()).toEqual(['Title a', 'Title b']);

      rerenderColumns([column('a'), column('b'), column('c')]);

      expect(headerTitles()).toEqual(['Title a', 'Title b', 'Title c']);
      expect(cellTexts()).toEqual(['cell-a', 'cell-b', 'cell-c']);
      expect(positions(store)).toEqual(['a', 'b', 'c']);
    });

    it('lists an optional column added after mount, switched off, and lets the user switch it on', async () => {
      const { rerenderColumns } = renderColumns([column('a'), column('b')]);

      rerenderColumns([column('a'), column('b'), column('c', true)]);
      expect(headerTitles()).toEqual(['Title a', 'Title b']);

      const { user, list } = await openPicker();
      const checkbox = within(list).getByRole('checkbox', {
        name: 'Title c',
      });
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);

      expect(headerTitles()).toEqual(['Title a', 'Title b', 'Title c']);
    });

    it('keeps what the user has shown or hidden when columns are added or removed', async () => {
      const { rerenderColumns } = renderColumns([
        column('a'),
        column('b'),
        column('c', true),
      ]);
      const { user, list } = await openPicker();
      // Hide a default column and show an optional one.
      await user.click(within(list).getByRole('checkbox', { name: 'Title b' }));
      await user.click(within(list).getByRole('checkbox', { name: 'Title c' }));
      expect(headerTitles()).toEqual(['Title a', 'Title c']);

      rerenderColumns([
        column('a'),
        column('b'),
        column('c', true),
        column('d'),
      ]);
      expect(headerTitles()).toEqual(['Title a', 'Title c', 'Title d']);

      rerenderColumns([column('b'), column('c', true), column('d')]);
      expect(headerTitles()).toEqual(['Title c', 'Title d']);
    });

    it('keeps the order the user chose and places a new column by its position in columns', () => {
      const { store, rerenderColumns } = renderColumns([
        column('a'),
        column('b'),
        column('c'),
      ]);
      // What dragging "c" above "a" in the column picker dispatches.
      act(() => {
        store.dispatch(tableActions.swapColumns(TABLE, 'c', 'a'));
      });
      expect(headerTitles()).toEqual(['Title c', 'Title a', 'Title b']);

      rerenderColumns([column('a'), column('d'), column('b'), column('c')]);

      expect(positions(store)).toEqual(['c', 'a', 'd', 'b']);
      expect(headerTitles()).toEqual([
        'Title c',
        'Title a',
        'Title d',
        'Title b',
      ]);
    });

    it('drops a removed column from the positions, and the picker still opens', async () => {
      const { store, rerenderColumns } = renderColumns([
        column('a'),
        column('b'),
        column('c'),
      ]);

      rerenderColumns([column('a'), column('c')]);

      expect(positions(store)).toEqual(['a', 'c']);
      expect(headerTitles()).toEqual(['Title a', 'Title c']);
      const { list } = await openPicker();
      expect(
        within(list)
          .getAllByRole('checkbox')
          .map((checkbox) => checkbox.getAttribute('aria-label')),
      ).toEqual(['Title a', 'Title c']);
    });

    it('lets Reset restore the default visibility and order of the current columns', async () => {
      const { store, rerenderColumns } = renderColumns([
        column('a'),
        column('b'),
      ]);
      act(() => {
        store.dispatch(tableActions.swapColumns(TABLE, 'b', 'a'));
      });
      rerenderColumns([column('a'), column('b'), column('c', true)]);

      const { user, list } = await openPicker();
      await user.click(within(list).getByRole('checkbox', { name: 'Title a' }));
      await user.click(within(list).getByRole('checkbox', { name: 'Title c' }));
      expect(headerTitles()).toEqual(['Title b', 'Title c']);

      await user.click(
        screen.getByRole('button', { name: 'Reset settings to default' }),
      );

      expect(positions(store)).toEqual(['a', 'b', 'c']);
      expect(headerTitles()).toEqual(['Title a', 'Title b']);
    });
  });
});
