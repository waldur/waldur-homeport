import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsUpdateIntegration } from 'waldur-js-client';

import { EditFieldDialog } from '@/form/EditFieldDialog';
import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { VMWARE_VM } from './constants';
import { VMwareCredentialsSection } from './VMwareCredentialsSection';

const offering = {
  uuid: 'offering-uuid',
  type: VMWARE_VM,
  scope_state: 'OK',
  secret_options: {},
  plugin_options: {},
  service_attributes: {
    backend_url: 'https://vcenter.example.org',
    username: 'waldur',
    default_cluster_label: 'Cluster',
    max_cpu: 8,
    max_ram: 32768,
    max_disk: 102400,
    max_disk_total: null,
  },
} as any;

const renderSection = () =>
  renderWithProviders(
    <VMwareCredentialsSection offering={offering} refetch={vi.fn()} />,
  );

describe('VMwareCredentialsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(marketplaceProviderOfferingsUpdateIntegration).mockResolvedValue({
      data: {},
    } as any);
  });

  it('shows the stored MiB maximums in GB', () => {
    renderSection();

    expect(screen.getByText('32 GB')).toBeInTheDocument();
    expect(screen.getByText('100 GB')).toBeInTheDocument();
    expect(screen.queryByText('32768')).not.toBeInTheDocument();
  });

  it('keeps storing MiB when a maximum is edited in GB', async () => {
    const user = userEvent.setup();
    renderSection();

    // The modal layer is mocked in unit tests: take the props the edit button
    // hands to it and render the dialog directly.
    const { openDialog } = useModal();
    vi.mocked(openDialog).mockClear();
    await user.click(screen.getByTestId('edit-service_attributes.max_ram'));
    const resolve = vi.mocked(openDialog).mock.calls[0][1].resolve;
    renderWithProviders(<EditFieldDialog resolve={resolve} />);

    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(32);

    await user.clear(input);
    await user.type(input, '64');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() =>
      expect(
        marketplaceProviderOfferingsUpdateIntegration,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            service_attributes: expect.objectContaining({ max_ram: 65536 }),
          }),
        }),
      ),
    );
  });
});
