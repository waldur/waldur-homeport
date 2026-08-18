import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, expect, it } from 'vitest';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { renderWithProviders } from '@/test/harness';

import { PendingOrderExpandableRow } from './PendingOrderExpandableRow';

const order = {
  uuid: 'order-1',
  slug: 'ORD-42',
  offering_name: 'Cloud offering',
  resource_name: 'vm-prod-01',
  customer_name: 'Acme Ltd',
  project_name: 'Research',
  plan_name: 'Standard',
  created_by_full_name: 'Ada Lovelace',
  created: '2026-08-18T10:00:00Z',
  state: 'pending-consumer',
  type: 'Update',
  limits: { cpu: 4, ram: 16 },
  attributes: { name: 'vm-prod-01', description: 'batch node' },
} as any;

const renderRow = (row = order) =>
  renderWithProviders(
    <Provider store={configureStore()({ tables: {} })}>
      <DrawerProvider>
        <PendingOrderExpandableRow row={row} />
      </DrawerProvider>
    </Provider>,
  );

describe('PendingOrderExpandableRow', () => {
  it('opens on metadata and leaves out what the row already shows', () => {
    renderRow();

    expect(screen.getByText('ORD-42')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();

    // Offering, organization and project are columns of the row being
    // expanded; repeating them in the nested details would be noise.
    expect(screen.queryByText('Cloud offering')).toBeNull();
    expect(screen.queryByText('Acme Ltd')).toBeNull();
    expect(screen.queryByText('Research')).toBeNull();
  });

  it('counts limits and submitted fields on their tabs', async () => {
    renderRow();

    // `name` duplicates the Resource column, so it is not counted as a
    // submitted field: 2 attributes in, 1 listed.
    expect(screen.getByRole('tab', { name: /Limits\s*2/ })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /User submitted fields\s*1/ }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('tab', { name: /Limits/ }));
    expect(await screen.findByText('cpu')).toBeInTheDocument();
  });

  it('shows the previous value only when the order changes existing limits', () => {
    renderRow({
      ...order,
      attributes: { ...order.attributes, old_limits: { cpu: 2 } },
    });

    expect(screen.getByRole('tab', { name: /Limits\s*2/ })).toBeInTheDocument();
    // old_limits is rendered by the Limits tab, so it is not a submitted field.
    expect(
      screen.getByRole('tab', { name: /User submitted fields\s*1/ }),
    ).toBeInTheDocument();
  });
});
