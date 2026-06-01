import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invoiceItemsMigrateTo, invoicesList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';
import { useCustomer } from '@/workspace/hooks';

import { InvoiceItemMoveDialog } from './InvoiceItemMoveDialog';

const fakeCustomer = {
  url: '/api/customers/uuid/',
};

const fakeInvoice = {
  url: '/api/invoices/invoice-1/',
  year: 2026,
  month: 5,
};

const fakeResource = {
  uuid: 'resource-uuid',
  name: 'Test Resource',
};

const renderDialog = () => {
  return renderWithProviders(
    <InvoiceItemMoveDialog
      resolve={{
        invoice: fakeInvoice,
        resource: fakeResource,
        refreshInvoiceItems: vi.fn(),
      }}
    />,
  );
};

describe('InvoiceItemMoveDialog', () => {
  beforeEach(() => {
    vi.mocked(useCustomer).mockReturnValue(fakeCustomer as any);
    vi.clearAllMocks();
  });

  it('renders correctly and loads invoice options', async () => {
    vi.mocked(invoicesList).mockResolvedValue(
      mockListResponse([
        {
          url: '/api/invoices/invoice-2/',
          year: 2026,
          month: 6,
          number: 'INV-02',
        },
        {
          url: '/api/invoices/invoice-1/',
          year: 2026,
          month: 5,
          number: 'INV-01',
        }, // current
      ]),
    );

    renderDialog();

    expect(
      screen.getByText('Move item Test Resource from invoice 2026-5'),
    ).toBeInTheDocument();
    expect(screen.getByText('Target invoice')).toBeInTheDocument();

    await waitFor(() => {
      expect(invoicesList).toHaveBeenCalledWith({
        path: {},
        query: expect.objectContaining({
          customer: fakeCustomer.url,
          field: ['url', 'number', 'year', 'month'],
        }),
      });
    });

    const select = screen.getByRole('combobox', { name: 'Target invoice' });
    await userEvent.click(select);

    // Option 2026-6 should be present
    expect(await screen.findByText('2026-6')).toBeInTheDocument();

    // The current invoice (2026-5) should be present but disabled
    const disabledOption = screen.getByText('2026-5');
    expect(disabledOption).toBeInTheDocument();
    expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
  });

  it('submits form successfully', async () => {
    const user = userEvent.setup();
    vi.mocked(invoicesList).mockResolvedValue(
      mockListResponse([
        {
          url: '/api/invoices/invoice-2/',
          year: 2026,
          month: 6,
          number: 'INV-02',
        },
      ]),
    );
    vi.mocked(invoiceItemsMigrateTo).mockResolvedValue({} as any);

    renderDialog();

    // Select invoice
    await user.click(screen.getByRole('combobox', { name: 'Target invoice' }));
    await user.click(await screen.findByText('2026-6'));

    // Submit
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(invoiceItemsMigrateTo).toHaveBeenCalledWith({
        path: { uuid: 'resource-uuid' },
        body: {
          invoice: '/api/invoices/invoice-2/',
        },
      });
    });
  });
});
