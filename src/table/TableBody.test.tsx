import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { combineReducers, legacy_createStore as createStore } from 'redux';
import { describe, it, expect } from 'vitest';

import { ModalProvider } from '@/modal/ModalContext';

import { FilterContextProvider } from './FilterContextProvider';
import { StringFilter } from './filters';
import { tableInitialReducer } from './store';
import { TableBody } from './TableBody';
import { TableFilters } from './TableFilters';

export const ROW_UUID = 1;

export const COLUMNS = [
  {
    title: 'Resource type',
    render: ({ row }) => row.type,
  },
  {
    title: 'Resource name',
    render: ({ row }) => row.name,
  },
];

const ROWS = [
  {
    type: 'OpenStack Instance',
    name: 'Web server',
    uuid: ROW_UUID,
  },
];

export const renderWrapper = (props?) =>
  render(
    <table>
      <TableBody columns={COLUMNS} rows={ROWS} {...props} />
    </table>,
  );

const expandableRow = () => <h3>Detailed info</h3>;

describe('TableBody', () => {
  it('should render a cell for each column', () => {
    renderWrapper();
    expect(screen.getAllByRole('cell')).toHaveLength(COLUMNS.length);
  });

  it('should not render expandable indicator if expandable component is not provided', () => {
    renderWrapper();
    expect(screen.queryByTestId('row-expander')).not.toBeInTheDocument();
  });

  it('should render untoggled expandable indicator if expandable component is provided', () => {
    renderWrapper({ expandableRow, toggled: {} });
    expect(screen.getByTestId('row-expander')).toBeInTheDocument();
    expect(screen.getAllByRole('cell')).toHaveLength(COLUMNS.length);
  });

  it('should render toggled expandable indicator according to props', () => {
    renderWrapper({
      expandableRow,
      toggled: { [ROW_UUID]: true },
    });
    expect(screen.getByTestId('row-expander')).toBeInTheDocument();
  });

  it('should render extra row if it is expanded', () => {
    renderWrapper({
      expandableRow,
      toggled: { [ROW_UUID]: true },
    });
    expect(screen.getByText('Detailed info')).toBeInTheDocument();
  });

  it('expanded row colSpan should equal columns.length when no rowActions or multiSelect', () => {
    renderWrapper({
      expandableRow,
      toggled: { [ROW_UUID]: true },
    });
    const expandedCell = screen.getByTestId('expanded-row-cell');
    expect(expandedCell).toHaveAttribute('colspan', String(COLUMNS.length));
  });

  it('should show expander when first column is hidden', () => {
    const columnsWithHiddenFirst = [
      {
        title: 'Hidden column',
        render: ({ row }) => row.type,
        visible: false,
      },
      {
        title: 'Visible column',
        render: ({ row }) => row.name,
      },
    ];
    renderWrapper({
      columns: columnsWithHiddenFirst,
      expandableRow,
      toggled: {},
    });
    expect(screen.getByTestId('row-expander')).toBeInTheDocument();
  });
});

/**
 * Regression coverage for a live bug: TableBody.tsx's InlineFilterButton
 * only renders for a cell when hasFilterMenu() finds
 * `#kt_content_container .table-filters-menu #filter-item-{key}` in the
 * DOM — a selector written for Metronic's own markup, never portaled.
 * TableFiltersMenu.tsx's Radix Popover.Portal defaulted to document.body,
 * which moves that whole subtree (and every `#filter-item-*` row in it)
 * outside `#kt_content_container`, so the selector silently stopped
 * matching and the inline "filter by this value" shortcut stopped
 * appearing at all — reported live as "inline & column table filters
 * does not work anymore". Fixed by anchoring the Portal's `container`
 * back inside `#kt_content_container`.
 */
describe('TableBody inline filter shortcut (hasFilterMenu regression)', () => {
  const FILTER_COLUMNS = [
    {
      title: 'Resource type',
      render: ({ row }) => row.type,
      filter: 'resource_type',
      inlineFilter: (row) => row.type,
    },
    {
      title: 'Resource name',
      render: ({ row }) => row.name,
    },
  ];

  // Mirrors Table.tsx's real composition: the filters bar (holding
  // TableFiltersMenu's force-mounted content) and TableBody share one
  // FilterContextProvider. Rows are populated one tick after mount — like
  // a real async fetch — so this exercises the same render-ordering the
  // live bug depended on: the filters bar's DOM must exist before
  // hasFilterMenu() is asked about a row.
  //
  // #kt_content_container itself is created and attached to the document
  // *before* render(), and the tree is rendered directly into it via
  // RTL's `container` option — not as a React-rendered child inside the
  // tree under test. In the real app this id belongs to a page-shell
  // element (src/metronic/layout/components/Content.tsx) that's already
  // mounted, from an earlier commit, by the time any table underneath it
  // renders for the first time. Nesting it as a plain JSX ancestor in the
  // SAME initial render — as an earlier version of this test did — commits
  // it in the very same pass as TableFiltersMenu, so the Portal's
  // container lookup (which runs during render, before anything commits)
  // always sees it as absent and silently falls back to document.body,
  // masking exactly the bug this test exists to catch.
  const renderWithFilters = () => {
    const table = 'TableBodyRegressionTable';
    const store = createStore(combineReducers({ tables: tableInitialReducer }));

    const ktContentContainer = document.createElement('div');
    ktContentContainer.id = 'kt_content_container';
    document.body.appendChild(ktContentContainer);

    const Wrapper = () => {
      const [rows, setRows] = useState<typeof ROWS>([]);
      useEffect(() => {
        setRows(ROWS);
      }, []);
      return (
        <Provider store={store}>
          <ModalProvider>
            <FilterContextProvider
              table={table}
              formId="RegressionForm"
              filterPosition="menu"
              setFilter={() => undefined}
              applyFiltersFn={() => undefined}
              toggleFilterMenu={() => undefined}
            >
              <TableFilters
                table={table}
                filtersStorage={[]}
                formId="RegressionForm"
                filterPosition="menu"
                setFilter={() => undefined}
                applyFiltersFn={() => undefined}
                filters={
                  <StringFilter
                    title="Resource type"
                    name="resource_type"
                    placeholder="Resource type"
                  />
                }
              />
              <table>
                <TableBody
                  columns={FILTER_COLUMNS}
                  rows={rows}
                  fetch={() => undefined}
                  columnPositions={FILTER_COLUMNS.map((c) => c.title)}
                />
              </table>
            </FilterContextProvider>
          </ModalProvider>
        </Provider>
      );
    };

    return render(<Wrapper />, { container: ktContentContainer });
  };

  it('shows the inline filter shortcut once the filters bar and row have both mounted', async () => {
    renderWithFilters();
    await waitFor(() =>
      expect(
        document.querySelector('.inline-filter'), // eslint-disable-line testing-library/no-node-access, no-restricted-syntax
      ).toBeInTheDocument(),
    );
  });

  it('the inline filter shortcut opens on click', async () => {
    const user = userEvent.setup();
    renderWithFilters();

    await waitFor(() =>
      expect(
        document.querySelector('.inline-filter'), // eslint-disable-line testing-library/no-node-access, no-restricted-syntax
      ).toBeInTheDocument(),
    );
    const inlineTrigger = document.querySelector('.inline-filter'); // eslint-disable-line testing-library/no-node-access, no-restricted-syntax
    expect(inlineTrigger).toHaveAttribute('data-state', 'closed');

    await user.click(inlineTrigger as HTMLElement);
    expect(inlineTrigger).toHaveAttribute('data-state', 'open');
    expect(await screen.findByText('Filter by')).toBeInTheDocument();
  });
});
