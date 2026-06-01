import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { InvoiceItemsTable } from './InvoiceItemsTable';

const fetchSpy = vi.fn();

// Control the table's own refetch and bypass real React Query / SDK calls.
vi.mock('@/table/useTable', () => ({
  useTable: () => ({ fetch: fetchSpy, rows: [], pagination: {} }),
}));

// Stub the heavy Table: just invoke the expandableRow render so we can reach
// the `refresh` callback the per-row actions receive.
vi.mock('@/table/Table', () => ({
  default: (props: any) => (
    <div>{props.expandableRow({ row: { items: [] } })}</div>
  ),
}));

// Expose the `refresh` prop as a clickable button.
vi.mock('./InvoiceItemExpandableRow', () => ({
  InvoiceItemExpandableRow: (props: any) => (
    <button onClick={() => props.refresh()}>trigger-refresh</button>
  ),
}));

vi.mocked(workspaceHooks.useUser).mockReturnValue({ is_staff: true } as any);
vi.mocked(workspaceHooks.useCustomer).mockReturnValue({ uuid: 'c1' } as any);

const invoice = {
  uuid: 'inv-1',
  customer: '/api/customers/c1/',
  number: 7,
  year: 2026,
  month: 6,
} as any;

describe('InvoiceItemsTable', () => {
  it('refreshes the items table (not just the invoice header) when a per-row action fires', async () => {
    const refreshInvoiceItems = vi.fn();
    fetchSpy.mockClear();

    renderWithProviders(
      <InvoiceItemsTable
        invoice={invoice}
        refreshInvoiceItems={refreshInvoiceItems}
      />,
    );

    await userEvent.click(screen.getByText('trigger-refresh'));

    // Regression guard: the deleted row stays on screen unless the table's own
    // React Query cache is invalidated. Refetching the invoice header is not enough.
    expect(fetchSpy).toHaveBeenCalledWith(true);
    expect(refreshInvoiceItems).toHaveBeenCalled();
  });
});
