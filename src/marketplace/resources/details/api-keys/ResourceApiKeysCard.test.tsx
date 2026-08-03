import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { hasPermission } from '@/permissions/hasPermission';
import { useTable } from '@/table/useTable';
import { renderWithProviders } from '@/test/harness';

import { ResourceApiKeysCard } from './ResourceApiKeysCard';

// Rows are supplied through the mocked redux table state, so no real request
// fires — the card renders through the real @/table/Table (TableLoader).
vi.mock('@/table/useTableQuery', () => ({
  useTableQuery: () => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}));
vi.mock('@/permissions/hasPermission', () => ({ hasPermission: vi.fn() }));
vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));
vi.mock('./useResourceApiKeys', () => ({
  TRANSITIONAL: ['Creating', 'Updating'],
  useInvalidateRevealedKey: vi.fn(() => vi.fn()),
}));

const RESOURCE = {
  uuid: 'res-1',
  project_uuid: 'proj-1',
  customer_uuid: 'cust-1',
} as any;

const KEYS = [
  {
    uuid: 'k1',
    state: 'OK',
    client_id: 'EUMVPW5J5U2ZUQ5AL9L4',
    modified: '2026-07-30T12:00:00Z',
    error_message: '',
  },
  {
    uuid: 'k2',
    state: 'Updating',
    client_id: '9LEVW594YBQ97LE4WKNY',
    modified: '2026-07-30T13:00:00Z',
    error_message: '',
  },
];

const tableId = `resource-api-keys-${RESOURCE.uuid}`;
const mockStore = configureStore();

const makeStore = (keys: any[]) =>
  mockStore({
    tables: {
      [tableId]: {
        loading: false,
        entities: Object.fromEntries(keys.map((k) => [k.uuid, k])),
        order: keys.map((k) => k.uuid),
        pagination: { pageSize: 10, resultCount: keys.length, currentPage: 1 },
        toggled: {},
        activeColumns: {},
        columnPositions: [],
      },
    },
  });

// The parent owns useTable and passes the props down; here the Harness plays
// that role so the card renders through the real Table.
const Harness: FC = () => {
  const props = useTable({ table: tableId, fetchData: vi.fn() as any });
  return <ResourceApiKeysCard {...props} resource={RESOURCE} />;
};

const renderCard = (keys: any[]) =>
  renderWithProviders(
    <Provider store={makeStore(keys)}>
      <DrawerProvider>
        <Harness />
      </DrawerProvider>
    </Provider>,
  );

// getAllByRole('row')[0] is the header; data rows follow. The Table renders
// row actions inside an aria-hidden wrapper, so target the 3-dots toggle by its
// icon (the click bubbles to the toggle button).
const openRowActions = async (rowIndex: number) => {
  const row = screen.getAllByRole('row')[rowIndex + 1];
  await userEvent.click(within(row).getByTestId('DotsThreeVerticalIcon'));
};

describe('ResourceApiKeysCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists the keys with their state via the standard table', async () => {
    vi.mocked(hasPermission).mockReturnValue(true);
    renderCard(KEYS);
    // The id is what a user matches against their own configuration.
    expect(await screen.findByText('EUMVPW5J5U2ZUQ5AL9L4')).toBeInTheDocument();
    expect(screen.getByText('9LEVW594YBQ97LE4WKNY')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Updating')).toBeInTheDocument();
  });

  it('offers reveal to everyone and rotate to managers, no add or revoke', async () => {
    vi.mocked(hasPermission).mockReturnValue(true);
    renderCard(KEYS);
    await screen.findByText('EUMVPW5J5U2ZUQ5AL9L4');
    // The count is fixed at provisioning: rotate re-mints in place, and neither
    // adding nor removing a key is offered.
    expect(
      screen.queryByRole('button', { name: /Add key/ }),
    ).not.toBeInTheDocument();
    await openRowActions(0);
    expect(screen.getByText('Reveal')).toBeInTheDocument();
    expect(screen.getByText('Rotate')).toBeInTheDocument();
    expect(screen.queryByText('Revoke')).not.toBeInTheDocument();
  });

  it('offers only reveal without manage permission', async () => {
    vi.mocked(hasPermission).mockReturnValue(false);
    renderCard(KEYS);
    await screen.findByText('EUMVPW5J5U2ZUQ5AL9L4');
    await openRowActions(0);
    expect(screen.getByText('Reveal')).toBeInTheDocument();
    expect(screen.queryByText('Rotate')).not.toBeInTheDocument();
  });

  it('shows the standard empty state with no keys', async () => {
    vi.mocked(hasPermission).mockReturnValue(true);
    renderCard([]);
    expect(await screen.findByText('No api keys found')).toBeInTheDocument();
  });
});
