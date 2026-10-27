import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  memoryLocationPlugin,
  servicesPlugin,
  UIRouter,
  UIRouterReact,
} from '@uirouter/react';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { BaseButton } from 'waldur-ui';

import { setupAuthCore } from '@/core/authCoreSetup';
import { useModal } from '@/modal/actions';
import { ModalProvider } from '@/modal/ModalContext';
import { ModalRoot } from '@/modal/ModalRoot';

import { RECENTLY_ADDED_OFFERINGS_UUID } from './constants';
import { MarketplacePopup } from './MarketplacePopup';

// --- Fixtures ---------------------------------------------------------------

const mockCustomer = {
  uuid: 'cust-1',
  name: 'Acme Corporation',
  abbreviation: 'ACME',
  email: 'admin@acme.example',
  url: 'http://localhost:8080/api/customers/cust-1/',
} as any;

const mockProject = {
  uuid: 'proj-1',
  name: 'Cloud Infrastructure',
  customer_uuid: 'cust-1',
  customer_name: 'Acme Corporation',
  url: 'http://localhost:8080/api/projects/proj-1/',
} as any;

const GROUP_COMPUTE_URL =
  'http://localhost:8080/api/marketplace-category-groups/group-compute/';

const mockCategoryGroups = [
  {
    uuid: 'group-compute',
    title: 'Compute services',
    url: GROUP_COMPUTE_URL,
    icon: null,
  },
];

const mockCategories = [
  {
    uuid: 'cat-vm',
    title: 'Virtual Machines',
    offering_count: 3,
    icon: null,
    group: GROUP_COMPUTE_URL,
    url: 'http://localhost:8080/api/marketplace-categories/cat-vm/',
  },
  {
    uuid: 'cat-gpu',
    title: 'GPU Instances',
    offering_count: 2,
    icon: null,
    group: GROUP_COMPUTE_URL,
    url: 'http://localhost:8080/api/marketplace-categories/cat-gpu/',
  },
  {
    uuid: 'cat-storage',
    title: 'Block Storage',
    offering_count: 2,
    icon: null,
    url: 'http://localhost:8080/api/marketplace-categories/cat-storage/',
  },
  {
    uuid: 'cat-k8s',
    title: 'Kubernetes Clusters',
    offering_count: 1,
    icon: null,
    url: 'http://localhost:8080/api/marketplace-categories/cat-k8s/',
  },
];

const mockRecentOfferings = [
  {
    uuid: 'offering-vm-1',
    name: 'General Purpose VM (4 vCPU, 16 GB)',
    description: 'High performance compute node backed by enterprise SSD.',
    image: null,
    state: 'Active',
    category_uuid: 'cat-vm',
    category_title: 'Virtual Machines',
    customer_uuid: 'cust-1',
    customer_name: 'Acme Corporation',
  },
  {
    uuid: 'offering-storage-1',
    name: 'Fast NVMe Block Volume',
    description: 'Ultra-low latency replicated storage volume for databases.',
    image: null,
    state: 'Active',
    category_uuid: 'cat-storage',
    category_title: 'Block Storage',
    customer_uuid: 'cust-1',
    customer_name: 'Acme Corporation',
  },
];

const mockCategoryOfferings = [
  {
    uuid: 'offering-storage-1',
    name: 'Fast NVMe Block Volume',
    description: 'Ultra-low latency replicated storage volume for databases.',
    image: null,
    state: 'Active',
    category_uuid: 'cat-storage',
    category_title: 'Block Storage',
    customer_uuid: 'cust-1',
    customer_name: 'Acme Corporation',
  },
  {
    uuid: 'offering-storage-2',
    name: 'Standard HDD Cold Archive',
    description: 'Cost effective block storage for infrequently accessed data.',
    image: null,
    state: 'Active',
    category_uuid: 'cat-storage',
    category_title: 'Block Storage',
    customer_uuid: 'cust-1',
    customer_name: 'Acme Corporation',
  },
  {
    uuid: 'offering-storage-paused',
    name: 'Legacy Ceph Pool',
    description: 'Storage pool awaiting migration to new Ceph Quincy cluster.',
    image: null,
    state: 'Paused',
    paused_reason: 'Cluster maintenance',
    category_uuid: 'cat-storage',
    category_title: 'Block Storage',
    customer_uuid: 'cust-1',
    customer_name: 'Acme Corporation',
  },
];

// --- Harness ---------------------------------------------------------------

const createQueryClient = (
  categories = mockCategories,
  groups = mockCategoryGroups,
  recent = mockRecentOfferings,
) => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  client.setQueryData(['MarketplaceCategoryGroups'], groups);
  client.setQueryData(
    ['MarketplacePopupCategories', '', mockCustomer.uuid, mockProject.uuid],
    categories,
  );
  client.setQueryData(
    ['MarketplacePopupCategories', '', undefined, undefined],
    categories,
  );

  [
    null,
    undefined,
    'cat-storage',
    'cat-vm',
    RECENTLY_ADDED_OFFERINGS_UUID,
  ].forEach((catId) => {
    client.setQueryData(
      [
        'MarketplacePopupNOfferings',
        mockCustomer.uuid,
        mockProject.uuid,
        catId,
      ],
      recent,
    );
    client.setQueryData(
      ['MarketplacePopupNOfferings', undefined, undefined, catId],
      recent,
    );
  });

  return client;
};

const createMockStore = () =>
  configureStore()({
    workspace: {
      user: { uuid: 'user-1', full_name: 'John Doe', is_staff: true },
      customer: mockCustomer,
      project: mockProject,
    },
    tables: {},
    marketplace: { filters: { filtersStorage: [] } },
  });

const StoryRouter = ({ children }: { children: ReactNode }) => {
  const router = useMemo(() => {
    const instance = new UIRouterReact();
    instance.plugin(servicesPlugin);
    instance.plugin(memoryLocationPlugin);
    instance.stateRegistry.register({ name: 'home', url: '/' });
    instance.stateRegistry.register({
      name: 'marketplace-offering-public',
      url: '/marketplace-offering-public/:offering_uuid/',
    });
    return instance;
  }, []);
  return <UIRouter router={router}>{children}</UIRouter>;
};

const PopupHarness = ({
  children,
  categories = mockCategories,
  groups = mockCategoryGroups,
  recent = mockRecentOfferings,
}: {
  children: ReactNode;
  categories?: typeof mockCategories;
  groups?: typeof mockCategoryGroups;
  recent?: typeof mockRecentOfferings;
}) => {
  setupAuthCore();
  const [store] = useState(createMockStore);
  const [queryClient] = useState(() =>
    createQueryClient(categories, groups, recent),
  );

  useEffect(() => {
    const origFetch = window.fetch;
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof Request
            ? input.url
            : input.toString();

      if (url.includes('/marketplace-public-offerings')) {
        return Promise.resolve(
          new Response(JSON.stringify(mockCategoryOfferings), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'x-result-count': String(mockCategoryOfferings.length),
            },
          }),
        );
      }
      if (url.includes('/marketplace-categories')) {
        return Promise.resolve(
          new Response(JSON.stringify(categories), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'x-result-count': String(categories.length),
            },
          }),
        );
      }
      if (url.includes('/marketplace-category-groups')) {
        return Promise.resolve(
          new Response(JSON.stringify(groups), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }
      if (url.includes('/customers')) {
        return Promise.resolve(
          new Response(JSON.stringify([mockCustomer]), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'x-result-count': '1',
            },
          }),
        );
      }
      if (url.includes('/projects')) {
        return Promise.resolve(
          new Response(JSON.stringify([mockProject]), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'x-result-count': '1',
            },
          }),
        );
      }
      return origFetch(input, init);
    };

    return () => {
      window.fetch = origFetch;
    };
  }, [categories, groups]);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StoryRouter>
          <ModalProvider>
            <ModalRoot />
            {children}
          </ModalProvider>
        </StoryRouter>
      </QueryClientProvider>
    </Provider>
  );
};

// --- Meta -------------------------------------------------------------------

const meta: Meta<typeof MarketplacePopup> = {
  title: 'Navigation/MarketplacePopup',
  component: MarketplacePopup,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof MarketplacePopup>;

// --- Stories ----------------------------------------------------------------

export const Default: Story = {
  render: () => (
    <PopupHarness>
      <div className="mx-auto max-w-[840px]">
        <div className="relative flex flex-col rounded-xl bg-primary shadow-[var(--modal-shadow)]">
          <MarketplacePopup
            resolve={{
              organization: mockCustomer,
              project: mockProject,
            }}
          />
        </div>
      </div>
    </PopupHarness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify modal title & subtitle
    await expect(canvas.getByText('Add resource')).toBeVisible();
    await expect(
      canvas.getByText(
        'Select an organization and project, then choose a category, an offering, and follow the prompts',
      ),
    ).toBeVisible();

    // Verify pre-selected organization and project values
    await expect(canvas.getByText('Acme Corporation')).toBeVisible();
    await expect(canvas.getByText('Cloud Infrastructure')).toBeVisible();

    // Verify categories list is visible with counts
    await expect(
      await canvas.findByText('Recently added offerings'),
    ).toBeVisible();
    await expect(canvas.getByText('Compute services')).toBeVisible();
    await expect(canvas.getByText('Block Storage')).toBeVisible();

    // Expand category group to view sub-categories
    const computeGroup = canvas.getByRole('button', {
      name: /Compute services/,
    });
    await userEvent.click(computeGroup);
    await expect(await canvas.findByText('Virtual Machines')).toBeVisible();
    await expect(canvas.getByText('GPU Instances')).toBeVisible();
  },
};

export const CategoryPreselected: Story = {
  render: () => (
    <PopupHarness>
      <div className="mx-auto max-w-[840px]">
        <div className="relative flex flex-col rounded-xl bg-primary shadow-[var(--modal-shadow)] card-bordered">
          <MarketplacePopup
            resolve={{
              organization: mockCustomer,
              project: mockProject,
              categoryUuid: 'cat-storage',
            }}
          />
        </div>
      </div>
    </PopupHarness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Category should be active and Offerings column loaded
    await expect(canvas.getByText('Block Storage')).toBeVisible();
    await expect(await canvas.findByText('Offerings')).toBeVisible();
    await expect(
      await canvas.findByText('Fast NVMe Block Volume'),
    ).toBeVisible();
    await expect(canvas.getByText('Standard HDD Cold Archive')).toBeVisible();
  },
};

export const RecentlyAddedOfferings: Story = {
  render: () => (
    <PopupHarness>
      <div className="mx-auto max-w-[840px]">
        <div className="relative flex flex-col rounded-xl bg-primary shadow-[var(--modal-shadow)] card-bordered">
          <MarketplacePopup
            resolve={{
              organization: mockCustomer,
              project: mockProject,
              categoryUuid: RECENTLY_ADDED_OFFERINGS_UUID,
            }}
          />
        </div>
      </div>
    </PopupHarness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Recently added offerings panel should be active and list offerings
    await expect(
      await canvas.findByText('Recently added offerings'),
    ).toBeVisible();
    await expect(await canvas.findByText('Offerings')).toBeVisible();
    await expect(
      await canvas.findByText('Fast NVMe Block Volume'),
    ).toBeVisible();
  },
};

export const EmptyCategories: Story = {
  render: () => (
    <PopupHarness categories={[]} recent={[]}>
      <div className="mx-auto max-w-[840px]">
        <div className="relative flex flex-col rounded-xl bg-primary shadow-[var(--modal-shadow)] card-bordered">
          <MarketplacePopup
            resolve={{
              organization: mockCustomer,
              project: mockProject,
            }}
          />
        </div>
      </div>
    </PopupHarness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByText('There are no categories.'),
    ).toBeVisible();
  },
};

const TriggerHarness = () => {
  const { openDialog } = useModal();
  return (
    <div className="p-6 text-center">
      <BaseButton
        variant="primary"
        label="Open Marketplace Popup"
        onClick={() =>
          openDialog(MarketplacePopup, {
            size: 'lg',
            resolve: {
              organization: mockCustomer,
              project: mockProject,
            },
          })
        }
      />
    </div>
  );
};

export const OpenInModal: Story = {
  render: () => (
    <PopupHarness>
      <TriggerHarness />
    </PopupHarness>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: 'Open Marketplace Popup',
    });
    await userEvent.click(trigger);

    // Modal opens in real modal root overlay
    const dialog = within(await screen.findByRole('dialog'));
    await waitFor(() => expect(dialog.getByText('Add resource')).toBeVisible());
    await expect(dialog.getByText('Block Storage')).toBeVisible();

    // Clicking a category selects it and renders offerings
    const storageBtn = dialog.getByRole('button', { name: /Block Storage/ });
    await userEvent.click(storageBtn);
    await expect(await dialog.findByText('Offerings')).toBeVisible();
  },
};
