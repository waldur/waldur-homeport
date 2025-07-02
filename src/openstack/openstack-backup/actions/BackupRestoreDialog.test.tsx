import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openstackBackupsRestore,
  OpenStackSubNet,
  OpenStackFlavor,
  OpenStackBackup,
} from 'waldur-js-client';
import {
  openstackFlavorsList,
  openstackFloatingIpsList,
  openstackSecurityGroupsList,
  openstackSubnetsList,
} from 'waldur-js-client';

import { useModal } from '@waldur/modal/hooks';
import { useNotify } from '@waldur/store/hooks';

import { BackupRestoreDialog } from './BackupRestoreDialog';

const fakeSubnet = {
  url: '/api/openstack-subnets/51e584157094493ca121f71642c0a409/',
  name: 'p60347-sub-net',
  cidr: '192.168.42.0/24',
} as unknown as OpenStackSubNet;

const freeSubnet = {
  url: '/api/openstack-subnets/62f584157094493ca121f71642c0a410/',
  name: 'free-subnet',
  cidr: '192.168.43.0/24',
} as unknown as OpenStackSubNet;

const fakeBackup = {
  url: '/api/openstack-backups/21693289bd78400db79fb2a0ef2ba177/',
  uuid: '21693289bd78400db79fb2a0ef2ba177',
  name: 'After 9th lab',
  tenant_uuid: '43c3b302130c414faa138c14d0e69017',
  resource_type: 'OpenStack.Backup',
  instance: '/api/openstack-instances/6f271860e0764d8cb79573226b726b53/',
  instance_name: 'empowerseamlessinfrastructures',
  instance_security_groups: [
    {
      url: '/api/openstack-security-groups/fce1fed2b8dd40b8b98252c4df76007f/',
      name: 'traefik',
    },
    {
      url: '/api/openstack-security-groups/5bf390b13f194a1fa3fd397631eaac19/',
      name: 'IMAPS',
    },
  ],

  instance_ports: [
    {
      subnet: fakeSubnet.url,
      subnet_name: fakeSubnet.name,
      subnet_cidr: fakeSubnet.cidr,
    },
  ],
} as OpenStackBackup;

const fakeFlavors = [
  {
    url: '/api/openstack-flavors/7e9a8c7f17f34706bf755abdae41fe3a/',
    uuid: '7e9a8c7f17f34706bf755abdae41fe3a',
    name: 'm1.xsmall',
    settings: '/api/service-settings/a926568f29df442e8eb447459d3121a1/',
    cores: 1,
    ram: 1024,
    disk: 10240,
  },
  {
    url: '/api/openstack-flavors/7a8c733bd6bf4560ae8b2d08129e1840/',
    uuid: '7a8c733bd6bf4560ae8b2d08129e1840',
    name: 'm1.small',
    settings: '/api/service-settings/a926568f29df442e8eb447459d3121a1/',
    cores: 1,
    ram: 2048,
    disk: 20480,
  },
] as unknown as OpenStackFlavor[];

vi.mock('waldur-js-client');
vi.mock('@waldur/modal/hooks');

vi.mock('@waldur/store/hooks', () => ({
  useNotify: vi.fn().mockReturnValue({
    showSuccess: vi.fn(),
    showErrorResponse: vi.fn(),
  }),
  useTheme: () => 'light',
}));

const renderDialog = async () => {
  const result = render(
    <BackupRestoreDialog resolve={{ resource: fakeBackup }} />,
  );
  await waitFor(() =>
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument(),
  );
  return result;
};

describe('BackupRestoreDialog', () => {
  let mockShowSuccess;
  let mockShowErrorResponse;

  beforeEach(() => {
    mockShowSuccess = vi.fn();
    mockShowErrorResponse = vi.fn();
    vi.mocked(useNotify).mockReturnValue({
      showError: vi.fn(),
      showSuccess: mockShowSuccess,
      showErrorResponse: mockShowErrorResponse,
    });
    vi.mocked(useModal).mockReturnValue({
      closeDialog: vi.fn(),
    } as any);
    vi.mocked(openstackFlavorsList).mockResolvedValue({ data: [] } as any);
    vi.mocked(openstackFloatingIpsList).mockResolvedValue({ data: [] } as any);
    vi.mocked(openstackSecurityGroupsList).mockResolvedValue({
      data: [],
    } as any);
    vi.mocked(openstackSubnetsList).mockResolvedValue({ data: [] } as any);
  });

  it('renders current instance name in modal dialog title', async () => {
    await renderDialog();
    expect(
      screen.getByText(/Restore virtual machine from backup After 9th lab/),
    ).toBeInTheDocument();
  });

  it('shows loading state while data is being fetched', () => {
    render(<BackupRestoreDialog resolve={{ resource: fakeBackup }} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('disables submit button while data is loading', () => {
    render(<BackupRestoreDialog resolve={{ resource: fakeBackup }} />);
    expect(
      screen.getByRole('button', {
        name: /submit/i,
      }),
    ).toBeDisabled();
  });

  it('filters related resources by tenant', async () => {
    await renderDialog();
    expect(vi.mocked(openstackFlavorsList)).toHaveBeenCalledWith({
      query: {
        page: 1,
        tenant_uuid: fakeBackup.tenant_uuid,
        field: ['url', 'name', 'cores', 'ram'],
      },
    });
    expect(vi.mocked(openstackSecurityGroupsList)).toHaveBeenCalledWith({
      query: {
        page: 1,
        tenant_uuid: fakeBackup.tenant_uuid,
        field: ['url', 'name'],
      },
    });
    expect(vi.mocked(openstackFloatingIpsList)).toHaveBeenCalledWith({
      query: {
        page: 1,
        tenant_uuid: fakeBackup.tenant_uuid,
        free: true,
        field: ['url', 'address'],
      },
    });
    expect(vi.mocked(openstackSubnetsList)).toHaveBeenCalledWith({
      query: {
        page: 1,
        tenant_uuid: fakeBackup.tenant_uuid,
        field: ['url', 'name', 'cidr'],
      },
    });
  });

  it('renders security groups correctly', async () => {
    vi.mocked(openstackSecurityGroupsList).mockResolvedValue({
      data: fakeBackup.instance_security_groups,
    } as any);
    await renderDialog();

    const securityGroupsSelect = screen.getByLabelText('Security groups');
    expect(securityGroupsSelect).toBeInTheDocument();

    // Open the select dropdown
    await userEvent.click(securityGroupsSelect);

    // Check that all security groups are present in the dropdown
    fakeBackup.instance_security_groups.forEach((group) => {
      expect(
        screen.getByText(group.name, { selector: 'span.badge' }),
      ).toBeInTheDocument();
    });
  });

  it('renders networks section correctly', async () => {
    vi.mocked(openstackSubnetsList).mockResolvedValue({
      data: [fakeSubnet],
    } as any);
    const { container } = await renderDialog();

    expect(screen.getByText(/Networks/i)).toBeInTheDocument();
    const networkRows = container.querySelectorAll('tbody tr');
    expect(networkRows).toHaveLength(fakeBackup.instance_ports.length);
  });

  it('disabled add network button when subnets are not available', async () => {
    vi.mocked(openstackSubnetsList).mockResolvedValue({
      data: [fakeSubnet],
    } as any);
    await renderDialog();

    const addButton = screen.getByRole('button', { name: /Add/i });
    expect(addButton).not.toBeEnabled();
  });

  it('enables add network button when subnets are available', async () => {
    vi.mocked(openstackSubnetsList).mockResolvedValue({
      data: [fakeSubnet, freeSubnet],
    } as any);
    await renderDialog();

    const addButton = screen.getByRole('button', { name: /Add/i });
    expect(addButton).toBeEnabled();
  });

  it('allows adding and removing network rows', async () => {
    vi.mocked(openstackSubnetsList).mockResolvedValue({
      data: [fakeSubnet, freeSubnet],
    } as any);
    const { container } = await renderDialog();

    const addButton = screen.getByRole('button', { name: /Add/i });
    await userEvent.click(addButton);

    let networkRows = container.querySelectorAll('tbody tr');
    expect(networkRows).toHaveLength(fakeBackup.instance_ports.length + 1);

    const deleteButton = screen.getAllByRole('button', { name: /Delete/i })[0];
    await userEvent.click(deleteButton);

    networkRows = container.querySelectorAll('tbody tr');
    expect(networkRows).toHaveLength(fakeBackup.instance_ports.length);
  });

  it('shows success notification with correct message on successful submit', async () => {
    vi.mocked(openstackFlavorsList).mockResolvedValue({
      data: fakeFlavors,
    } as any);
    vi.mocked(openstackBackupsRestore).mockResolvedValue({ data: null } as any);
    await renderDialog();

    // Select flavor and submit
    await userEvent.click(screen.getByLabelText('Flavor'));
    await userEvent.click(screen.getByText(/m1.xsmall/i));
    await userEvent.click(screen.getByRole('button', { name: /Submit/i }));

    expect(mockShowSuccess).toHaveBeenCalledWith(
      'VM snapshot restoration has been scheduled.',
    );
  });

  it('shows error notification with correct message on failed submit', async () => {
    const error = new Error('API Error');
    vi.mocked(openstackFlavorsList).mockResolvedValue({
      data: fakeFlavors,
    } as any);
    vi.mocked(openstackBackupsRestore).mockRejectedValue(error);
    await renderDialog();

    // Select flavor and submit
    await userEvent.click(screen.getByLabelText('Flavor'));
    await userEvent.click(screen.getByText(/m1.xsmall/i));
    await userEvent.click(screen.getByRole('button', { name: /Submit/i }));

    expect(mockShowErrorResponse).toHaveBeenCalledWith(
      error,
      'Unable to restore VM snapshot.',
    );
  });

  it('submits form with correct data', async () => {
    vi.mocked(openstackFlavorsList).mockResolvedValue({
      data: fakeFlavors,
    } as any);
    vi.mocked(openstackBackupsRestore).mockResolvedValue({ data: null } as any);
    await renderDialog();

    // Select flavor
    const flavorSelect = screen.getByLabelText('Flavor');
    await userEvent.click(flavorSelect);
    await userEvent.click(screen.getByText(/m1.xsmall/i));

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    await userEvent.click(submitButton);

    expect(vi.mocked(openstackBackupsRestore)).toHaveBeenCalledWith({
      path: { uuid: fakeBackup.uuid },
      body: {
        flavor: fakeFlavors[0].url,
        floating_ips: [],
        ports: [
          {
            subnet: fakeSubnet.url,
          },
        ],

        security_groups: fakeBackup.instance_security_groups.map((group) => ({
          url: group.url,
        })),
      },
    });
  });

  it('handles floating IP selection correctly', async () => {
    const floatingIps = [
      { address: '1.1.1.1', url: 'url1' },
      { address: '2.2.2.2', url: 'url2' },
    ];

    vi.mocked(openstackFloatingIpsList).mockResolvedValue({
      data: floatingIps,
    } as any);
    vi.mocked(openstackSubnetsList).mockResolvedValue({
      data: [fakeSubnet],
    } as any);

    const { container } = await renderDialog();

    const floatingIpSelect = container.querySelector(
      '[name="networks[0].floating_ip"]',
    );
    expect(floatingIpSelect).toBeInTheDocument();

    const options = within(floatingIpSelect as HTMLElement).getAllByRole(
      'option',
    );
    expect(options).toHaveLength(4); // Skip, Auto-assign, and 2 IPs
    expect(options[2]).toHaveTextContent('1.1.1.1');
    expect(options[3]).toHaveTextContent('2.2.2.2');
  });

  it('submits form with floating IP when selected', async () => {
    vi.mocked(openstackFlavorsList).mockResolvedValue({
      data: fakeFlavors,
    } as any);
    vi.mocked(openstackFloatingIpsList).mockResolvedValue({
      data: [{ address: '1.1.1.1', url: 'floating_ip_url' }],
    } as any);
    vi.mocked(openstackBackupsRestore).mockResolvedValue({ data: null } as any);

    const { container } = await renderDialog();

    // Select flavor
    await userEvent.click(screen.getByLabelText('Flavor'));
    await userEvent.click(screen.getByText(/m1.xsmall/i));

    // Select floating IP
    const floatingIpSelect = container.querySelector(
      '[name="networks[0].floating_ip"]',
    );
    await userEvent.selectOptions(floatingIpSelect, 'floating_ip_url');

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /Submit/i }));

    expect(vi.mocked(openstackBackupsRestore)).toHaveBeenCalledWith({
      path: { uuid: fakeBackup.uuid },
      body: expect.objectContaining({
        floating_ips: [
          {
            subnet: fakeSubnet.url,
            url: 'floating_ip_url',
          },
        ],
      }),
    });
  });

  it('handles refetch callback after successful submit', async () => {
    const refetch = vi.fn();
    vi.mocked(openstackFlavorsList).mockResolvedValue({
      data: fakeFlavors,
    } as any);
    vi.mocked(openstackBackupsRestore).mockResolvedValue({ data: null } as any);

    render(<BackupRestoreDialog resolve={{ resource: fakeBackup, refetch }} />);

    await waitFor(() =>
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument(),
    );

    // Select flavor and submit
    await userEvent.click(screen.getByLabelText('Flavor'));
    await userEvent.click(screen.getByText(/m1.xsmall/i));
    await userEvent.click(screen.getByRole('button', { name: /Submit/i }));

    expect(refetch).toHaveBeenCalled();
  });
});
