import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { combineReducers, legacy_createStore as createStore } from 'redux';
import { describe, expect, it, vi } from 'vitest';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { TABLE_PENDING_PROVIDER_PUBLIC_ORDERS } from '@/marketplace/orders/list/constants';
import { INITIAL_STATE } from '@/table/constants';
import { setTableQueryRows } from '@/table/mockTableQuery';
import { reducer as tableReducer } from '@/table/store';
import { renderWithProviders } from '@/test/harness';

import { PendingProviderOrders } from './PendingProviderOrders';

// Serves the rows given to setTableQueryRows (none by default); no request fires.
vi.mock('@/table/useTableQuery', () => import('@/table/mockTableQuery'));

const order = {
  uuid: 'order-1',
  slug: 'ORD-42',
  offering_name: 'Cloud offering',
  resource_name: 'vm-prod-01',
  customer_name: 'Acme Ltd',
  project_name: 'Research',
  created_by_full_name: 'Ada Lovelace',
  created: '2026-08-18T10:00:00Z',
  state: 'pending-provider',
  type: 'Update',
  limits: { cpu: 4, ram: 16 },
  attributes: { name: 'vm-prod-01' },
};

// A real store, not redux-mock-store: expanding a row dispatches TOGGLE_ROW,
// which only takes effect if the reducer actually runs.
const makeStore = () => {
  setTableQueryRows([order]);
  return createStore(combineReducers({ tables: tableReducer }), {
    tables: {
      [TABLE_PENDING_PROVIDER_PUBLIC_ORDERS]: {
        ...INITIAL_STATE,
        pagination: { pageSize: 10, resultCount: 1, currentPage: 1 },
      },
    },
  } as any);
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={makeStore()}>
    <DrawerProvider>{children}</DrawerProvider>
  </Provider>
);

describe('PendingProviderOrders', () => {
  it('opens the pending order details in an expandable row', async () => {
    renderWithProviders(
      <Wrapper>
        <PendingProviderOrders />
      </Wrapper>,
    );

    expect(await screen.findByText('Cloud offering')).toBeInTheDocument();
    expect(screen.queryByTestId('expanded-row-cell')).toBeNull();

    // Organization is a plain cell, so the click bubbles to the row itself
    // rather than being swallowed by a link or a button.
    await userEvent.click(screen.getByText('Acme Ltd'));

    // The tabbed details of PendingOrderExpandableRow: dropping the
    // expandableRow wiring leaves the row inert and this assertion fails.
    const expanded = await screen.findByTestId('expanded-row-cell');
    expect(expanded).toHaveTextContent('ORD-42');
    expect(
      await screen.findByRole('tab', { name: /Limits\s*2/ }),
    ).toBeInTheDocument();
  });
});
