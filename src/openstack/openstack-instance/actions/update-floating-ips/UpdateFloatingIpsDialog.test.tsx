import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OpenStackFloatingIp, OpenStackInstance } from 'waldur-js-client';
import { openstackInstancesUpdateFloatingIps } from 'waldur-js-client';

import { loadFloatingIps } from '@/openstack/api';

import { UpdateFloatingIpsDialog } from './UpdateFloatingIpsDialog';

vi.mock('@/openstack/api');
vi.mock('waldur-js-client', async (importOriginal) => {
  const mod = await importOriginal<any>();
  return {
    ...mod,
    openstackInstancesUpdateFloatingIps: vi.fn(),
  };
});

const fakeInstance = {
  name: 'backup',
  uuid: 'bcbb973635754084a5b292ecb2274e33',
  tenant_uuid: 'a500a20d8f7040eabb9e0103d5f119af',
  floating_ips: [
    {
      url: '/api/openstack-floating-ips/6d596ebfa7a5444abd634d6285a22339/',
      uuid: '6d596ebfa7a5444abd634d6285a22339',
      address: '172.17.65.174',
      subnet: '/api/openstack-subnets/7350f289a6d14e4bbd780ee59b2899e6/',
      subnet_uuid: '7350f289a6d14e4bbd780ee59b2899e6',
      subnet_name: 'theses-and-papers-on-mach-sub-net',
      subnet_cidr: '192.168.42.0/24',
    },
  ],
  ports: [
    {
      subnet: '/api/openstack-subnets/7350f289a6d14e4bbd780ee59b2899e6/',
      subnet_uuid: '7350f289a6d14e4bbd780ee59b2899e6',
      subnet_name: 'theses-and-papers-on-mach-sub-net',
      subnet_cidr: '192.168.42.0/24',
    },
  ],
} as unknown as OpenStackInstance;

const fakeFloatingIPs = [
  {
    url: '/api/openstack-floating-ips/377b9ffae7c24783a204ec37c505710c/',
    address: '172.17.66.254',
  },
  {
    url: '/api/openstack-floating-ips/44ececd11e674287abc87b2cdf503948/',
    address: '172.17.65.0',
  },
] as unknown as OpenStackFloatingIp[];

const renderDialog = (resource = fakeInstance) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const store = createStore((state) => state, {
    notifications: [],
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <UpdateFloatingIpsDialog resolve={{ resource, refetch: vi.fn() }} />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('UpdateFloatingIpsDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadFloatingIps).mockResolvedValue([]);
  });

  it('renders current instance name in modal dialog title', async () => {
    renderDialog();
    expect(
      await screen.findByText('Update floating IPs in backup virtual machine'),
    ).toBeInTheDocument();
  });

  it('renders loading spinner while floating IPs are being loaded', () => {
    vi.mocked(loadFloatingIps).mockReturnValue(new Promise(() => {}));
    renderDialog();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('disables submit button while floating IPs are being loaded', () => {
    vi.mocked(loadFloatingIps).mockReturnValue(new Promise(() => {}));
    renderDialog();
    expect(screen.getByText('Submit')).toBeDisabled();
  });

  it('filters floating IPs by tenant UUID', async () => {
    renderDialog();
    await waitFor(() => {
      expect(loadFloatingIps).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant_uuid: fakeInstance.tenant_uuid,
        }),
      );
    });
  });

  it('renders error message when floating IPs load fails', async () => {
    vi.mocked(loadFloatingIps).mockRejectedValue(new Error('Failed to load'));
    renderDialog();
    expect(await screen.findByText('Unable to load data.')).toBeInTheDocument();
  });

  it('renders placeholder if instance is not connected to internal subnets', async () => {
    const emptyResource = { ...fakeInstance, ports: [] } as OpenStackInstance;
    renderDialog(emptyResource);
    expect(
      await screen.findByText(
        'Instance is not connected to any internal subnets yet. Please connect it to internal subnet first.',
      ),
    ).toBeInTheDocument();
  });

  it('renders floating IPs table when remote data is fetched', async () => {
    renderDialog();
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
    // One row for initial floating IP
    expect(screen.getAllByRole('row')).toHaveLength(1);
  });

  it('renders subnet and address for allocated floating IP', async () => {
    renderDialog();
    await waitFor(() => {
      expect(
        screen.getByText('theses-and-papers-on-mach-sub-net'),
      ).toBeInTheDocument();
      expect(screen.getByText('172.17.65.174')).toBeInTheDocument();
    });
  });

  it('adds new row in table when Add button is clicked', async () => {
    const user = userEvent.setup();
    renderDialog();
    await waitFor(() => screen.getByText('Add'));
    await user.click(screen.getByText('Add'));
    expect(screen.getAllByRole('row')).toHaveLength(2);
  });

  it('fills inputs with default values when new row is added', async () => {
    const user = userEvent.setup();
    renderDialog();
    await waitFor(() => screen.getByText('Add'));
    await user.click(screen.getByText('Add'));

    const selects = screen.getAllByRole('combobox');
    // First select is for subnet in the new row
    expect(selects[0]).toHaveValue('');
    // Second select is for floating IP in the new row
    expect(selects[1]).toHaveValue('true'); // 'true' string because it's a select value
  });

  it('deletes existing row when Delete button is clicked', async () => {
    const user = userEvent.setup();
    renderDialog();
    await screen.findByRole('table');
    const deleteButton = screen.getByRole('button', { name: /Remove/i });
    await user.click(deleteButton);
    expect(
      screen.getByText('Instance does not have any floating IPs yet.'),
    ).toBeInTheDocument();
  });

  it('sends REST API request when form is being submitted', async () => {
    const user = userEvent.setup();
    vi.mocked(openstackInstancesUpdateFloatingIps).mockResolvedValue({} as any);
    renderDialog();

    const submitButton = await screen.findByText('Submit');
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    await user.click(submitButton);

    await waitFor(() => {
      expect(openstackInstancesUpdateFloatingIps).toHaveBeenCalledWith({
        path: { uuid: fakeInstance.uuid },
        body: {
          floating_ips: [
            {
              subnet: fakeInstance.floating_ips[0].subnet,
              url: fakeInstance.floating_ips[0].url,
            },
          ],
        },
      });
    });
  });

  it('allows to add floating IP', async () => {
    const user = userEvent.setup();
    vi.mocked(loadFloatingIps).mockResolvedValue(fakeFloatingIPs);
    vi.mocked(openstackInstancesUpdateFloatingIps).mockResolvedValue({} as any);
    renderDialog();

    await screen.findByRole('table');

    const deleteButton = screen.getByRole('button', { name: /Remove/i });
    await user.click(deleteButton);

    const addButton = await screen.findByText('Add');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getAllByRole('combobox')).toHaveLength(2);
    });

    const selects = screen.getAllByRole('combobox');
    const subnet = '/api/openstack-subnets/7350f289a6d14e4bbd780ee59b2899e6/';
    const floating_ip =
      '/api/openstack-floating-ips/377b9ffae7c24783a204ec37c505710c/';

    await user.selectOptions(selects[0], subnet);
    await user.selectOptions(selects[1], floating_ip);

    const submitButton = screen.getByText('Submit');
    await user.click(submitButton);

    await waitFor(() => {
      expect(openstackInstancesUpdateFloatingIps).toHaveBeenCalledWith({
        path: { uuid: fakeInstance.uuid },
        body: {
          floating_ips: [
            {
              subnet,
              url: floating_ip,
            },
          ],
        },
      });
    });
  });
});
