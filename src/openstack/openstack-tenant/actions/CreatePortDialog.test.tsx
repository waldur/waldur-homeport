import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openstackPortsCreate,
  openstackNetworksList,
  openstackSubnetsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { CreatePortDialog } from './CreatePortDialog';

const mockResource = {
  uuid: 'tenant-uuid',
  url: 'tenant-url',
};

const tenantUrl = (uuid: string) => `http://api/openstack-tenants/${uuid}/`;

const mockNetworks = [
  {
    name: 'Network 1',
    uuid: 'net-1',
    url: 'net-1-url',
    tenant: tenantUrl('tenant-uuid'),
    tenant_is_managed: true,
  },
  {
    name: 'public',
    uuid: 'net-public',
    url: 'net-public-url',
    tenant: tenantUrl('admin-uuid'),
    tenant_is_managed: false,
  },
];

describe('CreatePortDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(openstackNetworksList).mockResolvedValue({
      data: mockNetworks,
    } as any);
    vi.mocked(openstackSubnetsList).mockResolvedValue({
      data: [],
    } as any);
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
      cidr: '10.0.0.0/24',
      tenant: tenantUrl('tenant-uuid'),
      tenant_is_managed: true,
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
      expect(openstackNetworksList).toHaveBeenCalledWith({
        query: expect.objectContaining({
          tenant_uuid: 'tenant-uuid',
          field: [
            'name',
            'uuid',
            'url',
            'tenant',
            'tenant_name',
            'tenant_is_managed',
          ],
        }),
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
    vi.mocked(openstackSubnetsList).mockResolvedValue({
      data: mockSubnets,
    } as any);
    renderDialog();

    const networkSelect = await screen.findByLabelText('Network');
    // Open react-select and choose first option
    await user.click(networkSelect);
    const option = await screen.findByText('Network 1');
    await user.click(option);

    await waitFor(() => {
      expect(openstackSubnetsList).toHaveBeenCalledWith({
        query: expect.objectContaining({
          tenant_uuid: 'tenant-uuid',
          network_uuid: 'net-1',
        }),
      });
    });
  });

  it('lists a nameless subnet by its CIDR', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackSubnetsList).mockResolvedValue({
      data: [{ ...mockSubnets[0], name: '', cidr: '10.0.3.0/24' }],
    } as any);
    renderDialog();

    await user.click(await screen.findByLabelText('Network'));
    await user.click(await screen.findByText('Network 1'));

    await user.click(await screen.findByLabelText('Subnet'));
    expect(
      await screen.findByRole('option', { name: '10.0.3.0/24' }),
    ).toBeDefined();
  });

  it('toggles custom IP configuration and shows manual input', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackSubnetsList).mockResolvedValue({
      data: mockSubnets,
    } as any);
    renderDialog();

    // Select Network and Subnet first, otherwise fixed_ips is not initialized in form state
    const networkSelect = await screen.findByLabelText('Network');
    await user.click(networkSelect);
    await user.click(await screen.findByText('Network 1'));

    const subnetSelect = await screen.findByLabelText('Subnet');
    await user.click(subnetSelect);
    await user.click(await screen.findByText('Subnet 1 (10.0.0.0/24)'));

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
    vi.mocked(openstackSubnetsList).mockResolvedValue({
      data: mockSubnets,
    } as any);

    renderDialog();

    // Fill Name
    await user.type(await screen.findByLabelText('Name'), 'test-port');

    // Select Network
    await user.click(await screen.findByLabelText('Network'));
    await user.click(await screen.findByText('Network 1'));

    // Select Subnet
    await user.click(await screen.findByLabelText('Subnet'));
    await user.click(await screen.findByText('Subnet 1 (10.0.0.0/24)'));

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
            network: 'net-1-url',
            port_security_enabled: false,
          }),
        }),
      );
    });
  });

  it('marks a network shared with the tenant beside its name', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(await screen.findByLabelText('Network'));

    const shared = await screen.findByRole('option', { name: /^public/ });
    expect(within(shared).getByText('public')).toBeInTheDocument();
    expect(within(shared).getByText('shared by provider')).toBeInTheDocument();
    const own = screen.getByRole('option', { name: 'Network 1' });
    expect(within(own).queryByText('shared by provider')).toBeNull();
  });

  it('marks a subnet shared with the tenant', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackSubnetsList).mockImplementation((({ query }) =>
      Promise.resolve({
        data:
          query.network_uuid === 'net-public'
            ? [
                {
                  ...mockSubnets[0],
                  name: 'public-v6',
                  cidr: '2001:db8::/64',
                  tenant: tenantUrl('admin-uuid'),
                  tenant_is_managed: false,
                },
              ]
            : mockSubnets,
      })) as any);
    renderDialog();

    await user.click(await screen.findByLabelText('Network'));
    await user.click(await screen.findByText('Network 1'));
    await user.click(await screen.findByLabelText('Subnet'));
    const own = await screen.findByRole('option', {
      name: 'Subnet 1 (10.0.0.0/24)',
    });
    expect(within(own).queryByText('shared by provider')).toBeNull();

    await user.click(await screen.findByLabelText('Network'));
    await user.click(await screen.findByText('public'));
    await user.click(await screen.findByLabelText('Subnet'));
    const shared = await screen.findByRole('option', {
      name: /^public-v6 \(2001:db8::\/64\)/,
    });
    expect(within(shared).getByText('shared by provider')).toBeInTheDocument();
  });

  it('starts port security on for a network shared with the tenant', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackPortsCreate).mockResolvedValue({} as any);
    renderDialog();

    await user.type(await screen.findByLabelText('Name'), 'test-port');
    await user.click(await screen.findByLabelText('Network'));
    await user.click(await screen.findByText('public'));

    expect(
      await screen.findByRole('checkbox', { name: 'Port security enabled' }),
    ).toBeChecked();
    expect(
      screen.getByText(
        'Only the owner of a shared network can turn port security off on it.',
      ),
    ).toBeInTheDocument();

    await user.click(await screen.findByText('Submit'));

    await waitFor(() => {
      expect(openstackPortsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.objectContaining({
            network: 'net-public-url',
            port_security_enabled: true,
          }),
        }),
      );
    });
  });

  it('restores the default on going back to a network of its own', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(await screen.findByLabelText('Network'));
    await user.click(await screen.findByText('public'));
    const checkbox = await screen.findByRole('checkbox', {
      name: 'Port security enabled',
    });
    await waitFor(() => expect(checkbox).toBeChecked());

    await user.click(await screen.findByLabelText('Network'));
    await user.click(await screen.findByText('Network 1'));

    await waitFor(() => expect(checkbox).not.toBeChecked());
  });

  it("keeps the user's own choice on going back to a network of its own", async () => {
    const user = userEvent.setup();
    renderDialog();

    const checkbox = await screen.findByRole('checkbox', {
      name: 'Port security enabled',
    });
    await user.click(checkbox);
    await user.click(await screen.findByLabelText('Network'));
    await user.click(await screen.findByText('public'));
    await user.click(await screen.findByLabelText('Network'));
    await user.click(await screen.findByText('Network 1'));

    expect(checkbox).toBeChecked();
  });
});
