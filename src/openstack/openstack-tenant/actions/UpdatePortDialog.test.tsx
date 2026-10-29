import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openstackPortsUpdatePortIp,
  openstackSubnetsList,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { UpdatePortDialog } from './UpdatePortDialog';

const mockResource = {
  uuid: 'port-uuid',
  tenant_uuid: 'tenant-uuid',
  network_uuid: 'network-uuid',
  fixed_ips: [
    {
      ip_address: '10.0.0.10',
      subnet_id: 'subnet-backend-id',
    },
  ],
};

const mockSubnets = [
  {
    name: 'Subnet-One',
    uuid: 'sub-1-uuid',
    url: 'sub-1-url',
    backend_id: 'subnet-backend-id',
    cidr: '10.0.0.0/24',
    allocation_pools: [{ start: '10.0.0.2', end: '10.0.0.254' }],
  },
  {
    name: 'Subnet-Two',
    uuid: 'sub-2-uuid',
    url: 'sub-2-url',
    backend_id: 'sub-2-backend',
    cidr: '10.0.1.0/24',
    allocation_pools: [{ start: '10.0.1.2', end: '10.0.1.254' }],
  },
];

describe('UpdatePortDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(openstackSubnetsList).mockResolvedValue({
      data: mockSubnets,
    } as any);
  });

  const renderDialog = (resource = mockResource) => {
    return renderWithProviders(
      <UpdatePortDialog
        resolve={{ resource: resource as any, refetch: vi.fn() }}
      />,
    );
  };

  it('renders correctly and loads subnets', async () => {
    renderDialog();
    expect(await screen.findByText('Update port IP')).toBeDefined();
    expect(openstackSubnetsList).toHaveBeenCalledWith({
      query: expect.objectContaining({
        tenant_uuid: 'tenant-uuid',
        network_uuid: 'network-uuid',
      }),
    });
  });

  it('sets initial values correctly', async () => {
    renderDialog();
    // Subnet should be selected
    expect(await screen.findByText('Subnet-One')).toBeDefined();
    // Custom IP should be visible and set to the current IP
    expect(await screen.findByText('10.0.0.10')).toBeDefined();
  });

  it('toggles custom IP configuration', async () => {
    const user = userEvent.setup();
    renderDialog();

    const checkbox = await screen.findByLabelText('Custom IP configuration');
    // Initially checked because port has an IP
    expect(checkbox).toBeChecked();
    expect(screen.getByLabelText('Custom IP')).not.toBeNull();

    // Uncheck it
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
    // The field should be hidden
    expect(screen.queryByLabelText('Custom IP')).toBeNull();
  });

  it('submits form with updated data', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackPortsUpdatePortIp).mockResolvedValue({} as any);

    renderDialog();

    // Select 'Other' to enter manual IP
    const customIpSelect = await screen.findByLabelText('Custom IP');
    await user.click(customIpSelect);
    const otherOption = await screen.findByText('Other (manual input)');
    await user.click(otherOption);

    // Enter new IP
    const ipInput = await screen.findByPlaceholderText('Enter custom IP');
    await user.type(ipInput, '10.0.0.20');

    // Submit
    const submitButton = screen.getByText('Save');
    await user.click(submitButton);

    await waitFor(() => {
      expect(openstackPortsUpdatePortIp).toHaveBeenCalledWith(
        expect.objectContaining({
          path: { uuid: 'port-uuid' },
          body: expect.objectContaining({
            subnet: 'sub-1-url',
            ip_address: '10.0.0.20',
          }),
        }),
      );
    });
  });

  it('marks a subnet the provider shares', async () => {
    const user = userEvent.setup();
    const tenantUrl = (uuid: string) => `http://api/openstack-tenants/${uuid}/`;
    vi.mocked(openstackSubnetsList).mockResolvedValue({
      data: [
        { ...mockSubnets[0], tenant: tenantUrl('tenant-uuid') },
        {
          ...mockSubnets[1],
          tenant: tenantUrl('admin-uuid'),
          tenant_is_managed: false,
        },
      ],
    } as any);
    renderDialog();

    // The port's subnet is the tenant's own: no mark beside it.
    expect(await screen.findByText('Subnet-One')).toBeInTheDocument();
    expect(screen.queryByText('shared by provider')).toBeNull();

    await user.click(await screen.findByLabelText('Subnet'));
    const shared = await screen.findByRole('option', {
      name: /^Subnet-Two \(10\.0\.1\.0\/24\)/,
    });
    expect(within(shared).getByText('shared by provider')).toBeInTheDocument();
    const own = screen.getByRole('option', {
      name: 'Subnet-One (10.0.0.0/24)',
    });
    expect(within(own).queryByText('shared by provider')).toBeNull();
  });
});
