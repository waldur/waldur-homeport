import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesTerminate } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { MultiTerminateDialog } from './MultiTerminateDialog';

const instance = (uuid: string) => ({
  uuid,
  name: uuid,
  resource_type: 'OpenStack.Instance',
});

const volume = (uuid: string) => ({
  uuid,
  name: uuid,
  resource_type: 'OpenStack.Volume',
});

const renderDialog = (rows, refetch = vi.fn()) =>
  renderWithProviders(
    <MultiTerminateDialog resolve={{ rows: rows as any, refetch }} />,
  );

describe('MultiTerminateDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceResourcesTerminate).mockResolvedValue({
      data: { order_uuid: 'order-uuid' },
    } as any);
  });

  it('warns about backups and snapshots and asks about volumes and floating IPs, both on', () => {
    renderDialog([instance('i1'), instance('i2')]);

    expect(screen.getByText('2 resources selected')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Running instances will be stopped. Existing backups and volume snapshots of the instances will be deleted.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: 'Delete volumes' }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Release floating IPs' }),
    ).toBeChecked();
    expect(
      screen.queryByText(/The options below apply only to OpenStack instances/),
    ).not.toBeInTheDocument();
  });

  it('sends the default attributes for every instance', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    renderDialog([instance('i1'), instance('i2')], refetch);

    await user.click(screen.getByRole('button', { name: 'Terminate' }));

    await waitFor(() => {
      expect(marketplaceResourcesTerminate).toHaveBeenCalledTimes(2);
    });
    for (const uuid of ['i1', 'i2']) {
      expect(marketplaceResourcesTerminate).toHaveBeenCalledWith({
        path: { uuid },
        body: {
          attributes: { delete_volumes: true, release_floating_ips: true },
        },
      });
    }
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it('keeps volumes and floating IPs when the options are unchecked', async () => {
    const user = userEvent.setup();
    renderDialog([instance('i1')]);

    await user.click(screen.getByRole('checkbox', { name: 'Delete volumes' }));
    await user.click(
      screen.getByRole('checkbox', { name: 'Release floating IPs' }),
    );
    await user.click(screen.getByRole('button', { name: 'Terminate' }));

    await waitFor(() => {
      expect(marketplaceResourcesTerminate).toHaveBeenCalledWith({
        path: { uuid: 'i1' },
        body: {
          attributes: { delete_volumes: false, release_floating_ips: false },
        },
      });
    });
  });

  it('sends the attributes only for the instances in a mixed selection', async () => {
    const user = userEvent.setup();
    renderDialog([instance('i1'), volume('v1')]);

    expect(
      screen.getByText(
        /The options below apply only to OpenStack instances \(1 of the selected resources\)\./,
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Delete volumes' }));
    await user.click(screen.getByRole('button', { name: 'Terminate' }));

    await waitFor(() => {
      expect(marketplaceResourcesTerminate).toHaveBeenCalledTimes(2);
    });
    expect(marketplaceResourcesTerminate).toHaveBeenCalledWith({
      path: { uuid: 'i1' },
      body: {
        attributes: { delete_volumes: false, release_floating_ips: true },
      },
    });
    expect(marketplaceResourcesTerminate).toHaveBeenCalledWith({
      path: { uuid: 'v1' },
    });
  });

  it('closes after a partial failure, so the rows that went through are not sent again', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(marketplaceResourcesTerminate)
      .mockResolvedValueOnce({ data: { order_uuid: 'order-uuid' } } as any)
      .mockRejectedValueOnce(new Error('Pending order already exists.'));
    renderDialog([instance('i1'), instance('i2')], refetch);

    await user.click(screen.getByRole('button', { name: 'Terminate' }));

    await waitFor(() => expect(useModal().closeDialog).toHaveBeenCalled());
    expect(marketplaceResourcesTerminate).toHaveBeenCalledTimes(2);
    expect(refetch).toHaveBeenCalled();
  });
});
