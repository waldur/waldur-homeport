import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openstackNetworksCreateSubnet,
  openstackNetworksList,
  openstackRoutersList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';

import { CreateSubnetDialog } from './CreateSubnetDialog';

const fakeResource = {
  name: 'Network',
  uuid: 'network-uuid',
  tenant_uuid: 'tenant-uuid',
};

const fakeRouters = [
  {
    name: 'vpc-demo-int-net-router',
    uuid: 'int-net-router-uuid',
    url: 'http://example.com/api/openstack-routers/int-net-router-uuid/',
  },
  {
    name: 'p2p-uplink-router',
    uuid: 'p2p-router-uuid',
    url: 'http://example.com/api/openstack-routers/p2p-router-uuid/',
  },
];

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

  it('does not submit while the required fields are empty', async () => {
    const user = userEvent.setup();
    renderDialog(fakeResource, true);

    const submit = screen.getByRole('button', { name: /Submit/i });
    expect(submit).toBeDisabled();

    await user.click(submit);
    expect(openstackNetworksCreateSubnet).not.toHaveBeenCalled();
  });

  it('puts a backend validation error under the field it belongs to', async () => {
    const user = userEvent.setup();
    // The shape waldur-auth-core's interceptor produces: the response body
    // spread onto the error, with the envelope alongside it.
    vi.mocked(openstackNetworksCreateSubnet).mockRejectedValue({
      cidr: ['Subnet with cidr "192.168.42.0/24" is already registered'],
      status: 400,
      statusText: '',
      response: {},
    });
    renderDialog();

    await user.type(screen.getByLabelText(/Name/), 'clashing-subnet');
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    expect(
      await screen.findByText(
        'Subnet with cidr "192.168.42.0/24" is already registered',
      ),
    ).toBeInTheDocument();
  });

  it('shows a non-field error above the form', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackNetworksCreateSubnet).mockRejectedValue({
      non_field_errors: ['Internal network cannot have more than one subnet.'],
      status: 400,
      response: {},
    });
    renderDialog();

    await user.type(screen.getByLabelText(/Name/), 'second-subnet');
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    expect(
      await screen.findByText(
        'Internal network cannot have more than one subnet.',
      ),
    ).toBeInTheDocument();
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

  it('offers the routers of the network tenant and submits the chosen one', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackRoutersList).mockResolvedValue(
      mockListResponse(fakeRouters),
    );
    vi.mocked(openstackNetworksCreateSubnet).mockResolvedValue({} as any);
    renderDialog();

    await user.type(screen.getByLabelText(/Name/), 'routed-subnet');
    await openAndSelectOption(user, 'Router', 'p2p-uplink-router');
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(openstackRoutersList).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            tenant_uuid: 'tenant-uuid',
            state: ['OK'],
          }),
        }),
      );
      // The API takes a hyperlink, not a UUID.
      expect(openstackNetworksCreateSubnet).toHaveBeenCalledWith({
        path: { uuid: 'network-uuid' },
        body: expect.objectContaining({
          name: 'routed-subnet',
          router: 'http://example.com/api/openstack-routers/p2p-router-uuid/',
        }),
      });
    });
  });

  it('hides the router select while the subnet is created unrouted', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackRoutersList).mockResolvedValue(
      mockListResponse(fakeRouters),
    );
    vi.mocked(openstackNetworksCreateSubnet).mockResolvedValue({} as any);
    renderDialog();

    expect(screen.getByText('Router')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Do not attach to a router'));

    await waitFor(() => {
      expect(screen.queryByText('Router')).not.toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/Name/), 'unrouted-subnet');
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(openstackNetworksCreateSubnet).toHaveBeenCalledWith({
        path: { uuid: 'network-uuid' },
        body: expect.objectContaining({
          name: 'unrouted-subnet',
          skip_router_connection: true,
        }),
      });
    });
  });

  it('does not send the flag when the switch is left alone', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackNetworksCreateSubnet).mockResolvedValue({} as any);
    renderDialog();

    await user.type(screen.getByLabelText(/Name/), 'routed-by-default');
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(openstackNetworksCreateSubnet).toHaveBeenCalled();
    });
    const body = vi.mocked(openstackNetworksCreateSubnet).mock.calls[0][0].body;
    expect('skip_router_connection' in (body as object)).toBe(false);
  });

  it('hides the router select while the gateway is disabled', async () => {
    // Neutron cannot attach a subnet with no gateway IP to a router, and the
    // API rejects the pair -- better than a round trip that fails.
    const user = userEvent.setup();
    vi.mocked(openstackRoutersList).mockResolvedValue(
      mockListResponse(fakeRouters),
    );
    renderDialog();

    expect(screen.getByText('Router')).toBeInTheDocument();

    await user.click(
      screen.getByLabelText('Disable gateway IP advertising via DHCP'),
    );

    await waitFor(() => {
      expect(screen.queryByText('Router')).not.toBeInTheDocument();
    });
  });

  it('offers no router until a network is chosen in the tenant-scoped dialog', () => {
    // The network list includes networks shared in over RBAC, which belong to
    // another tenant; the routers on offer must follow the chosen network.
    vi.mocked(openstackNetworksList).mockResolvedValue(
      mockListResponse([
        { name: 'Selected Network', uuid: 'selected-network-uuid' },
      ]),
    );
    vi.mocked(openstackRoutersList).mockResolvedValue(
      mockListResponse(fakeRouters),
    );

    renderDialog(fakeResource, true);

    expect(screen.queryByText('Router')).not.toBeInTheDocument();
    expect(openstackRoutersList).not.toHaveBeenCalled();
  });

  it('omits the router entirely when none is chosen', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackRoutersList).mockResolvedValue(
      mockListResponse(fakeRouters),
    );
    vi.mocked(openstackNetworksCreateSubnet).mockResolvedValue({} as any);
    renderDialog();

    await user.type(screen.getByLabelText(/Name/), 'unrouted-subnet');
    await user.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(openstackNetworksCreateSubnet).toHaveBeenCalled();
    });
    const body = vi.mocked(openstackNetworksCreateSubnet).mock.calls[0][0].body;
    expect('router' in (body as object)).toBe(false);
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
