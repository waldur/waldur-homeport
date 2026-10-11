import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { combineReducers, legacy_createStore as createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { INITIAL_STATE } from '@/table/constants';
import { reducer as tableReducer } from '@/table/store';
import { renderWithProviders } from '@/test/harness';

import { InvitationList } from './InvitationList';

// Rows are supplied through the seeded redux table state, so no real request
// fires — the list renders through the real @/table/Table.
vi.mock('@/table/useTableQuery', () => ({
  useTableQuery: () => ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

const invitation = {
  uuid: '5b9a1d3e6c7f4a8e9b2d1c0f3e4a5b6c',
  email: 'alice@example.com',
  scope_type: 'customer',
  scope_name: 'Acme Research',
  scope_uuid: 'customer-1',
  role_name: 'CUSTOMER.OWNER',
  state: 'pending',
  created: '2026-08-18T10:00:00Z',
  expires: '2026-09-18T10:00:00Z',
};

// A real store, not redux-mock-store: expanding a row dispatches TOGGLE_ROW,
// which only takes effect if the reducer actually runs.
const makeStore = () =>
  createStore(combineReducers({ tables: tableReducer }), {
    tables: {
      'admin-invitations': {
        ...INITIAL_STATE,
        entities: { [invitation.uuid]: invitation },
        order: [invitation.uuid],
        pagination: { pageSize: 10, resultCount: 1, currentPage: 1 },
      },
    },
  } as any);

describe('InvitationList', () => {
  it('shows the invitation link in an expandable row', async () => {
    renderWithProviders(
      <Provider store={makeStore()}>
        <DrawerProvider>
          <InvitationList />
        </DrawerProvider>
      </Provider>,
    );

    expect(await screen.findByText('alice@example.com')).toBeInTheDocument();
    expect(screen.queryByTestId('expanded-row-cell')).toBeNull();

    // The status text is neither a link nor a button, so the click bubbles to
    // the row itself rather than being swallowed.
    await userEvent.click(screen.getByText('Pending'));

    const expanded = await screen.findByTestId('expanded-row-cell');
    expect(expanded).toHaveTextContent(
      `Invitation link: ${location.origin}/invitation/${invitation.uuid}/`,
    );
  });
});
