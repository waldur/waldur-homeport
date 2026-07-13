import { screen } from '@testing-library/dom';
import { FC } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, expect, it, vi } from 'vitest';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { useTable } from '@/table/useTable';
import { renderWithProviders } from '@/test/harness';

import { TeamTableComponent } from './TeamTableComponent';

// Avoid real API calls; rows are supplied through the mocked redux table state.
vi.mock('@/table/useTableQuery', () => ({
  useTableQuery: () => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

const mockStore = configureStore();
const rowId = 'member-uuid-1';
const row = {
  uuid: rowId,
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  username: 'johndoe',
  role_name: 'owner',
  expiration_time: '2025-12-31T23:59:59Z',
};
const tableId = 'team-table-test';
const store = mockStore({
  tables: {
    [tableId]: {
      loading: false,
      entities: { [rowId]: row },
      order: [rowId],
      pagination: { pageSize: 10, resultCount: 1, currentPage: 1 },
      toggled: {},
      activeColumns: {},
      columnPositions: [],
    },
  },
});

// Renders the real TeamTableComponent through the real Table (TableLoader),
// so the feature-gated `!hideExpiration && {…}` column entry actually flows
// through the central falsy-column filter. hasOptionalColumns is disabled so
// the visible set maps 1:1 to the declared columns for a clean count.
const Harness: FC<{ hideExpiration?: boolean }> = ({ hideExpiration }) => {
  const props = useTable({ table: tableId, fetchData: vi.fn() as any });
  return (
    <TeamTableComponent
      {...props}
      context="organization"
      hideExpiration={hideExpiration}
      hasOptionalColumns={false}
      enableExport={false}
    />
  );
};

const renderTable = (hideExpiration?: boolean) =>
  renderWithProviders(
    <Provider store={store}>
      <DrawerProvider>
        <Harness hideExpiration={hideExpiration} />
      </DrawerProvider>
    </Provider>,
  );

const assertHeaderBodyAligned = async () => {
  // Wait for the single body row to render.
  await screen.findByText('John Doe');
  // A leftover falsy column entry would add a <th> with no matching <td>,
  // shifting every later column. With one data row, the body cell count must
  // match the header count.
  const headers = screen.getAllByRole('columnheader');
  const cells = screen.getAllByRole('cell');
  expect(cells).toHaveLength(headers.length);
};

describe('TeamTableComponent falsy column guard', () => {
  it('drops the feature-gated column when its flag is off, keeping rows aligned', async () => {
    renderTable(true);

    // `!hideExpiration && {…}` yields a falsy entry that must be dropped.
    expect(screen.queryByText('Role expiration')).not.toBeInTheDocument();
    await assertHeaderBodyAligned();
  });

  it('renders the feature-gated column when its flag is on, still aligned', async () => {
    renderTable(false);

    expect(await screen.findByText('Role expiration')).toBeInTheDocument();
    await assertHeaderBodyAligned();
  });
});
