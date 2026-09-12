import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PublicOfferingComponentsTable } from './PublicOfferingComponentsTable';

const components = [
  {
    type: 'ram',
    name: 'RAM',
    measured_unit: 'MB',
    billing_type: 'limit',
    limit_period: 'month',
  },
  {
    type: 'gpu',
    name: 'GPU',
    measured_unit: 'GPU-hours',
    billing_type: 'usage',
    limit_period: null,
  },
];

// The table machinery needs a store; the column renderers are what is under
// test, so render each of them for every row directly.
vi.mock('@/table/useTable', () => ({
  useTable: () => ({ fetch: vi.fn(), rows: [] }),
}));

vi.mock('@/table/Table', () => ({
  default: (props: any) => (
    <div>
      {components.map((row) => (
        <div key={row.type} data-testid={`row-${row.type}`}>
          {props.columns.map((column: any, index: number) => (
            <div key={index}>{column.render({ row })}</div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

describe('PublicOfferingComponentsTable', () => {
  it('labels the billing type and limit period instead of the raw values', () => {
    render(
      <PublicOfferingComponentsTable
        offering={{ uuid: 'offering-1', components } as any}
      />,
    );

    const ram = screen.getByTestId('row-ram');
    expect(ram).toHaveTextContent('Limit-based');
    expect(ram).toHaveTextContent('Maximum monthly');
    expect(ram).not.toHaveTextContent(/\blimit\b/);

    const gpu = screen.getByTestId('row-gpu');
    expect(gpu).toHaveTextContent('Usage-based');
    // No period stored: a dash, not an empty cell.
    expect(gpu).toHaveTextContent('—');
  });
});
