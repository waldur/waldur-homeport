import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invoiceItemsPartialUpdate } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { InvoiceItemUpdateDialog } from './InvoiceItemUpdateDialog';

const fakeResourceFixed = {
  uuid: 'res-fixed',
  name: 'Fixed Server',
  billing_type: 'fixed',
  article_code: 'ART-01',
  unit_price: 100,
  start: '2026-05-01T00:00:00Z',
  end: '2026-05-31T23:59:59Z',
};

const fakeResourceUsage = {
  uuid: 'res-usage',
  name: 'Usage Server',
  billing_type: 'usage',
  article_code: 'ART-02',
  unit_price: 10,
  quantity: 50,
};

const renderDialog = (resource) => {
  return renderWithProviders(
    <InvoiceItemUpdateDialog
      resolve={{
        resource,
        refreshInvoiceItems: vi.fn(),
      }}
    />,
  );
};

describe('InvoiceItemUpdateDialog', () => {
  beforeEach(() => {
    vi.mocked(invoiceItemsPartialUpdate).mockResolvedValue({} as any);
    vi.clearAllMocks();
  });

  it('renders correctly for fixed billing type', () => {
    renderDialog(fakeResourceFixed);

    expect(screen.getByText('Update invoice item')).toBeInTheDocument();

    const articleInput = screen.getByLabelText('Article code');
    expect(articleInput).toHaveValue('ART-01');

    const priceInput = screen.getByLabelText('Unit price');
    expect(priceInput).toHaveValue(100);

    const startInput = screen.getByLabelText(
      'Date and time when item usage has started',
    );
    // For date inputs, we check they exist and we can update them.
    expect(startInput).toBeInTheDocument();

    const endInput = screen.getByLabelText(
      'Date and time when item usage has ended',
    );
    expect(endInput).toBeInTheDocument();

    expect(screen.queryByLabelText('Quantity')).not.toBeInTheDocument();
  });

  it('renders correctly for usage billing type and submits', async () => {
    const user = userEvent.setup();
    renderDialog(fakeResourceUsage);

    expect(screen.getByText('Update invoice item')).toBeInTheDocument();

    const articleInput = screen.getByLabelText('Article code');
    expect(articleInput).toHaveValue('ART-02');

    const priceInput = screen.getByLabelText('Unit price');
    expect(priceInput).toHaveValue(10);

    const quantityInput = screen.getByLabelText('Quantity');
    expect(quantityInput).toHaveValue(50);

    // It should not render start/end for usage type
    expect(
      screen.queryByLabelText('Date and time when item usage has started'),
    ).not.toBeInTheDocument();

    // Modify
    await user.clear(articleInput);
    await user.type(articleInput, 'ART-NEW');

    await user.clear(priceInput);
    await user.type(priceInput, '20');

    await user.clear(quantityInput);
    await user.type(quantityInput, '60');

    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(invoiceItemsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'res-usage' },
        body: {
          article_code: 'ART-NEW',
          unit_price: '20',
          quantity: '60',
        },
      });
    });
  });
});
