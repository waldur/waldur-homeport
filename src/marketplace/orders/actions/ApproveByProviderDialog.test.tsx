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

const renderDialog = (attributes, options: any = resourceOptions) => {
  vi.mocked(marketplaceOrdersOfferingRetrieve).mockResolvedValue({
    data: { resource_options: options },
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

describe('ApproveByProviderDialog option errors', () => {
  it('shows an error about an option next to its field', async () => {
    const user = userEvent.setup();
    renderDialog({
      old_options: { backups: true, account: 'old' },
      new_options: { backups: true, account: 'shared' },
    });
    // The SDK spreads the DRF body onto the thrown error; mastermind nests
    // an option error under `attributes`.
    vi.mocked(marketplaceOrdersApproveByProvider).mockRejectedValue({
      attributes: {
        account: [
          'This value is already used by another resource of this offering.',
        ],
      },
      status: 400,
    });

    await user.click(await screen.findByRole('button', { name: 'Approve' }));

    expect(
      await screen.findByText(
        'This value is already used by another resource of this offering.',
      ),
    ).toBeInTheDocument();
  });
});

describe('ApproveByProviderDialog model selection', () => {
  const modelOptions = {
    order: ['models'],
    options: {
      models: {
        type: 'select_string_multi',
        label: 'Models',
        choices: ['gpt-4o', 'llama-3'],
      },
    },
  };

  it('shows a requested All models as ticked and lets the provider narrow it', async () => {
    const user = userEvent.setup();
    renderDialog(
      { old_options: { models: ['gpt-4o'] }, new_options: { models: ['*'] } },
      modelOptions,
    );
    const allModels = await screen.findByLabelText('All models');
    expect(allModels).toBeChecked();
    expect(screen.getByLabelText('llama-3')).toBeDisabled();

    await user.click(allModels);
    await user.click(screen.getByLabelText('llama-3'));
    await user.click(screen.getByRole('button', { name: 'Approve' }));
    await waitFor(() =>
      expect(marketplaceOrdersApproveByProvider).toHaveBeenCalledWith({
        path: { uuid: 'order-1' },
        body: { attributes: { new_options: { models: ['llama-3'] } } },
      }),
    );
  });
});

describe('ApproveByProviderDialog transform', () => {
  it('previews the value that will be saved for a new value', async () => {
    vi.mocked(marketplaceOrdersOfferingRetrieve).mockResolvedValue({
      data: {
        resource_options: {
          order: ['bucket'],
          options: {
            bucket: {
              type: 'string',
              label: 'Bucket',
              pattern: '[A-Za-z]+',
              transform: { prefix: 'acme-', suffix: '-prod', case: 'lower' },
            },
          },
        },
      },
    } as any);
    const order: any = {
      uuid: 'order-1',
      type: 'Update',
      attributes: {
        old_options: { bucket: 'acme-old-prod' },
        new_options: { bucket: 'acme-new-prod' },
      },
      project_name: 'Project',
      customer_name: 'Customer',
    };
    renderWithProviders(<ApproveByProviderDialog resolve={{ order }} />);
    // The submitted, already transformed value is not prefixed again.
    expect(
      await screen.findByTestId('option-transform-preview'),
    ).toHaveTextContent('Will be saved as acme-new-prod');

    const input = screen.getByDisplayValue('acme-new-prod');
    await userEvent.clear(input);
    await userEvent.type(input, 'Renamed');
    expect(screen.getByTestId('option-transform-preview')).toHaveTextContent(
      'Will be saved as acme-renamed-prod',
    );

    // No preview for a value that would not be saved.
    await userEvent.type(input, '-2');
    expect(
      screen.queryByTestId('option-transform-preview'),
    ).not.toBeInTheDocument();
  });
});
