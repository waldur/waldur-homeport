import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import { expect, userEvent, within } from 'storybook/test';

import { CategorySidebar, CategorySelection } from './CategorySidebar';

const mockCategories = [
  {
    uuid: 'cat-vm',
    title: 'Virtual Machines',
    icon: null,
    offering_count: 14,
    group: null,
  },
  {
    uuid: 'cat-storage',
    title: 'Block Storage',
    icon: null,
    offering_count: 8,
    group: null,
  },
  {
    uuid: 'grp-cloud',
    title: 'Cloud Infrastructure',
    icon: null,
    offering_count: 22,
    categories: [
      {
        uuid: 'cat-openstack',
        title: 'OpenStack Tenant',
        icon: null,
        offering_count: 12,
      },
      {
        uuid: 'cat-k8s',
        title: 'Kubernetes Cluster',
        icon: null,
        offering_count: 10,
      },
    ],
  },
  {
    uuid: 'cat-consulting',
    title: 'Consultancy & Support',
    icon: null,
    offering_count: 3,
    group: null,
  },
];

const Harness = ({
  initialSelected = null,
  categoriesData = mockCategories,
  isLoading = false,
}: {
  initialSelected?: CategorySelection | null;
  categoriesData?: any;
  isLoading?: boolean;
}) => {
  const [selected, setSelected] = useState<CategorySelection | null>(
    initialSelected,
  );
  const queryClient = useMemo(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
      },
    });
    if (!isLoading) {
      client.setQueryData(['useCategories', {}], categoriesData);
    }
    return client;
  }, [isLoading, categoriesData]);

  const store = useMemo(
    () =>
      configureStore()({
        marketplace: {
          filters: {
            filtersStorage: [],
          },
        },
      }),
    [],
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <div className="w-[300px] p-4">
          <CategorySidebar
            selectedCategory={selected}
            onCategorySelect={setSelected}
          />
        </div>
      </QueryClientProvider>
    </Provider>
  );
};

const meta: Meta<typeof CategorySidebar> = {
  title: 'Marketplace/Landing/CategorySidebar',
  component: CategorySidebar,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Marketplace category sidebar navigation. Migrated from react-bootstrap ListGroup to semantic navigation with category-nav-item buttons, badge counts, and group nesting.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof CategorySidebar>;

export const AllCategoriesSelected: Story = {
  render: () => <Harness initialSelected={null} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const allBtn = canvas.getByRole('button', { name: /All categories/i });
    await expect(allBtn).toHaveClass('active');

    // Click on Virtual Machines
    const vmBtn = canvas.getByRole('button', { name: /Virtual Machines/i });
    await expect(vmBtn).not.toHaveClass('active');
    await userEvent.click(vmBtn);
    await expect(vmBtn).toHaveClass('active');
    await expect(allBtn).not.toHaveClass('active');
  },
};

export const SpecificCategorySelected: Story = {
  render: () => (
    <Harness initialSelected={{ uuid: 'cat-storage', isGroup: false }} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const storageBtn = canvas.getByRole('button', { name: /Block Storage/i });
    await expect(storageBtn).toHaveClass('active');

    const allBtn = canvas.getByRole('button', { name: /All categories/i });
    await expect(allBtn).not.toHaveClass('active');

    // Toggle off by clicking again
    await userEvent.click(storageBtn);
    await expect(allBtn).toHaveClass('active');
  },
};

export const GroupAndNestedCategories: Story = {
  render: () => (
    <Harness initialSelected={{ uuid: 'cat-openstack', isGroup: false }} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openstackBtn = canvas.getByRole('button', {
      name: /OpenStack Tenant/i,
    });
    await expect(openstackBtn).toHaveClass('active');
    await expect(openstackBtn).toHaveClass('ps-4');

    const cloudGroupBtn = canvas.getByRole('button', {
      name: /Cloud Infrastructure/i,
    });
    await expect(cloudGroupBtn).not.toHaveClass('active');
  },
};

export const LoadingState: Story = {
  render: () => <Harness isLoading={true} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const spinner = canvas.getByRole('status');
    await expect(spinner).toBeInTheDocument();
  },
};
