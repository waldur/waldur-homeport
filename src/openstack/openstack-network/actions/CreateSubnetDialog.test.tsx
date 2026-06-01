import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openstackNetworksCreateSubnet,
  openstackNetworksList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { mockListResponse } from '@/test/utils';

import { CreateSubnetDialog } from './CreateSubnetDialog';

const fakeResource = {
  name: 'Network',
  uuid: 'network-uuid',
};

const renderDialog = (resource = fakeResource, showNetworkField = false) => {
  return renderWithProviders(
    <CreateSubnetDialog
      resolve={{
        resource: resource as any,
        refetch: vi.fn(),
        showNetworkField,
      }}
    />,
  );
};

describe('CreateSubnetDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correct title and fields', () => {
    renderDialog();
    expect(screen.getByText('Create subnet')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Internal network mask \(CIDR\)/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
  });

  it('submits form with correct data when showNetworkField is false', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackNetworksCreateSubnet).mockResolvedValue({} as any);
    renderDialog();

    await user.type(screen.getByLabelText(/Name/), 'test-subnet');

    const cidrInput = screen.getByLabelText(/Internal network mask \(CIDR\)/);
    await user.clear(cidrInput);
    await user.type(cidrInput, '10.0.0.0/24');

    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(openstackNetworksCreateSubnet).toHaveBeenCalledWith({
        path: { uuid: 'network-uuid' },
        body: expect.objectContaining({
          name: 'test-subnet',
          cidr: '10.0.0.0/24',
          allocation_pools: expect.arrayContaining([
            expect.objectContaining({
              start: '10.0.0.2',
              end: '10.0.0.254',
            }),
          ]),
        }),
      });
    });
  });

  it('renders and selects network when showNetworkField is true', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackNetworksList).mockResolvedValue(
      mockListResponse([
        { name: 'Selected Network', uuid: 'selected-network-uuid' },
      ]),
    );
    vi.mocked(openstackNetworksCreateSubnet).mockResolvedValue({} as any);

    renderDialog(fakeResource, true);

    expect(screen.getByText('Network')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Name/), 'test-subnet-with-network');
    await user.click(screen.getByRole('button', { name: /Submit/i }));
  });

  it('submits optional fields correctly', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackNetworksCreateSubnet).mockResolvedValue({} as any);
    renderDialog();

    await user.type(screen.getByLabelText(/Name/), 'full-subnet');
    await user.type(screen.getByLabelText('Description'), 'Full description');
    await user.type(
      screen.getByLabelText('Gateway IP of this subnet'),
      '192.168.42.1',
    );

    const disableGatewaySwitch = screen.getByLabelText(
      'Disable gateway IP advertising via DHCP',
    );
    await user.click(disableGatewaySwitch);

    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(openstackNetworksCreateSubnet).toHaveBeenCalledWith({
        path: { uuid: 'network-uuid' },
        body: expect.objectContaining({
          name: 'full-subnet',
          description: 'Full description',
          gateway_ip: '192.168.42.1',
          disable_gateway: true,
        }),
      });
    });
  });

  it('submits complex array fields (host_routes, dns_nameservers, allocation_pools)', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackNetworksCreateSubnet).mockResolvedValue({} as any);
    renderDialog();

    await user.type(screen.getByLabelText(/Name/), 'array-subnet');

    // Add Host Route
    await user.click(screen.getByRole('button', { name: /Add route/i }));
    const destInput = screen.getByRole('textbox', {
      name: 'Destination (CIDR)',
    });
    const nexthopInput = screen.getByRole('textbox', { name: 'Next hop (IP)' });
    await user.type(destInput, '10.10.10.0/24');
    await user.type(nexthopInput, '192.168.42.254');

    // Add DNS Nameserver
    await user.click(screen.getByRole('button', { name: /Add address/i }));
    const dnsInput = screen.getByRole('textbox', { name: 'IP address' });
    await user.type(dnsInput, '8.8.8.8');

    // Modify Allocation Pool (Default pool is already added)
    await user.clear(screen.getByPlaceholderText('Start IP'));
    await user.type(screen.getByPlaceholderText('Start IP'), '192.168.42.50');
    await user.clear(screen.getByPlaceholderText('End IP'));
    await user.type(screen.getByPlaceholderText('End IP'), '192.168.42.100');

    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(openstackNetworksCreateSubnet).toHaveBeenCalledWith({
        path: { uuid: 'network-uuid' },
        body: expect.objectContaining({
          name: 'array-subnet',
          host_routes: [
            { destination: '10.10.10.0/24', nexthop: '192.168.42.254' },
          ],
          dns_nameservers: ['8.8.8.8'],
          allocation_pools: [{ start: '192.168.42.50', end: '192.168.42.100' }],
        }),
      });
    });
  });
});
