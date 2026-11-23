import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invoiceItemsList, invoicesRetrieve } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { getItemKind, ViewInvoiceItemsDialog } from './ViewInvoiceItemsDialog';

const item = (uuid: string, start: string, price: string, details: object) =>
  ({
    uuid,
    name: `Item ${uuid}`,
    invoice: `https://example.com/api/invoices/inv-${uuid}/`,
    customer_uuid: 'customer',
    start,
    end: start,
    price,
    details,
  }) as any;

const RESOURCE = {
  uuid: 'resource',
  name: 'Fabrikam Azure',
  attributes: { arrow_license_reference: 'XSP-LIC-2' },
} as any;

describe('getItemKind', () => {
  it('tells Arrow item kinds apart', () => {
    expect(
      getItemKind(item('a', '', '0', { source: 'arrow_consumption' })),
    ).toBe('consumption');
    expect(getItemKind(item('a', '', '0', { source: 'arrow_finalized' }))).toBe(
      'consumption',
    );
    expect(
      getItemKind(item('a', '', '0', { source: 'arrow_reconciliation' })),
    ).toBe('adjustment');
    expect(
      getItemKind(
        item('a', '', '0', { source: 'arrow', arrow_line_reference: '1' }),
      ),
    ).toBe('billing_line');
    expect(
      getItemKind(
        item('a', '', '0', { source: 'arrow', subscription_id: 's' }),
      ),
    ).toBe('import');
    expect(getItemKind(item('a', '', '0', {}))).toBeNull();
  });
});

describe('ViewInvoiceItemsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // inv-oct is the October invoice, inv-nov November's.
    vi.mocked(invoicesRetrieve).mockImplementation(
      ({ path }: any) =>
        Promise.resolve({
          data: {
            uuid: path.uuid,
            year: 2026,
            month: path.uuid === 'inv-oct' ? 10 : 11,
            state: path.uuid === 'inv-oct' ? 'created' : 'pending',
          },
        }) as any,
    );
  });

  it('lists the items by their invoice month, newest first', async () => {
    vi.mocked(invoiceItemsList).mockResolvedValue(
      mockListResponse([
        // Its own dates say November, but it is on the October invoice.
        item('oct', '2026-11-01T00:00:00Z', '10.00', {
          source: 'arrow',
          arrow_line_reference: '7',
        }),
        item('nov', '2026-11-01T00:00:00Z', '40.00', {
          source: 'arrow_reconciliation',
        }),
      ]),
    );

    renderWithProviders(
      <ViewInvoiceItemsDialog resolve={{ resource: RESOURCE }} />,
    );

    const first = await screen.findByText('Item nov');
    const second = screen.getByText('Item oct');
    expect(
      first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText('Adjustment')).toBeInTheDocument();
    expect(screen.getByText('October 2026')).toBeInTheDocument();
    expect(screen.getByText('November 2026')).toBeInTheDocument();
    expect(screen.getByText(/50\.00/)).toBeInTheDocument();
    expect(invoiceItemsList).toHaveBeenCalledWith({
      query: expect.objectContaining({ resource_uuid: 'resource' }),
    });
  });

  it('explains when there are no items', async () => {
    vi.mocked(invoiceItemsList).mockResolvedValue(mockListResponse([]));

    renderWithProviders(
      <ViewInvoiceItemsDialog resolve={{ resource: RESOURCE }} />,
    );

    expect(
      await screen.findByText('No invoice items for this resource yet.'),
    ).toBeInTheDocument();
  });

  it('keeps listing items when an invoice fails to load', async () => {
    vi.mocked(invoiceItemsList).mockResolvedValue(
      mockListResponse([
        item('oct', '2026-10-01T00:00:00Z', '10.00', {}),
        item('nov', '2026-11-01T00:00:00Z', '40.00', {}),
      ]),
    );
    vi.mocked(invoicesRetrieve).mockImplementation(({ path }: any) =>
      path.uuid === 'inv-oct'
        ? (Promise.reject(new Error('forbidden')) as any)
        : (Promise.resolve({
            data: { uuid: path.uuid, year: 2026, month: 11, state: 'pending' },
          }) as any),
    );

    renderWithProviders(
      <ViewInvoiceItemsDialog resolve={{ resource: RESOURCE }} />,
    );

    expect(await screen.findByText('Item oct')).toBeInTheDocument();
    expect(screen.getByText('Item nov')).toBeInTheDocument();
  });

  it('leaves canceled invoices out of the total', async () => {
    vi.mocked(invoiceItemsList).mockResolvedValue(
      mockListResponse([
        item('oct', '2026-10-01T00:00:00Z', '100.00', {}),
        item('nov', '2026-11-01T00:00:00Z', '40.00', {}),
      ]),
    );
    vi.mocked(invoicesRetrieve).mockImplementation(
      ({ path }: any) =>
        Promise.resolve({
          data: {
            uuid: path.uuid,
            year: 2026,
            month: path.uuid === 'inv-oct' ? 10 : 11,
            state: path.uuid === 'inv-oct' ? 'canceled' : 'pending',
          },
        }) as any,
    );

    renderWithProviders(
      <ViewInvoiceItemsDialog resolve={{ resource: RESOURCE }} />,
    );

    await screen.findByText('Item oct');
    // The November item and the total.
    expect(screen.getAllByText(/^.40\.00$/)).toHaveLength(2);
    expect(screen.queryByText(/140\.00/)).not.toBeInTheDocument();
  });
});
