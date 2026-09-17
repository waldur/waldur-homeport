import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  marketplaceOrdersApproveByProvider,
  marketplaceOrdersOfferingRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ApproveByProviderDialog } from './ApproveByProviderDialog';

vi.mock('../list/ResourceNameField', () => ({
  ResourceNameField: () => <span>resource</span>,
}));

const resourceOptions = {
  order: ['backups', 'account', 'reason'],
  options: {
    backups: { type: 'boolean', label: 'Backups' },
    account: {
      type: 'string',
      label: 'Backup account',
      required: true,
      visible_if: { field: 'backups', values: [true] },
    },
    reason: {
      type: 'string',
      label: 'Why no backups',
      visible_if: { field: 'backups', values: [false] },
    },
  },
};

const renderDialog = (attributes) => {
  vi.mocked(marketplaceOrdersOfferingRetrieve).mockResolvedValue({
    data: { resource_options: resourceOptions },
  } as any);
  vi.mocked(marketplaceOrdersApproveByProvider).mockResolvedValue({} as any);
  const order: any = {
    uuid: 'order-1',
    type: 'Update',
    attributes,
    project_name: 'Project',
    customer_name: 'Customer',
  };
  renderWithProviders(<ApproveByProviderDialog resolve={{ order }} />);
};

describe('ApproveByProviderDialog visible_if', () => {
  it('uses the stored options to decide which submitted rows are shown', async () => {
    // backups stays ticked on the resource, so only the account is visible.
    renderDialog({
      old_options: { backups: true, account: 'old' },
      new_options: { account: 'new', reason: 'stale' },
    });
    expect(await screen.findByText('Backup account')).toBeInTheDocument();
    expect(screen.queryByText('Why no backups')).not.toBeInTheDocument();
  });

  it('hides rows and drops values once the controlling option changes', async () => {
    const user = userEvent.setup();
    renderDialog({
      old_options: { backups: true, account: 'old' },
      new_options: { backups: true, account: 'new', reason: 'stale' },
    });
    expect(await screen.findByText('Backup account')).toBeInTheDocument();
    expect(screen.queryByText('Why no backups')).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox'));
    expect(screen.queryByText('Backup account')).not.toBeInTheDocument();
    expect(screen.getByText('Why no backups')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() =>
      expect(marketplaceOrdersApproveByProvider).toHaveBeenCalledWith({
        path: { uuid: 'order-1' },
        body: {
          attributes: { new_options: { backups: false, reason: 'stale' } },
        },
      }),
    );
  });

  it('does not require a hidden required option', async () => {
    const user = userEvent.setup();
    renderDialog({
      old_options: { backups: false },
      new_options: { account: '' },
    });
    await screen.findByRole('button', { name: 'Approve' });
    expect(screen.queryByText('Backup account')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() =>
      expect(marketplaceOrdersApproveByProvider).toHaveBeenCalledWith({
        path: { uuid: 'order-1' },
        body: undefined,
      }),
    );
  });
});
