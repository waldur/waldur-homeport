import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invoiceItemsCreateCompensation } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { InvoiceItemCompensationDialog } from './InvoiceItemCompensationDialog';

const renderDialog = (props: any) => {
  renderWithProviders(<InvoiceItemCompensationDialog {...props} />);
};

describe('InvoiceItemCompensationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const resource = {
    uuid: 'invoice-item-uuid',
    name: 'Invoice Item 1',
    details: {
      offering_component_name: 'Test Component',
    },
  };

  it('renders correctly and submits valid data', async () => {
    const user = userEvent.setup();
    const refreshInvoiceItems = vi.fn();

    vi.mocked(invoiceItemsCreateCompensation).mockResolvedValue({} as any);

    renderDialog({
      resolve: {
        resource,
        refreshInvoiceItems,
      },
    });

    expect(
      await screen.findByText(
        'Create compensation for invoice item Invoice Item 1',
      ),
    ).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/Name/i);
    expect(nameInput).toHaveValue('Compensation for Test Component');

    await user.clear(nameInput);
    await user.type(nameInput, 'New Compensation Name');

    const submitBtn = screen.getByRole('button', { name: /Submit/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    await waitFor(() => {
      expect(invoiceItemsCreateCompensation).toHaveBeenCalledWith({
        path: { uuid: 'invoice-item-uuid' },
        body: { offering_component_name: 'New Compensation Name' },
      });
      expect(refreshInvoiceItems).toHaveBeenCalled();
    });
  });
});
