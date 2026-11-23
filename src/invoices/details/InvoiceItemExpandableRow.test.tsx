import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { InvoiceItemExpandableRow } from './InvoiceItemExpandableRow';

const item = (overrides: object) =>
  ({
    uuid: 'item',
    name: 'Item name',
    start: '2026-11-01T00:00:00Z',
    end: '2026-11-30T23:59:59Z',
    unit: 'month',
    quantity: '1',
    unit_price: '10.00',
    price: '10.00',
    total: '10.00',
    details: {},
    ...overrides,
  }) as any;

const renderRow = (items: any[]) =>
  renderWithProviders(
    <InvoiceItemExpandableRow
      row={{ hasPlanChange: false } as any}
      invoice={{ uuid: 'inv', state: 'pending' } as any}
      items={items}
      refresh={() => undefined}
    />,
  );

describe('InvoiceItemExpandableRow', () => {
  it('names an item by its component when it has one', () => {
    renderRow([
      item({
        name: 'Long generated name',
        details: { offering_component_name: 'CPU hours' },
      }),
    ]);

    expect(screen.getByText('CPU hours')).toBeInTheDocument();
  });

  it('falls back to the item name when there is no component', () => {
    renderRow([
      item({ uuid: 'a', name: 'Arrow consumption: Fabrikam Azure' }),
      item({ uuid: 'b', name: 'Arrow consumption adjustment: Fabrikam Azure' }),
    ]);

    expect(
      screen.getByText('Arrow consumption: Fabrikam Azure'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Arrow consumption adjustment: Fabrikam Azure'),
    ).toBeInTheDocument();
  });
});
