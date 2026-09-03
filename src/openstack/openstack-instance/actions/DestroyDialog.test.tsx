import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceResourcesTerminate } from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { DestroyDialog } from './DestroyDialog';

const resource = {
  uuid: 'instance-uuid',
  name: 'web-1',
  marketplace_resource_uuid: 'marketplace-uuid',
};

const renderDialog = (refetch = vi.fn()) =>
  renderWithProviders(
    <DestroyDialog resolve={{ resource: resource as any, refetch }} />,
  );

describe('DestroyDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('names the instance and warns that backups and snapshots will be deleted', () => {
    renderDialog();

    expect(screen.getByText('Destroy instance')).toBeInTheDocument();
    expect(screen.getByText(/Instance name/)).toBeInTheDocument();
    expect(screen.getByText(/web-1/)).toBeInTheDocument();
    expect(
      screen.getByText(
        'The instance will be stopped if it is running. Existing backups and volume snapshots will be deleted.',
      ),
    ).toBeInTheDocument();
  });

  it('defaults delete volumes and release floating IPs to on', () => {
    renderDialog();

    expect(
      screen.getByRole('checkbox', { name: 'Delete volumes' }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', { name: 'Release floating IPs' }),
    ).toBeChecked();
  });

  it('terminates the marketplace resource without force_destroy', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(marketplaceResourcesTerminate).mockResolvedValue({
      data: { order_uuid: 'order-uuid' },
    } as any);

    renderDialog(refetch);

    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(marketplaceResourcesTerminate).toHaveBeenCalledWith({
        path: { uuid: 'marketplace-uuid' },
        body: {
          attributes: {
            delete_volumes: true,
            release_floating_ips: true,
          },
        },
      });
    });
    expect(marketplaceResourcesTerminate).toHaveBeenCalledTimes(1);
    expect(refetch).toHaveBeenCalled();
    expect(useNotify().showSuccess).toHaveBeenCalledWith(
      'Instance deletion has been scheduled.',
    );
  });

  it('sends the checkbox values in the terminate attributes', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceResourcesTerminate).mockResolvedValue({
      data: { order_uuid: 'order-uuid' },
    } as any);

    renderDialog();

    await user.click(screen.getByRole('checkbox', { name: 'Delete volumes' }));
    await user.click(
      screen.getByRole('checkbox', { name: 'Release floating IPs' }),
    );
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(marketplaceResourcesTerminate).toHaveBeenCalledWith({
        path: { uuid: 'marketplace-uuid' },
        body: {
          attributes: {
            delete_volumes: false,
            release_floating_ips: false,
          },
        },
      });
    });
  });
});
