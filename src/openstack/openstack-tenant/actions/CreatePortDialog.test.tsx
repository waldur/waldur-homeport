import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openstackPortsCreate } from 'waldur-js-client';

import { loadNetworks, loadSubnets } from '@/openstack/api';
import { renderWithProviders } from '@/test/harness';

import { CreatePortDialog } from './CreatePortDialog';

vi.mock('@/openstack/api', () => ({
  loadNetworks: vi.fn(),
  loadSubnets: vi.fn(),
}));

const mockResource = {
  uuid: 'tenant-uuid',
  url: 'tenant-url',
};

const mockNetworks = [{ name: 'Network 1', uuid: 'net-1', url: 'net-1-url' }];

describe('CreatePortDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(loadNetworks).mockResolvedValue(mockNetworks);
    vi.mocked(loadSubnets).mockResolvedValue([]);
  });

  const renderDialog = () => {
    return renderWithProviders(
      <CreatePortDialog
        resolve={{ resource: mockResource, refetch: vi.fn() }}
      />,
    );
  };

  const mockSubnets = [
    {
      name: 'Subnet 1',
      uuid: 'sub-1',
      url: 'sub-1-url',
      backend_id: 'sub-1-backend',
    },
  ];

  it('renders correctly', async () => {
    renderDialog();
    expect(
      await screen.findByText('Create port for OpenStack network'),
    ).toBeDefined();
    expect(await screen.findByLabelText('Name')).toBeDefined();
    expect(await screen.findByLabelText('Network')).toBeDefined();
  });

  it('loads networks on mount', async () => {
    renderDialog();
    await waitFor(() => {
      expect(loadNetworks).toHaveBeenCalledWith({
        tenant_uuid: 'tenant-uuid',
        field: ['name', 'uuid', 'url'],
      });
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    renderDialog();

    const submitButton = await screen.findByText('Submit');
    await user.click(submitButton);

    expect(openstackPortsCreate).not.toHaveBeenCalled();
  });

  it('loads subnets when network is selected', async () => {
    const user = userEvent.setup();
    vi.mocked(loadSubnets).mockResolvedValue(mockSubnets);
    renderDialog();

    const networkSelect = await screen.findByLabelText('Network');
    // Open react-select and choose first option
    await user.click(networkSelect);
    const option = await screen.findByText('Network 1');
    await user.click(option);

    await waitFor(() => {
      expect(loadSubnets).toHaveBeenCalledWith({
        tenant_uuid: 'tenant-uuid',
        network_uuid: 'net-1',
      });
    });
  });

  it('toggles custom IP configuration and shows manual input', async () => {
    const user = userEvent.setup();
    vi.mocked(loadSubnets).mockResolvedValue(mockSubnets);
    renderDialog();

    // Select Network and Subnet first, otherwise fixed_ips is not initialized in form state
    const networkSelect = await screen.findByLabelText('Network');
    await user.click(networkSelect);
    await user.click(await screen.findByText('Network 1'));

    const subnetSelect = await screen.findByLabelText('Subnet');
    await user.click(subnetSelect);
    await user.click(await screen.findByText('Subnet 1'));

    const checkbox = await screen.findByLabelText('Custom IP configuration');
    expect(screen.queryByLabelText('Custom IP')).toBeNull();

    await user.click(checkbox);
    const customIpLabel = await screen.findByLabelText('Custom IP');
    expect(customIpLabel).toBeDefined();

    // Select 'Other' in Custom IP select
    await user.click(customIpLabel);
    const otherOption = await screen.findByText('Other (manual input)');
    await user.click(otherOption);

    // Should show the Enter custom IP placeholder
    expect(screen.getByPlaceholderText('Enter custom IP')).toBeDefined();
  });

  it('submits form with correct data', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackPortsCreate).mockResolvedValue({} as any);
    vi.mocked(loadSubnets).mockResolvedValue(mockSubnets);

    renderDialog();

    // Fill Name
    await user.type(await screen.findByLabelText('Name'), 'test-port');

    // Select Network
    await user.click(await screen.findByLabelText('Network'));
    await user.click(await screen.findByText('Network 1'));

    // Select Subnet
    await user.click(await screen.findByLabelText('Subnet'));
    await user.click(await screen.findByText('Subnet 1'));

    // Fill MAC
    await user.type(
      await screen.findByLabelText('MAC address'),
      '00:11:22:33:44:55',
    );

    // Submit
    await user.click(await screen.findByText('Submit'));

    await waitFor(() => {
      expect(openstackPortsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            name: 'test-port',
            mac_address: '00:11:22:33:44:55',
          }),
        }),
      );
    });
  });
});
