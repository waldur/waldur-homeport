import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  OpenStackInstance,
  openstackInstancesUpdatePorts,
} from 'waldur-js-client';

import { loadSubnets } from '@/openstack/api';
import { renderWithProviders } from '@/test/harness';

import { UpdateInternalIpsDialog } from './UpdateInternalIpsDialog';

vi.mock('@/openstack/api', () => ({
  loadSubnets: vi.fn(),
}));

const subnetsResponse = [
  {
    uuid: 'subnet-1',
    url: 'http://api/subnets/subnet-1/',
    name: 'subnet-alpha',
    cidr: '10.0.0.0/24',
    backend_id: 'backend-1',
    allocation_pools: [{ start: '10.0.0.10', end: '10.0.0.20' }],
  },
  {
    uuid: 'subnet-2',
    url: 'http://api/subnets/subnet-2/',
    name: 'subnet-beta',
    cidr: '10.0.1.0/24',
    backend_id: 'backend-2',
    allocation_pools: [{ start: '10.0.1.10', end: '10.0.1.20' }],
  },
  {
    uuid: 'subnet-3',
    url: 'http://api/subnets/subnet-3/',
    name: 'subnet-gamma',
    cidr: '10.0.2.0/24',
    backend_id: 'backend-3',
    allocation_pools: [],
  },
];

const mockResource = {
  uuid: 'instance-uuid',
  name: 'test-instance',
  tenant_uuid: 'tenant-uuid',
  ports: [
    {
      subnet: 'http://api/subnets/subnet-1/',
      subnet_uuid: 'subnet-1',
      subnet_name: 'subnet-alpha',
      subnet_cidr: '10.0.0.0/24',
      fixed_ips: [{ ip_address: '10.0.0.15' }],
    },
  ],
} as unknown as OpenStackInstance;

const renderDialog = (resource = mockResource) => {
  return renderWithProviders(
    <UpdateInternalIpsDialog resolve={{ resource, refetch: vi.fn() }} />,
  );
};

describe('UpdateInternalIpsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadSubnets).mockResolvedValue(subnetsResponse as any);
  });

  it('renders title with resource name', () => {
    renderDialog();

    expect(
      screen.getByText(
        'Update internal IPs for OpenStack instance test-instance',
      ),
    ).toBeInTheDocument();
  });

  it('shows loading state while fetching subnets', () => {
    vi.mocked(loadSubnets).mockReturnValue(new Promise(() => {}));
    renderDialog();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Connected subnets')).not.toBeInTheDocument();
  });

  it('loads subnets from the API', async () => {
    renderDialog();

    await waitFor(() => {
      expect(loadSubnets).toHaveBeenCalledWith({
        tenant_uuid: 'tenant-uuid',
      });
    });
  });

  it('shows error state when loading fails', async () => {
    vi.mocked(loadSubnets).mockRejectedValue(new Error('Network error'));
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Unable to load data.')).toBeInTheDocument();
    });
  });

  it('renders connected subnets label and custom IP checkbox after loading', async () => {
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Connected subnets')).toBeInTheDocument();
    });

    expect(screen.getByText('Custom IP configuration')).toBeInTheDocument();
  });

  it('renders pre-selected subnet from initial values', async () => {
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Connected subnets')).toBeInTheDocument();
    });

    // The initial port maps to subnet-alpha, shown in the select
    expect(screen.getByText('subnet-alpha')).toBeInTheDocument();
  });

  it('shows add subnet button', async () => {
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Add subnet')).toBeInTheDocument();
    });
  });

  it('can add a new subnet row', async () => {
    const user = userEvent.setup();
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Add subnet')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Add subnet'));

    // Should now have two "Subnet" labels
    const subnetLabels = screen.getAllByText('Subnet');
    expect(subnetLabels).toHaveLength(2);
  });

  it('submits with the correct payload', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackInstancesUpdatePorts).mockResolvedValue({} as any);

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Connected subnets')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Submit');
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    await waitFor(() => {
      expect(openstackInstancesUpdatePorts).toHaveBeenCalledWith({
        path: { uuid: 'instance-uuid' },
        body: {
          ports: [
            {
              subnet: 'http://api/subnets/subnet-1/',
              fixed_ips: [
                {
                  ip_address: '10.0.0.15',
                  subnet_id: 'backend-1',
                },
              ],
            },
          ],
        },
      });
    });
  });

  it('submits without fixed_ips when port has no fixed_ip', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackInstancesUpdatePorts).mockResolvedValue({} as any);

    const resourceNoIp = {
      ...mockResource,
      ports: [
        {
          subnet: 'http://api/subnets/subnet-1/',
          subnet_uuid: 'subnet-1',
          subnet_name: 'subnet-alpha',
          subnet_cidr: '10.0.0.0/24',
          fixed_ips: [],
        },
      ],
    } as unknown as OpenStackInstance;

    renderDialog(resourceNoIp);

    await waitFor(() => {
      expect(screen.getByText('Connected subnets')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Submit');
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    await waitFor(() => {
      expect(openstackInstancesUpdatePorts).toHaveBeenCalledWith({
        path: { uuid: 'instance-uuid' },
        body: {
          ports: [
            {
              subnet: 'http://api/subnets/subnet-1/',
            },
          ],
        },
      });
    });
  });

  it('shows custom IP field when checkbox is toggled', async () => {
    const user = userEvent.setup();

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Connected subnets')).toBeInTheDocument();
    });

    // Custom IP field should not be visible initially
    expect(screen.queryByText('Custom IP')).not.toBeInTheDocument();

    // Enable custom IP mode via checkbox
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(screen.getByText('Custom IP')).toBeInTheDocument();
    });
  });

  it('renders with empty ports when resource has no ports', async () => {
    const emptyResource = {
      ...mockResource,
      ports: [],
    } as unknown as OpenStackInstance;

    renderDialog(emptyResource);

    await waitFor(() => {
      expect(screen.getByText('Connected subnets')).toBeInTheDocument();
    });

    // No subnet labels should be present (only the header)
    const subnetLabels = screen.queryAllByText('Subnet');
    expect(subnetLabels).toHaveLength(0);
  });

  it('can remove a port row', async () => {
    const user = userEvent.setup();
    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('subnet-alpha')).toBeInTheDocument();
    });

    // There should be one "Subnet" label for the existing port
    expect(screen.getAllByText('Subnet')).toHaveLength(1);

    // Click the trash/remove button
    // The remove button is the TrashIcon ActionButton — find it by its SVG
    const trashButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg'));
    // First icon button in each row is the remove button
    await user.click(trashButtons[0]);

    // Row should be removed — no more "Subnet" labels
    await waitFor(() => {
      expect(screen.queryAllByText('Subnet')).toHaveLength(0);
    });
  });

  it('submits with empty ports array when resource has no ports', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackInstancesUpdatePorts).mockResolvedValue({} as any);

    const emptyResource = {
      ...mockResource,
      ports: [],
    } as unknown as OpenStackInstance;

    renderDialog(emptyResource);

    await waitFor(() => {
      expect(screen.getByText('Connected subnets')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Submit');
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    await waitFor(() => {
      expect(openstackInstancesUpdatePorts).toHaveBeenCalledWith({
        path: { uuid: 'instance-uuid' },
        body: { ports: [] },
      });
    });
  });

  it('disables add subnet button when all subnets are used', async () => {
    // Only 1 subnet available, already used by the resource
    vi.mocked(loadSubnets).mockResolvedValue([subnetsResponse[0]] as any);

    renderDialog();

    await waitFor(() => {
      expect(screen.getByText('Connected subnets')).toBeInTheDocument();
    });

    // The add button should be disabled since the only subnet is already used
    const addButton = screen.getByText('Add subnet').closest('button');
    expect(addButton).toBeDisabled();
  });

  it('uses fallback subnet data when full subnet is not found in loaded list', async () => {
    // Return subnets that do NOT include the resource's subnet_uuid
    vi.mocked(loadSubnets).mockResolvedValue([subnetsResponse[1]] as any);

    const resourceWithUnknownSubnet = {
      ...mockResource,
      ports: [
        {
          subnet: 'http://api/subnets/unknown/',
          subnet_uuid: 'unknown-uuid',
          subnet_name: 'unknown-subnet',
          subnet_cidr: '192.168.0.0/16',
          fixed_ips: [],
        },
      ],
    } as unknown as OpenStackInstance;

    renderDialog(resourceWithUnknownSubnet);

    await waitFor(() => {
      expect(screen.getByText('Connected subnets')).toBeInTheDocument();
    });

    // The fallback subnet name should be displayed
    expect(screen.getByText('unknown-subnet')).toBeInTheDocument();
  });

  it('keeps submit button disabled while loading', () => {
    vi.mocked(loadSubnets).mockReturnValue(new Promise(() => {}));
    renderDialog();

    const submitButton = screen.getByText('Submit');
    expect(submitButton).toBeDisabled();
  });

  it('can add multiple subnets up to the available count', async () => {
    const user = userEvent.setup();

    // Start with no existing ports so all subnets are free
    const emptyResource = {
      ...mockResource,
      ports: [],
    } as unknown as OpenStackInstance;

    renderDialog(emptyResource);

    await waitFor(() => {
      expect(screen.getByText('Connected subnets')).toBeInTheDocument();
    });

    // Add 3 subnets (all available)
    for (let i = 0; i < 3; i++) {
      const addBtn = screen.getByText('Add subnet').closest('button');
      if (!addBtn.disabled) {
        await user.click(addBtn);
      }
    }

    // Should have 3 "Subnet" labels
    expect(screen.getAllByText('Subnet')).toHaveLength(3);

    // Add button should be disabled now — no more free subnets
    const addButton = screen.getByText('Add subnet').closest('button');
    expect(addButton).toBeDisabled();
  });

  describe('Validation', () => {
    it('keeps submit button enabled when a new row is added (it is pre-selected)', async () => {
      const user = userEvent.setup();
      renderDialog();

      await waitFor(() => {
        expect(screen.getByText('Add subnet')).toBeInTheDocument();
      });

      // Add a new row
      await user.click(screen.getByText('Add subnet'));

      // The new row is added. We should have two "Subnet" labels now.
      await waitFor(() => {
        expect(screen.getAllByText('Subnet')).toHaveLength(2);
      });

      // The submit button should be ENABLED because the new row is pre-selected with the first free subnet
      const submitButton = screen.getByText('Submit').closest('button');
      expect(submitButton).not.toBeDisabled();
    });

    it('shows error for required custom IP field', async () => {
      const user = userEvent.setup();
      const resourceNoIp = {
        ...mockResource,
        ports: [
          {
            subnet: 'http://api/subnets/subnet-1/',
            subnet_uuid: 'subnet-1',
            subnet_name: 'subnet-alpha',
            subnet_cidr: '10.0.0.0/24',
            fixed_ips: [],
          },
        ],
      } as unknown as OpenStackInstance;

      renderDialog(resourceNoIp);

      await waitFor(() => {
        expect(screen.getByText('Connected subnets')).toBeInTheDocument();
      });

      // Enable custom IP mode
      await user.click(screen.getByRole('checkbox'));

      // The placeholder is "e.g. 192.168.42.16". react-select renders it as text.
      const placeholder = screen.getByText('e.g. 192.168.42.16');
      await user.click(placeholder);
      await user.click(screen.getByText('Other (manual input)'));

      // Blur the IP input to show error
      const ipInput = screen.getByPlaceholderText('Enter custom IP');
      await user.click(ipInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('This field is required.')).toBeInTheDocument();
      });
    });

    it('shows error for IP outside of subnet CIDR', async () => {
      const user = userEvent.setup();
      const resourceNoIp = {
        ...mockResource,
        ports: [
          {
            subnet: 'http://api/subnets/subnet-1/',
            subnet_uuid: 'subnet-1',
            subnet_name: 'subnet-alpha',
            subnet_cidr: '10.0.0.0/24',
            fixed_ips: [],
          },
        ],
      } as unknown as OpenStackInstance;

      renderDialog(resourceNoIp);

      await waitFor(() => {
        expect(screen.getByText('Connected subnets')).toBeInTheDocument();
      });

      // Enable custom IP mode
      await user.click(screen.getByRole('checkbox'));

      // Select "Other"
      await user.click(screen.getByText('e.g. 192.168.42.16'));
      await user.click(screen.getByText('Other (manual input)'));

      // Enter an invalid IP (outside of 10.0.0.0/24)
      const ipInput = screen.getByPlaceholderText('Enter custom IP');
      await user.type(ipInput, '192.168.1.1');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('IP is outside of subnet CIDR'),
        ).toBeInTheDocument();
      });
    });

    it('shows warning for IP outside of allocation pool', async () => {
      const user = userEvent.setup();
      const resourceNoIp = {
        ...mockResource,
        ports: [
          {
            subnet: 'http://api/subnets/subnet-1/',
            subnet_uuid: 'subnet-1',
            subnet_name: 'subnet-alpha',
            subnet_cidr: '10.0.0.0/24',
            fixed_ips: [],
          },
        ],
      } as unknown as OpenStackInstance;

      renderDialog(resourceNoIp);

      await waitFor(() => {
        expect(screen.getByText('Connected subnets')).toBeInTheDocument();
      });

      // Enable custom IP mode
      await user.click(screen.getByRole('checkbox'));

      // Select "Other"
      await user.click(screen.getByText('e.g. 192.168.42.16'));
      await user.click(screen.getByText('Other (manual input)'));

      // Enter an IP within CIDR (10.0.0.0/24) but outside pool (10.0.0.10 - 10.0.0.20)
      const ipInput = screen.getByPlaceholderText('Enter custom IP');
      await user.type(ipInput, '10.0.0.5');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('IPs is outside the allocation pool'),
        ).toBeInTheDocument();
      });
    });
  });
});
