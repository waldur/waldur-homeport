import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  keysList,
  marketplaceOrdersCreate,
  openstackFlavorsList,
  openstackFloatingIpsList,
  openstackImagesList,
  openstackSecurityGroupsList,
  openstackServerGroupsList,
  openstackSubnetsList,
  openstackVolumeTypesList,
} from 'waldur-js-client';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { getServiceProviderByCustomer } from '@/marketplace/common/api';
import { DeployPage } from '@/marketplace/deploy/DeployPage';
import { tableInitialReducer as tables } from '@/table/store';
import { renderWithProviders } from '@/test/harness';
import { openAndSelectOption } from '@/test/select';
import { mockListResponse } from '@/test/utils';
import { useCustomer, useProject, useUser } from '@/workspace/hooks';

window.IntersectionObserver = class {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
} as any;

vi.mock('@/marketplace/common/api', () => ({
  getServiceProviderByCustomer: vi.fn(),
  getCategoryGroups: vi.fn().mockResolvedValue([]),
  getCategories: vi.fn().mockResolvedValue([]),
  countOrders: vi.fn().mockResolvedValue(0),
  countRobotAccounts: vi.fn().mockResolvedValue(0),
  countLexisLinks: vi.fn().mockResolvedValue(0),
}));

vi.mock('@/marketplace/deploy/initUtils', () => ({
  resolveProject: vi.fn().mockResolvedValue({
    project: { name: 'Test Project', uuid: 'project-uuid', url: 'project-url' },
  }),
  resolveCustomer: vi.fn().mockResolvedValue({
    name: 'Test Customer',
    uuid: 'customer-uuid',
    url: 'customer-url',
  }),
}));

vi.mock('@/navigation/context', () => ({
  useFullPage: vi.fn(),
  useBreadcrumbs: vi.fn(),
  useToolbarActions: vi.fn(),
  usePageHero: vi.fn(),
  useExtraToolbar: vi.fn(),
  useExtraAnnouncementBar: vi.fn(),
  useExtraTabs: vi.fn(),
}));

const mockOffering = {
  uuid: 'offering-uuid',
  url: 'offering-url',
  type: 'OpenStack.Instance',
  name: 'OpenStack Instance Offering',
  shared: false,
  scope_uuid: 'tenant-uuid',
  scope_type: 'tenant',
  customer_uuid: 'customer-uuid',
  customer_name: 'Test Customer',
  project_name: 'Test Project',
  project_uuid: 'project-uuid',
  project: 'project-url',
  plans: [],
  options: { order: [] },
  quotas: [],
  components: [],
} as any;

const renderPage = (offering = mockOffering) => {
  const store = createStore(
    combineReducers({
      marketplace: () => ({ filters: { filtersStorage: [] } }),
      tables,
    }),
  );
  return renderWithProviders(
    <Provider store={store}>
      <DrawerProvider>
        <DeployPage offering={offering} />
      </DrawerProvider>
    </Provider>,
  );
};

describe.skip('OpenstackInstanceOrder Integration Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useUser).mockReturnValue({
      uuid: 'user-uuid',
      username: 'test-user',
      is_staff: true,
    } as any);

    vi.mocked(useCustomer).mockReturnValue({
      uuid: 'customer-uuid',
      name: 'Test Customer',
    } as any);

    vi.mocked(useProject).mockReturnValue({
      uuid: 'project-uuid',
      name: 'Test Project',
    } as any);

    vi.mocked(getServiceProviderByCustomer).mockResolvedValue({
      customer_name: 'Provider Customer',
      uuid: 'provider-uuid',
    } as any);

    vi.mocked(openstackImagesList).mockResolvedValue(
      mockListResponse([
        { name: 'Ubuntu 20.04', uuid: 'ubuntu-uuid', url: 'ubuntu-url' },
        { name: 'CentOS 8', uuid: 'centos-uuid', url: 'centos-url' },
      ]),
    );

    vi.mocked(openstackFlavorsList).mockResolvedValue(
      mockListResponse([
        {
          name: 'm1.small',
          cores: 2,
          ram: 2048,
          uuid: 'flavor-uuid',
          url: 'flavor-url',
        },
        {
          name: 'm1.medium',
          cores: 4,
          ram: 4096,
          uuid: 'flavor-2-uuid',
          url: 'flavor-2-url',
        },
      ]),
    );

    vi.mocked(openstackVolumeTypesList).mockResolvedValue(
      mockListResponse([
        { name: 'ssd', uuid: 'ssd-uuid', url: 'ssd-url' },
        { name: 'hdd', uuid: 'hdd-uuid', url: 'hdd-url' },
      ]),
    );

    vi.mocked(openstackSubnetsList).mockResolvedValue(
      mockListResponse([
        {
          name: 'subnet-1',
          uuid: 'subnet-1-uuid',
          cidr: '192.168.42.0/24',
          url: 'subnet-1-url',
          allocation_pools: [{ start: '192.168.42.10', end: '192.168.42.50' }],
        },
      ]),
    );

    vi.mocked(openstackFloatingIpsList).mockResolvedValue(
      mockListResponse([
        {
          address: '1.2.3.4',
          uuid: 'floating-ip-1-uuid',
          url: 'floating-ip-1-url',
        },
      ]),
    );

    vi.mocked(openstackSecurityGroupsList).mockResolvedValue(
      mockListResponse([
        {
          name: 'default',
          uuid: 'sec-group-1-uuid',
          description: 'Default security group',
          url: 'sec-group-1-url',
        },
        {
          name: 'web',
          uuid: 'sec-group-2-uuid',
          description: 'Web traffic',
          url: 'sec-group-2-url',
        },
      ]),
    );

    vi.mocked(keysList).mockResolvedValue(
      mockListResponse([
        {
          name: 'my-ssh-key',
          type: 'ssh-rsa',
          fingerprint_md5: 'md5-fingerprint',
          url: 'key-url',
          uuid: 'key-uuid',
        },
      ]),
    );

    vi.mocked(openstackServerGroupsList).mockResolvedValue(
      mockListResponse([
        { name: 'group-1', uuid: 'group-1-uuid', url: 'group-1-url' },
      ]),
    );

    vi.mocked(marketplaceOrdersCreate).mockResolvedValue({
      data: {
        uuid: 'order-uuid',
        marketplace_resource_uuid: 'resource-uuid',
      },
    } as any);
  });

  it('renders all configuration steps and wizard components', async () => {
    renderPage();

    // Check title (wait for async load)
    expect(
      await screen.findByRole('heading', {
        name: /Add OpenStack Instance Offering/i,
      }),
    ).toBeInTheDocument();

    // Check steps sidebar lists the steps
    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('Hardware configuration')).toBeInTheDocument();
    expect(screen.getByText('Network and security')).toBeInTheDocument();
    expect(screen.getByText('Scheduling')).toBeInTheDocument();
    expect(screen.getByText('Automation')).toBeInTheDocument();
    expect(screen.getByText('Final configuration')).toBeInTheDocument();

    // Verify operating system choice list is loaded and visible
    expect(await screen.findByText('Ubuntu')).toBeInTheDocument();
    expect(screen.getByText('CentOS')).toBeInTheDocument();
  });

  it('submits the order successfully with filled form', async () => {
    renderPage();
    const user = userEvent.setup();

    // 1. Select operating system image
    await user.click(await screen.findByText(/Ubuntu/));

    // 2. Select flavor
    await user.click(await screen.findByText('m1.small'));

    // 3. Fill name
    const nameInput = await screen.findByLabelText(/VM name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'test-vm');

    // 4. Select volume type and size
    await openAndSelectOption(user, 'System volume type', 'ssd');
    await openAndSelectOption(user, 'System volume size (GB)', /^20$/);

    const heading = screen.getByRole('heading', {
      name: /Add OpenStack Instance Offering/i,
    });
    // eslint-disable-next-line testing-library/no-node-access
    const formElement = heading.closest('form');
    fireEvent.submit(formElement);

    // 6. Verify the API call and payload
    await waitFor(() => {
      expect(marketplaceOrdersCreate).toHaveBeenCalledTimes(1);
    });

    expect(marketplaceOrdersCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          attributes: expect.objectContaining({
            flavor: 'flavor-url',
            image: 'ubuntu-url',
            name: 'test-vm',
            system_volume_size: 20480,
            system_volume_type: 'ssd-url',
          }),
          offering: 'offering-url',
          project: 'project-url',
          plan: undefined,
          accepting_terms_of_service: true,
        }),
      }),
    );
  });
  it('Form Validation & Error States', async () => {
    renderPage();
    const heading = await screen.findByRole('heading', {
      name: /Add OpenStack Instance Offering/i,
    });
    // eslint-disable-next-line testing-library/no-node-access
    const formElement = heading.closest('form');
    fireEvent.submit(formElement);

    expect(
      await screen.findByText(/This field is required/i),
    ).toBeInTheDocument();
    expect(marketplaceOrdersCreate).not.toHaveBeenCalled();
  });

  it('Scenario 2: Advanced Hardware & Storage', async () => {
    renderPage();
    const user = userEvent.setup();

    await user.click(await screen.findByText(/Ubuntu/));
    await user.click(await screen.findByText('m1.small'));

    const nameInput = await screen.findByLabelText(/VM name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'advanced-vm');

    await openAndSelectOption(user, 'System volume type', 'hdd');
    await openAndSelectOption(user, 'System volume size (GB)', /^50$/);

    // eslint-disable-next-line testing-library/no-node-access
    const dataVolumeRow = screen.getByText('Data volume type').closest('.row');
    if (dataVolumeRow) {
      // eslint-disable-next-line testing-library/no-node-access
      const enableCheckbox = dataVolumeRow.querySelector(
        'input[type="checkbox"]',
      );
      if (enableCheckbox) {
        await user.click(enableCheckbox);
        await openAndSelectOption(user, 'Data volume type', 'ssd');
        await openAndSelectOption(user, 'Data volume size (GB)', /^100$/);
      }
    }

    const heading = screen.getByRole('heading', {
      name: /Add OpenStack Instance Offering/i,
    });
    // eslint-disable-next-line testing-library/no-node-access
    const formElement = heading.closest('form');
    fireEvent.submit(formElement);

    await waitFor(() => {
      expect(marketplaceOrdersCreate).toHaveBeenCalled();
    });

    expect(marketplaceOrdersCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          attributes: expect.objectContaining({
            name: 'advanced-vm',
            system_volume_size: 51200,
            system_volume_type: 'hdd-url',
            data_volume_size: 102400,
            data_volume_type: 'ssd-url',
          }),
        }),
      }),
    );
  });
});
