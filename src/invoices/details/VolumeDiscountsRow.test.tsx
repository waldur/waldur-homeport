import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Table, TableBody } from 'waldur-ui';

import { VolumeDiscountsRow } from './VolumeDiscountsRow';

// A row needs a table around it to render; the markup only hosts the row.
const renderRow = (
  invoice: { state: any; volume_discounts: any },
  includedIn: 'subtotal' | 'total' = 'subtotal',
) =>
  render(
    <Table>
      <TableBody>
        <VolumeDiscountsRow
          invoice={invoice}
          labelColSpan={1}
          includedIn={includedIn}
        />
      </TableBody>
    </Table>,
  );

describe('VolumeDiscountsRow', () => {
  it('calls the discounts of an open invoice estimated', () => {
    renderRow({ state: 'pending', volume_discounts: -50 });
    expect(screen.getByText('Estimated volume discounts')).toBeTruthy();
    expect(screen.getByText('(included in subtotal)')).toBeTruthy();
  });

  it('calls the discounts of a closed invoice final', () => {
    renderRow({ state: 'created', volume_discounts: -50 }, 'total');
    expect(screen.getByText('Volume discounts')).toBeTruthy();
    expect(screen.getByText('(included in total)')).toBeTruthy();
  });

  it('shows a small discount that still prints as non-zero', () => {
    renderRow({ state: 'pending', volume_discounts: -0.003 });
    expect(screen.getByText('Estimated volume discounts')).toBeTruthy();
  });

  it('leaves the row out when there is nothing to show', () => {
    renderRow({ state: 'pending', volume_discounts: 0 });
    expect(screen.queryByRole('row')).toBeNull();
  });

  it('leaves out an amount that would print as zero', () => {
    renderRow({ state: 'pending', volume_discounts: -0.00001 });
    expect(screen.queryByRole('row')).toBeNull();
  });
});
